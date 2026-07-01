import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { requireAdmin } from "../middleware/requireAdmin"
import { getAllUsers, getAllForms } from "../services/admin.service"

const router = Router()

router.get("/users", authenticate, requireAdmin, async (_req, res: Response) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/forms", authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const result = await getAllForms(page, limit)
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router