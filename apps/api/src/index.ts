import express from "express"
import cors from "cors"
import authRouter from "./routes/auth"
import formsRouter from "./routes/forms"
import adminRouter from "./routes/admin"
import settingsRouter from "./routes/settings"
import csvRouter from "./routes/csv"
import calibrationRouter from "./routes/calibration"
import { authenticate, AuthRequest } from "./middleware/authenticate"
import { prisma } from "./lib/prisma"

const app = express()

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  allowedHeaders: ["Authorization", "Content-Type"]
}))
app.use(express.json())

app.use("/auth", authRouter)
app.use("/api/forms", formsRouter)
app.use("/api/admin", adminRouter)
app.use("/api/settings", settingsRouter)
app.use("/api/forms/csv", csvRouter)
app.use("/api/calibration", calibrationRouter)
// Fix §1.6 — return DB user not JWT payload
app.get("/api/me", authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, isAdmin: true }
  })
  if (!user) return res.status(404).json({ error: "User not found." })
  res.json({ user })
})

app.get("/health", (_req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))