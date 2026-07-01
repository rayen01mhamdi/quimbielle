import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { prisma } from "../lib/prisma"
import { validateForm } from "@quimbielle/types"

const router = Router()

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { values, positions } = req.body
  if (!values || typeof values !== "object") {
    return res.status(400).json({ error: "Invalid form body." })
  }
  const errors = validateForm(values)
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed.", details: errors })
  }
  const form = await prisma.formRecord.create({
    data: { userId: req.user!.userId, values, positions: positions || [] },
  })
  res.status(201).json(form)
})

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const where = { userId: req.user!.userId }
  const forms = await prisma.formRecord.findMany({
    where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
  })
  const total = await prisma.formRecord.count({ where })
  res.json({ forms, total, page, limit, pages: Math.ceil(total / limit) })
})

router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const form = await prisma.formRecord.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  })
  if (!form) return res.status(404).json({ error: "Form not found." })
  res.json(form)
})

router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const form = await prisma.formRecord.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  })
  if (!form) return res.status(404).json({ error: "Form not found." })
  await prisma.formRecord.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router