import { Router, Response } from "express"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { prisma } from "../lib/prisma"

const router = Router()

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  let settings = await prisma.userSettings.findUnique({
    where: { userId: req.user!.userId }
  })
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId: req.user!.userId }
    })
  }
  res.json(settings)
})

router.patch("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { inkColor, fontSize, pdfMode, xOffset, yOffset } = req.body
  const settings = await prisma.userSettings.upsert({
    where: { userId: req.user!.userId },
    update: { inkColor, fontSize, pdfMode, xOffset, yOffset },
    create: { userId: req.user!.userId, inkColor, fontSize, pdfMode, xOffset, yOffset },
  })
  res.json(settings)
})

export default router