import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6fb" }}>
      <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 20, padding: "2.5rem", width: "100%", maxWidth: 380, boxShadow: "0 2px 16px rgba(91,94,244,0.06)" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: "1.5rem", color: "#1a1f36" }}>
          Quim<span style={{ color: "#5b5ef4" }}>bielle</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "rgba(91,94,244,0.08)", border: "1px solid rgba(91,94,244,0.2)", color: "#5b5ef4", marginBottom: "1.5rem" }}>
          🔒 Secure login
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", color: "#1a1f36" }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: "#8892b0", margin: "0 0 2rem" }}>Sign in to your account to continue</p>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5580", display: "block", marginBottom: 6 }}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 14, border: "1px solid #dde2f0", borderRadius: 8, marginBottom: "1rem", outline: "none", color: "#1a1f36" }}
          />
          <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5580", display: "block", marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 14, border: "1px solid #dde2f0", borderRadius: 8, marginBottom: "1.5rem", outline: "none", color: "#1a1f36" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 11, background: loading ? "#a5a7f7" : "#5b5ef4", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <hr style={{ border: "none", borderTop: "1px solid #dde2f0", margin: "1.5rem 0" }} />
        <p style={{ textAlign: "center", fontSize: 13, color: "#8892b0", margin: 0 }}>
          No account yet? <Link to="/register" style={{ color: "#5b5ef4", fontWeight: 600, textDecoration: "none" }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}