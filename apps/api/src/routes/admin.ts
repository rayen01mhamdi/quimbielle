import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { requireAdmin } from "../middleware/requireAdmin"
import { prisma } from "../lib/prisma"

const router = Router()

// GET /api/admin/users — all users
router.get("/users", authenticate, requireAdmin, async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  res.json(users)
})

// GET /api/admin/forms — all forms from all users
router.get("/forms", authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const forms = await prisma.formRecord.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: { user: { select: { email: true, name: true } } },
  })
  const total = await prisma.formRecord.count()
  res.json({ forms, total, page, pages: Math.ceil(total / limit) })
})

export default router