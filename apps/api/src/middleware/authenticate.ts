import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface AuthRequest extends Request {
  user?: { userId: string; isAdmin: boolean }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token." })
  }
  const token = header.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; isAdmin: boolean }
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: "Token expired or invalid." })
  }
}