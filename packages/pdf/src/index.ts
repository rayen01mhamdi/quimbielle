import { jsPDF } from "jspdf"

export interface FieldPosition {
  key: string
  label?: string
  left: number
  top: number
  width: number
  height: number
}
export interface PDFOptions {
  inkColor?: string       // hex color e.g. "#000000"
  fontSize?: number       // default 8
  mode?: "overlay" | "corner" // corner = print calibration grid
  xOffset?: number        // printer X correction in cm
  yOffset?: number        // printer Y correction in cm
}

// Physical paper dimensions
const PAPER_W = 17.5 // cm
const PAPER_H = 11.5 // cm

// Convert percentage position to cm
function pctToX(pct: number, offset = 0): number {
  return (pct / 100) * PAPER_W + offset
}

function pctToY(pct: number, offset = 0): number {
  return (pct / 100) * PAPER_H + offset
}

// Arabic-unsafe keys — skip in PDF (no Arabic font embedded)
const SKIP_KEYS = ["montantLettreAr", "signatureTire", "signatureTireur", "aval", "acceptation"]

export function generateFilledPDF(
  values: Record<string, string>,
  fields: FieldPosition[],
  options: PDFOptions = {}
): jsPDF {
  const {
    fontSize = 8,
    inkColor = "#000000",
    mode = "overlay",
    xOffset = 0,
    yOffset = 0,
  } = options

  const doc = new jsPDF({
    unit: "cm",
    format: [PAPER_W, PAPER_H],
    orientation: "landscape",
  })

  // Set ink color
  const r = parseInt(inkColor.slice(1, 3), 16)
  const g = parseInt(inkColor.slice(3, 5), 16)
  const b = parseInt(inkColor.slice(5, 7), 16)
  doc.setTextColor(r, g, b)
  doc.setFontSize(fontSize)

  if (mode === "corner") {
    // Print calibration grid — 1cm squares
    doc.setDrawColor(180, 180, 180)
    for (let x = 0; x <= PAPER_W; x++) {
      doc.line(x, 0, x, PAPER_H)
    }
    for (let y = 0; y <= PAPER_H; y++) {
      doc.line(0, y, PAPER_W, y)
    }
    doc.setFontSize(6)
    for (let x = 0; x < PAPER_W; x++) {
      for (let y = 0; y < PAPER_H; y++) {
        doc.text(`${x},${y}`, x + 0.1, y + 0.4)
      }
    }
    return doc
  }

  // Overlay mode — print field values
  fields.forEach(f => {
    if (SKIP_KEYS.includes(f.key)) return
    const val = values[f.key] || ""
    if (!val) return

    const x = pctToX(f.left, xOffset)
    const y = pctToY(f.top, yOffset) + 0.35 // baseline offset

    // Wrap long text to fit within field width
    const maxWidth = (f.width / 100) * PAPER_W - 0.1
    const lines = doc.splitTextToSize(val, maxWidth)
    doc.text(lines, x, y)
  })

  return doc
}

// Browser: triggers download
export function downloadPDF(
  values: Record<string, string>,
  fields: FieldPosition[],
  filename = "kambiale.pdf",
  options: PDFOptions = {}
): void {
  const doc = generateFilledPDF(values, fields, options)
  doc.save(filename)
}

// Server: returns Buffer for email/storage
export function generatePDFBuffer(
  values: Record<string, string>,
  fields: FieldPosition[],
  options: PDFOptions = {}
): Buffer {
  const doc = generateFilledPDF(values, fields, options)
  return Buffer.from(doc.output("arraybuffer"))
}

export { numToFr, numToAr } from "./words"