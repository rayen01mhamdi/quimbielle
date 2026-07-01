import { useState } from "react"
import { apiRequest } from "../api/client"

interface User {
  userId: string
  isAdmin: boolean
  name?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token")
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return { userId: payload.userId, isAdmin: payload.isAdmin }
    } catch {
      return null
    }
  })

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: { id: string; name: string; isAdmin: boolean } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem("token", data.token)
    setUser({ userId: data.user.id, isAdmin: data.user.isAdmin, name: data.user.name })
  }

  const register = async (email: string, name: string, password: string) => {
    const data = await apiRequest<{ token: string; user: { id: string; name: string; isAdmin: boolean } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    })
    localStorage.setItem("token", data.token)
    setUser({ userId: data.user.id, isAdmin: data.user.isAdmin, name: data.user.name })
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return { user, login, register, logout, isAuthenticated: !!user }
}