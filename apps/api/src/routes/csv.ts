import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { parseCSV, generateBatchZip } from "../services/csv.service"

const router = Router()

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { csv } = req.body
    if (!csv || typeof csv !== "string") {
      return res.status(400).json({ error: "CSV content required." })
    }

    const rows = parseCSV(csv)
    const validRows = rows.filter(r => r.valid)
    const invalidRows = rows.filter(r => !r.valid)

    if (validRows.length === 0) {
      return res.status(400).json({
        error: "No valid rows found.",
        invalid: invalidRows.map(r => ({ row: r.rowIndex, errors: r.errors }))
      })
    }

    const zipBuffer = await generateBatchZip(rows)

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="kambiale_batch.zip"`,
      "Content-Length": zipBuffer.length,
    })

    if (invalidRows.length > 0) {
      res.set("X-Invalid-Rows", JSON.stringify(
        invalidRows.map(r => ({ row: r.rowIndex, errors: r.errors }))
      ))
    }

    res.send(zipBuffer)
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process CSV." })
  }
})

export default router