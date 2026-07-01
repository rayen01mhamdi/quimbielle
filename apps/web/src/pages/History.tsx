import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

interface Form {
  id: string
  createdAt: string
  beneficiary: string
  amount: number
  dueDate: string
  status: string
}

export default function History() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [forms, setForms] = useState<Form[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchForms = async (p = 1, s = search) => {
    setLoading(true)
    const token = localStorage.getItem("token")
    const query = new URLSearchParams({ page: String(p), limit: "10" })
    if (s) query.set("search", s)
    const res = await fetch(`http://localhost:3000/api/forms?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setForms(data.forms || [])
    setTotal(data.total || 0)
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

  const duplicateForm = async (id: string) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`http://localhost:3000/api/forms/${id}/duplicate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) fetchForms(page)
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
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 12 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1f36", flex: 1 }}>Historique des formulaires</h1>
          <span style={{ fontSize: 13, color: "#8892b0" }}>{total} formulaire{total !== 1 ? "s" : ""}</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Rechercher par bénéficiaire..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchForms(1, search)}
            style={{ flex: 1, padding: "8px 12px", fontSize: 13, border: "1px solid #dde2f0", borderRadius: 8, outline: "none" }}
          />
          <button onClick={() => fetchForms(1, search)} style={{ padding: "8px 16px", background: "#5b5ef4", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Rechercher
          </button>
          {search && (
            <button onClick={() => { setSearch(""); fetchForms(1, "") }} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #dde2f0", color: "#4a5580", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              Effacer
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8892b0" }}>Chargement...</div>
        ) : forms.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#8892b0", background: "#fff", borderRadius: 16, border: "1px solid #dde2f0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <div style={{ fontWeight: 600 }}>Aucun formulaire trouvé</div>
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
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Statut</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Date</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form, i) => (
                    <tr key={form.id} style={{ borderBottom: i < forms.length - 1 ? "1px solid #f0f2f9" : "none" }}>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#1a1f36", fontWeight: 500 }}>
                        {form.beneficiary || "—"}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#1a1f36" }}>
                        {form.amount ? `${form.amount} DT` : "—"}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#1a1f36" }}>
                        {form.dueDate || "—"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: form.status === "FINALIZED" ? "rgba(34,197,94,0.1)" : "rgba(91,94,244,0.1)", color: form.status === "FINALIZED" ? "#16a34a" : "#5b5ef4" }}>
                          {form.status === "FINALIZED" ? "Finalisé" : "Brouillon"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#8892b0" }}>
                        {new Date(form.createdAt).toLocaleDateString("fr-TN")}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => navigate(`/dashboard?formId=${form.id}`)} style={{ padding: "5px 10px", background: "#5b5ef4", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                            Ouvrir
                          </button>
                          <button onClick={() => duplicateForm(form.id)} style={{ padding: "5px 10px", background: "transparent", color: "#4a5580", border: "1px solid #dde2f0", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                            Dupliquer
                          </button>
                          <button onClick={() => deleteForm(form.id)} style={{ padding: "5px 10px", background: "transparent", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
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