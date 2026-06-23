import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  createdAt: string
}

interface Form {
  id: string
  createdAt: string
  values: Record<string, string>
  user: { email: string; name: string }
}

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [tab, setTab] = useState<"users" | "forms">("users")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.isAdmin) { navigate("/dashboard"); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    const headers = { Authorization: `Bearer ${token}` }
    const [usersRes, formsRes] = await Promise.all([
      fetch("http://localhost:3000/api/admin/users", { headers }),
      fetch("http://localhost:3000/api/admin/forms", { headers }),
    ])
    const usersData = await usersRes.json()
    const formsData = await formsRes.json()
    setUsers(usersData)
    setForms(formsData.forms || [])
    setLoading(false)
  }

  const handleLogout = () => { logout(); navigate("/login") }

  if (!user?.isAdmin) return null

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #dde2f0", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1f36", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          Quim<span style={{ color: "#5b5ef4" }}>bielle</span>
        </span>
        <span style={{ fontSize: 12, background: "#5b5ef4", color: "#fff", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>ADMIN</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => navigate("/dashboard")} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>Dashboard</button>
        <button onClick={handleLogout} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>Déconnexion</button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1f36", marginBottom: 20 }}>Panneau d'administration</h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button onClick={() => setTab("users")} style={{ padding: "8px 18px", background: tab === "users" ? "#5b5ef4" : "#fff", color: tab === "users" ? "#fff" : "#4a5580", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Utilisateurs ({users.length})
          </button>
          <button onClick={() => setTab("forms")} style={{ padding: "8px 18px", background: tab === "forms" ? "#5b5ef4" : "#fff", color: tab === "forms" ? "#fff" : "#4a5580", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Tous les formulaires ({forms.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8892b0" }}>Chargement...</div>
        ) : tab === "users" ? (
          <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #dde2f0" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Nom</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Email</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Role</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #f0f2f9" : "none" }}>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 500, color: "#1a1f36" }}>{u.name}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#4a5580" }}>{u.email}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: u.isAdmin ? "rgba(91,94,244,0.1)" : "#f0f2f9", color: u.isAdmin ? "#5b5ef4" : "#8892b0" }}>
                        {u.isAdmin ? "Admin" : "Utilisateur"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#8892b0" }}>{new Date(u.createdAt).toLocaleDateString("fr-TN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #dde2f0" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Utilisateur</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Beneficiaire</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Montant</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: i < forms.length - 1 ? "1px solid #f0f2f9" : "none" }}>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#4a5580" }}>{f.user.name}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 500, color: "#1a1f36" }}>{f.values?.ordrePayer || "—"}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#1a1f36" }}>{f.values?.montant1 || "—"}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#8892b0" }}>{new Date(f.createdAt).toLocaleDateString("fr-TN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}