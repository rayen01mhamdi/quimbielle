import { jsPDF } from "jspdf"
import type { FieldPosition, FormValues } from "@quimbielle/types"

const LETTER_WIDTH_CM = 17.5
const LETTER_HEIGHT_CM = 11.5

const FR_UNITS = [
  "zero",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
]

const FR_TENS = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"]

function frenchUnderHundred(value: number): string {
  if (value < 17) return FR_UNITS[value]
  if (value < 20) return `dix-${FR_UNITS[value - 10]}`
  if (value < 70) {
    const tens = Math.floor(value / 10)
    const unit = value % 10
    return unit === 0 ? FR_TENS[tens] : `${FR_TENS[tens]}-${FR_UNITS[unit]}`
  }
  if (value < 80) {
    const unit = value % 20
    return unit === 0 ? "soixante-dix" : `soixante-${frenchUnderHundred(10 + unit)}`
  }
  if (value < 100) {
    const unit = value % 20
    return unit === 0 ? "quatre-vingts" : `quatre-vingt-${FR_UNITS[unit]}`
  }
  return ""
}

function frenchUnderThousand(value: number): string {
  if (value < 100) return frenchUnderHundred(value)
  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const hundredWord = hundreds === 1 ? "cent" : `${FR_UNITS[hundreds]} cent`
  return remainder === 0 ? hundredWord : `${hundredWord} ${frenchUnderHundred(remainder)}`
}

export function numToFr(value: number): string {
  const integer = Math.round(value)
  if (!Number.isFinite(integer) || integer === 0) return "zero"
  const thousands = Math.floor(integer / 1000)
  const remainder = integer % 1000
  const parts: string[] = []
  if (thousands > 0) {
    parts.push(thousands === 1 ? "mille" : `${frenchUnderThousand(thousands)} mille`)
  }
  if (remainder > 0) {
    parts.push(frenchUnderThousand(remainder))
  }
  return parts.join(" ").trim()
}

const AR_UNITS = [
  "\u0635\u0641\u0631",
  "\u0648\u0627\u062d\u062f",
  "\u0627\u062b\u0646\u0627\u0646",
  "\u062b\u0644\u0627\u062b\u0629",
  "\u0623\u0631\u0628\u0639\u0629",
  "\u062e\u0645\u0633\u0629",
  "\u0633\u062a\u0629",
  "\u0633\u0628\u0639\u0629",
  "\u062b\u0645\u0627\u0646\u064a\u0629",
  "\u062a\u0633\u0639\u0629",
  "\u0639\u0634\u0631",
  "\u0623\u062d\u062f \u0639\u0634\u0631",
  "\u0627\u062b\u0646\u0627 \u0639\u0634\u0631",
  "\u062b\u0644\u0627\u062b\u0629 \u0639\u0634\u0631",
  "\u0623\u0631\u0628\u0639\u0629 \u0639\u0634\u0631",
  "\u062e\u0645\u0633\u0629 \u0639\u0634\u0631",
  "\u0633\u062a\u0629 \u0639\u0634\u0631",
  "\u0633\u0628\u0639\u0629 \u0639\u0634\u0631",
  "\u062b\u0645\u0627\u0646\u064a\u0629 \u0639\u0634\u0631",
  "\u062a\u0633\u0639\u0629 \u0639\u0634\u0631",
]

const AR_TENS = ["", "", "\u0639\u0634\u0631\u0648\u0646", "\u062b\u0644\u0627\u062b\u0648\u0646", "\u0623\u0631\u0628\u0639\u0648\u0646", "\u062e\u0645\u0633\u0648\u0646", "\u0633\u062a\u0648\u0646", "\u0633\u0628\u0639\u0648\u0646", "\u062b\u0645\u0627\u0646\u0648\u0646", "\u062a\u0633\u0639\u0648\u0646"]
const AR_HUNDREDS = ["", "\u0645\u0626\u0629", "\u0645\u0626\u062a\u0627\u0646", "\u062b\u0644\u0627\u062b\u0645\u0626\u0629", "\u0623\u0631\u0628\u0639\u0645\u0626\u0629", "\u062e\u0645\u0633\u0645\u0626\u0629", "\u0633\u062a\u0645\u0626\u0629", "\u0633\u0628\u0639\u0645\u0626\u0629", "\u062b\u0645\u0627\u0646\u0645\u0626\u0629", "\u062a\u0633\u0639\u0645\u0626\u0629"]

function arabicUnderHundred(value: number): string {
  if (value < 20) return AR_UNITS[value]
  const tens = Math.floor(value / 10)
  const unit = value % 10
  return unit === 0 ? AR_TENS[tens] : `${AR_UNITS[unit]} \u0648 ${AR_TENS[tens]}`
}

function arabicUnderThousand(value: number): string {
  if (value < 100) return arabicUnderHundred(value)
  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const hundredWord = AR_HUNDREDS[hundreds]
  return remainder === 0 ? hundredWord : `${hundredWord} \u0648 ${arabicUnderHundred(remainder)}`
}

export function numToAr(value: number): string {
  const integer = Math.round(value)
  if (!Number.isFinite(integer) || integer === 0) return "\u0635\u0641\u0631"
  const thousands = Math.floor(integer / 1000)
  const remainder = integer % 1000
  if (thousands === 0) return arabicUnderThousand(remainder)
  const thousandsLabel = thousands === 1 ? "\u0623\u0644\u0641" : `${arabicUnderThousand(thousands)} \u0623\u0644\u0641`
  return remainder === 0 ? thousandsLabel : `${thousandsLabel} \u0648 ${arabicUnderThousand(remainder)}`
}

export interface GeneratePdfOptions {
  a4Corner?: boolean
}

export function generateFilledPDF(values: FormValues, positions: FieldPosition[], options: GeneratePdfOptions = {}) {
  const pageWidth = options.a4Corner ? 21.0 : LETTER_WIDTH_CM
  const pageHeight = options.a4Corner ? 29.7 : LETTER_HEIGHT_CM
  const offsetX = options.a4Corner ? 1.0 : 0
  const offsetY = options.a4Corner ? 1.0 : 0
  const doc = new jsPDF({ unit: "cm", format: [pageWidth, pageHeight] })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)

  for (const position of positions) {
    const raw = values[position.key]
    if (raw === undefined) continue

    const x = offsetX + (position.left / 100) * LETTER_WIDTH_CM
    const y = offsetY + (position.top / 100) * LETTER_HEIGHT_CM
    const width = (position.width / 100) * LETTER_WIDTH_CM
    const height = (position.height / 100) * LETTER_HEIGHT_CM

    if (typeof raw === "boolean") {
      const boxSize = Math.min(0.6, width, height)
      const boxX = x + 0.1
      const boxY = y + 0.1
      doc.setLineWidth(0.2)
      doc.rect(boxX, boxY, boxSize, boxSize)
      if (raw) {
        doc.setLineWidth(0.4)
        doc.line(boxX + 0.08, boxY + 0.08, boxX + boxSize - 0.08, boxY + boxSize - 0.08)
        doc.line(boxX + 0.08, boxY + boxSize - 0.08, boxX + boxSize - 0.08, boxY + 0.08)
      }
      continue
    }

    const text = String(raw).trim()
    if (!text) continue
    const lines = doc.splitTextToSize(text, Math.max(0.1, width - 0.2))
    doc.text(lines, x + 0.1, y + 0.4, { maxWidth: width - 0.2, align: "left" })
  }

  const arrayBuffer = doc.output("arraybuffer")
  return new Uint8Array(arrayBuffer)
}
