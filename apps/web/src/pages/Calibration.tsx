import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function Calibration() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [xOffset, setXOffset] = useState(0)
  const [yOffset, setYOffset] = useState(0)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const token = () => localStorage.getItem("token")

  useEffect(() => {
    fetch("http://localhost:3000/api/calibration", {
      headers: { Authorization: `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(data => {
        setXOffset(data.xOffset || 0)
        setYOffset(data.yOffset || 0)
        setLoading(false)
      })
  }, [])

  const downloadGrid = async () => {
    const res = await fetch("http://localhost:3000/api/calibration/grid", {
      headers: { Authorization: `Bearer ${token()}` }
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "calibration_grid.pdf"
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveOffsets = async () => {
    await fetch("http://localhost:3000/api/calibration", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ xOffset, yOffset }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => { logout(); navigate("/login") }

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

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1f36", marginBottom: 8 }}>Calibration de l'imprimante</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>
          Imprimez la grille de calibration, mesurez le décalage de votre imprimante, puis entrez les valeurs de correction.
        </p>

        <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a1f36", marginBottom: 12 }}>Étape 1 — Imprimer la grille</h2>
          <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 16 }}>
            Téléchargez et imprimez ce PDF. Il affiche une grille de 1cm × 1cm avec des coordonnées. 
            Mesurez où la grille commence réellement sur le papier imprimé.
          </p>
          <button onClick={downloadGrid} style={{ padding: "10px 20px", background: "#5b5ef4", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            ⬇ Télécharger la grille de calibration
          </button>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a1f36", marginBottom: 12 }}>Étape 2 — Mesurer le décalage</h2>
          <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 16 }}>
            Si la grille commence à 0.3cm du bord gauche au lieu de 0cm, entrez <b>-0.3</b> pour X.
            Si elle commence à 0.2cm trop bas, entrez <b>-0.2</b> pour Y.
          </p>

          {loading ? (
            <div style={{ color: "#8892b0", fontSize: 13 }}>Chargement...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5580", display: "block", marginBottom: 6 }}>
                  Décalage X (cm) — horizontal
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={xOffset}
                  onChange={e => setXOffset(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: 14, border: "1px solid #dde2f0", borderRadius: 8, outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5580", display: "block", marginBottom: 6 }}>
                  Décalage Y (cm) — vertical
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={yOffset}
                  onChange={e => setYOffset(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: 14, border: "1px solid #dde2f0", borderRadius: 8, outline: "none" }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a1f36", marginBottom: 12 }}>Étape 3 — Sauvegarder</h2>
          <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 16 }}>
            Ces valeurs seront appliquées à tous vos exports PDF. Vous pouvez les ajuster à tout moment.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={saveOffsets} style={{ padding: "10px 20px", background: "#5b5ef4", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saved ? "✓ Sauvegardé" : "Sauvegarder les corrections"}
            </button>
            <button onClick={() => { setXOffset(0); setYOffset(0) }} style={{ padding: "10px 20px", background: "transparent", border: "1px solid #dde2f0", color: "#4a5580", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}