import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { saveForm, listForms, getFormById, deleteForm, duplicateForm, getDefaultTemplate } from "../services/forms.service"

const router = Router()

router.get("/template", authenticate, async (_req, res: Response) => {
  try {
    const template = await getDefaultTemplate()
    res.json(template)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { values, positions, templateId } = req.body
    const form = await saveForm(req.user!.userId, values, positions, templateId)
    res.status(201).json(form)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message, details: err.details })
  }
})

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = req.query.search as string || ""
    const result = await listForms(req.user!.userId, page, limit, search)
    res.json(result)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await getFormById(req.params.id, req.user!.userId)
    res.json(form)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteForm(req.params.id, req.user!.userId)
    res.json(result)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.post("/:id/duplicate", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await duplicateForm(req.params.id, req.user!.userId)
    res.status(201).json(form)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

export default router