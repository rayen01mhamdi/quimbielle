import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"

export interface AuthResult {
  token: string
  user: { id: string; email: string; name: string; isAdmin: boolean }
}

export async function registerUser(email: string, name: string, password: string): Promise<AuthResult> {
  if (!email || !email.includes("@")) throw { status: 400, message: "Invalid email format." }
  if (!name || name.trim().length < 2) throw { status: 400, message: "Name is required." }
  if (!password || password.length < 8) throw { status: 400, message: "Password must be at least 8 characters." }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw { status: 409, message: "Email already in use." }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, name, passwordHash } })

  const token = jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  )

  return { token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  if (!email || !password) throw { status: 400, message: "Email and password are required." }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw { status: 401, message: "Invalid credentials." }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw { status: 401, message: "Invalid credentials." }

  const token = jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  )

  return { token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } }
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, isAdmin: true }
  })
  if (!user) throw { status: 404, message: "User not found." }
  return user
}