import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { generatePDFBuffer } from "@quimbielle/pdf"
import { getSettings, updateSettings } from "../services/settings.service"

const router = Router()

// GET /api/calibration/grid — download a 1cm grid PDF
router.get("/grid", authenticate, async (_req, res: Response) => {
  try {
    const buffer = generatePDFBuffer({}, [], { mode: "corner" })
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"calibration_grid.pdf\"",
      "Content-Length": buffer.length,
    })
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/calibration — get current calibration settings
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getSettings(req.user!.userId)
    res.json({ xOffset: settings.xOffset, yOffset: settings.yOffset })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/calibration — save calibration offsets
router.patch("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { xOffset, yOffset } = req.body
    const settings = await updateSettings(req.user!.userId, { xOffset, yOffset })
    res.json({ xOffset: settings.xOffset, yOffset: settings.yOffset })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router