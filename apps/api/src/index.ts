import express from "express"
import cors from "cors"
import authRouter from "./routes/auth"
import formsRouter from "./routes/forms"
import { authenticate, AuthRequest } from "./middleware/authenticate"
import adminRouter from "./routes/admin"

const app = express()

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  allowedHeaders: ["Authorization", "Content-Type"]
}))
app.use(express.json())

app.use("/auth", authRouter)
app.use("/api/forms", formsRouter)
app.use("/api/admin", adminRouter)

app.get("/api/me", authenticate, (req: AuthRequest, res) => {
  res.json({ user: req.user })
})

app.listen(3000, () => console.log("API running on http://localhost:3000"))
