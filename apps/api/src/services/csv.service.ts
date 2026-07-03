import { parse } from "csv-parse/sync"
import JSZip from "jszip"
import { validateForm } from "@quimbielle/types"
import { generatePDFBuffer } from "@quimbielle/pdf"

export interface CSVRow {
  rowIndex: number
  values: Record<string, string>
  errors: Record<string, string>
  valid: boolean
}

const FIELD_COLUMNS = [
  "ordrePayer", "montant1", "echeance1", "ribTireur", "ribTire",
  "tireur", "lieuCreation", "dateCreation", "domiciliation",
  "nomAdresseTire", "lieuA", "valeurEn"
]

const DEFAULT_FIELDS = [
  { key: "ordrePayer",     left: 27.0, top: 32.5, width: 47.0, height: 5.5  },
  { key: "montant1",       left: 75.0, top: 23.5, width: 23.0, height: 5.5  },
  { key: "echeance1",      left: 47.0, top: 13.0, width: 9.0,  height: 4.5  },
  { key: "ribTireur",      left: 2.0,  top: 60.5, width: 42.0, height: 7.0  },
  { key: "ribTire",        left: 27.0, top: 22.5, width: 47.0, height: 4.5  },
  { key: "tireur",         left: 2.0,  top: 32.0, width: 23.0, height: 12.5 },
  { key: "lieuCreation",   left: 2.0,  top: 51.0, width: 15.0, height: 5.0  },
  { key: "dateCreation",   left: 18.0, top: 51.0, width: 17.0, height: 5.0  },
  { key: "domiciliation",  left: 82.0, top: 60.5, width: 16.0, height: 9.0  },
  { key: "nomAdresseTire", left: 45.0, top: 65.0, width: 37.0, height: 12.0 },
  { key: "lieuA",          left: 75.5, top: 13.0, width: 12.0, height: 4.5  },
  { key: "valeurEn",       left: 45.0, top: 60.5, width: 16.0, height: 4.0  },
]

export function parseCSV(csvContent: string): CSVRow[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  return records.map((record: any, i: number) => {
    const values: Record<string, string> = {}
    for (const key of FIELD_COLUMNS) {
      if (record[key]) values[key] = record[key]
    }
    const errors = validateForm(values)
    return { rowIndex: i + 1, values, errors, valid: Object.keys(errors).length === 0 }
  })
}

export async function generateBatchZip(rows: CSVRow[]): Promise<Buffer> {
  const zip = new JSZip()

  for (const row of rows) {
    if (!row.valid) continue
    const buffer = generatePDFBuffer(row.values, DEFAULT_FIELDS)
    zip.file(`kambiale_row_${row.rowIndex}.pdf`, buffer)
  }

  return await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
}