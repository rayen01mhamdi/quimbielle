import { Router, Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import rateLimit from "express-rate-limit"
import { prisma } from "../lib/prisma"

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many attempts, try again later." }
})

router.post("/register", authLimiter, async (req: Request, res: Response) => {
  const { email, name, password } = req.body
  if (!email || !email.includes("@")) return res.status(400).json({ error: "Invalid email format." })
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Name is required." })
  if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." })
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: "Email already in use." })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, name, passwordHash } })
  const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET!, { expiresIn: "7d" })
  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } })
})

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: "Invalid credentials." })
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: "Invalid credentials." })
  const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET!, { expiresIn: "7d" })
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } })
})

export default router