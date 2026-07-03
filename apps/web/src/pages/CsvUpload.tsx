import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function CsvUpload() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [csv, setCsv] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [invalidRows, setInvalidRows] = useState<any[]>([])

  const handleLogout = () => { logout(); navigate("/login") }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCsv(ev.target?.result as string)
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    if (!csv) return
    setLoading(true)
    setError("")
    setInvalidRows([])

    const token = localStorage.getItem("token")
    const res = await fetch("http://localhost:3000/api/forms/csv", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ csv }),
    })

    if (res.ok) {
      const invalidHeader = res.headers.get("X-Invalid-Rows")
      if (invalidHeader) setInvalidRows(JSON.parse(invalidHeader))

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "kambiale_batch.zip"
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const data = await res.json()
      setError(data.error || "Une erreur est survenue.")
      if (data.invalid) setInvalidRows(data.invalid)
    }

    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #dde2f0", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1f36", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          Quim<span style={{ color: "#5b5ef4" }}>bielle</span>
        </span>
        <span style={{ flex: 1 }} />
        <button onClick={() => navigate("/dashboard")} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>Dashboard</button>
        <button onClick={handleLogout} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>Déconnexion</button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1f36", marginBottom: 8 }}>Export CSV en masse</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>
          Uploadez un fichier CSV — chaque ligne génère un PDF Kambiale. Vous recevrez un fichier ZIP.
        </p>

        <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#4a5580", marginBottom: 12 }}>Format du CSV attendu:</p>
          <code style={{ fontSize: 11, background: "#f8f9fc", padding: "8px 12px", borderRadius: 8, display: "block", color: "#1a1f36" }}>
            ordrePayer,montant1,echeance1,ribTireur,ribTire,tireur,lieuCreation,dateCreation
          </code>
          <p style={{ fontSize: 12, color: "#8892b0", marginTop: 8 }}>La première ligne doit être l'en-tête.</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, padding: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5580", display: "block", marginBottom: 12 }}>
            Choisir un fichier CSV:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ marginBottom: 16, fontSize: 13 }}
          />

          {csv && (
            <div style={{ background: "#f8f9fc", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "#4a5580" }}>
              ✓ Fichier chargé — {csv.split("\n").length - 1} ligne(s) détectée(s)
            </div>
          )}

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}

          {invalidRows.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>Lignes invalides ignorées:</p>
              {invalidRows.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: "#92400e" }}>
                  Ligne {r.row}: {Object.values(r.errors).join(", ")}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!csv || loading}
            style={{ width: "100%", padding: 12, background: !csv || loading ? "#a5a7f7" : "#5b5ef4", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: !csv || loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Génération en cours..." : "⬇ Générer les PDFs et télécharger le ZIP"}
          </button>
        </div>
      </div>
    </div>
  )
}