import { Router, Request, Response } from "express"
import rateLimit from "express-rate-limit"
import { registerUser, loginUser } from "../services/auth.service"

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many attempts, try again later." }
})

router.post("/register", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body
    const result = await registerUser(email, name, password)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error." })
  }
})

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const result = await loginUser(email, password)
    res.json(result)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error." })
  }
})

export default router