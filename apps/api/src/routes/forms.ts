import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { prisma } from "../lib/prisma"
import { validateForm } from "@quimbielle/types"

const router = Router()

// GET default template
router.get("/template", authenticate, async (_req, res: Response) => {
  const template = await prisma.formTemplate.findFirst({
    where: { name: "Lettre de Change — Kambiale" }
  })
  res.json(template)
})

// POST /api/forms — save a form
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { values, positions, templateId } = req.body

  if (!values || typeof values !== "object") {
    return res.status(400).json({ error: "Invalid form body." })
  }

  const errors = validateForm(values)
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed.", details: errors })
  }

  // Get template
  let tid = templateId
  if (!tid) {
    const template = await prisma.formTemplate.findFirst({
      where: { name: "Lettre de Change — Kambiale" }
    })
    if (!template) return res.status(400).json({ error: "No template found." })
    tid = template.id
  }

  // Save field positions per user
  if (positions && Array.isArray(positions)) {
    for (const pos of positions) {
      await prisma.fieldPosition.upsert({
        where: { userId_templateId_fieldKey: { userId: req.user!.userId, templateId: tid, fieldKey: pos.key } },
        update: { left: pos.left, top: pos.top, width: pos.width, height: pos.height },
        create: { userId: req.user!.userId, templateId: tid, fieldKey: pos.key, left: pos.left, top: pos.top, width: pos.width, height: pos.height },
      })
    }
  }

  const form = await prisma.form.create({
    data: {
      userId: req.user!.userId,
      templateId: tid,
      beneficiary: values.ordrePayer || "",
      amount: parseFloat(values.montant1) || 0,
      dueDate: values.echeance1 || "",
      ribTireur: values.ribTireur || "",
      ribTire: values.ribTire || "",
      lieuCreation: values.lieuCreation || "",
      dateCreation: values.dateCreation || "",
      status: "DRAFT",
      fieldValues: values,
    },
  })

  res.status(201).json(form)
})

// GET /api/forms — list with pagination + search
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const search = req.query.search as string || ""

  const where: any = { userId: req.user!.userId }
  if (search) {
    where.beneficiary = { contains: search, mode: "insensitive" }
  }

  const forms = await prisma.form.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      beneficiary: true,
      amount: true,
      dueDate: true,
      status: true,
      createdAt: true,
      fieldValues: true,
    }
  })

  const total = await prisma.form.count({ where })
  res.json({ forms, total, page, limit, pages: Math.ceil(total / limit) })
})

// GET /api/forms/:id — get one form with positions
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const form = await prisma.form.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  })
  if (!form) return res.status(404).json({ error: "Form not found." })

  // Also get saved positions for this user
  const positions = await prisma.fieldPosition.findMany({
    where: { userId: req.user!.userId, templateId: form.templateId }
  })

  res.json({ ...form, values: form.fieldValues, positions: positions.map(p => ({ key: p.fieldKey, left: p.left, top: p.top, width: p.width, height: p.height })) })
})

// DELETE /api/forms/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const form = await prisma.form.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  })
  if (!form) return res.status(404).json({ error: "Form not found." })
  await prisma.form.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

// POST /api/forms/:id/duplicate
router.post("/:id/duplicate", authenticate, async (req: AuthRequest, res: Response) => {
  const original = await prisma.form.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  })
  if (!original) return res.status(404).json({ error: "Form not found." })

  const duplicate = await prisma.form.create({
    data: {
      userId: original.userId,
      templateId: original.templateId,
      beneficiary: original.beneficiary,
      amount: original.amount,
      dueDate: original.dueDate,
      ribTireur: original.ribTireur,
      ribTire: original.ribTire,
      lieuCreation: original.lieuCreation,
      dateCreation: original.dateCreation,
      status: "DRAFT",
      fieldValues: original.fieldValues as any,
    }
  })

  res.status(201).json(duplicate)
})

export default router