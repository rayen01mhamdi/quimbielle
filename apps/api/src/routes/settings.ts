import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { getSettings, updateSettings } from "../services/settings.service"

const router = Router()

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getSettings(req.user!.userId)
    res.json(settings)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.patch("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await updateSettings(req.user!.userId, req.body)
    res.json(settings)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router