import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

interface FormRecord {
  id: string
  createdAt: string
  values: Record<string, string>
}

export default function History() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [forms, setForms] = useState<FormRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchForms = async (p = 1) => {
    setLoading(true)
    const token = localStorage.getItem("token")
    const res = await fetch(`http://localhost:3000/api/forms?page=${p}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setForms(data.forms)
    setTotal(data.total)
    setPage(p)
    setLoading(false)
  }

  useEffect(() => { fetchForms() }, [])

  const deleteForm = async (id: string) => {
    if (!confirm("Supprimer ce formulaire ?")) return
    const token = localStorage.getItem("token")
    await fetch(`http://localhost:3000/api/forms/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchForms(page)
  }

  const reopenForm = (id: string) => {
    navigate(`/dashboard?formId=${id}`)
  }

  const handleLogout = () => { logout(); navigate("/login") }

  const pages = Math.ceil(total / 10)

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #dde2f0", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1f36", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          Quim<span style={{ color: "#5b5ef4" }}>bielle</span>
        </span>
        <span style={{ flex: 1 }} />
        <button onClick={() => navigate("/dashboard")} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>
          ← Nouveau formulaire
        </button>
        <button onClick={handleLogout} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>
          Déconnexion
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1f36", flex: 1 }}>Historique des formulaires</h1>
          <span style={{ fontSize: 13, color: "#8892b0" }}>{total} formulaire{total !== 1 ? "s" : ""} au total</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8892b0" }}>Chargement...</div>
        ) : forms.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#8892b0", background: "#fff", borderRadius: 16, border: "1px solid #dde2f0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <div style={{ fontWeight: 600 }}>Aucun formulaire enregistré</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Créez votre premier formulaire Kambiale</div>
            <button onClick={() => navigate("/dashboard")} style={{ marginTop: 16, padding: "8px 20px", background: "#5b5ef4", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              Créer un formulaire
            </button>
          </div>
        ) : (
          <>
            <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #dde2f0" }}>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Bénéficiaire</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Montant</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Échéance</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Date création</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form, i) => (
                    <tr key={form.id} style={{ borderBottom: i < forms.length - 1 ? "1px solid #f0f2f9" : "none" }}>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#1a1f36", fontWeight: 500 }}>
                        {form.values?.ordrePayer || form.values?.beneficiaire || "—"}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#1a1f36" }}>
                        {form.values?.montant1 || "—"}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#1a1f36" }}>
                        {form.values?.echeance1 || "—"}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#8892b0" }}>
                        {new Date(form.createdAt).toLocaleDateString("fr-TN")}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => reopenForm(form.id)} style={{ padding: "5px 12px", background: "#5b5ef4", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                            Ouvrir
                          </button>
                          <button onClick={() => deleteForm(form.id)} style={{ padding: "5px 12px", background: "transparent", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                <button onClick={() => fetchForms(page - 1)} disabled={page === 1} style={{ padding: "7px 14px", border: "1px solid #dde2f0", borderRadius: 8, background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#ccc" : "#1a1f36", fontSize: 13 }}>
                  ← Précédent
                </button>
                <span style={{ padding: "7px 14px", fontSize: 13, color: "#8892b0" }}>Page {page} / {pages}</span>
                <button onClick={() => fetchForms(page + 1)} disabled={page === pages} style={{ padding: "7px 14px", border: "1px solid #dde2f0", borderRadius: 8, background: "#fff", cursor: page === pages ? "not-allowed" : "pointer", color: page === pages ? "#ccc" : "#1a1f36", fontSize: 13 }}>
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}