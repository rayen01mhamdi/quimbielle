import { useState, useRef, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { generateFilledPDF, numToFr, numToAr } from "@quimbielle/pdf"

interface FieldPosition {
  key: string
  label?: string
  left: number
  top: number
  width: number
  height: number
}
import { validateForm } from "@quimbielle/types"

type ValidationErrors = { [key: string]: string }

const INITIAL_FIELDS: FieldPosition[] = [
  { key: "signatureTire",   label: "Signature du tiré",              left: 2.0,  top: 13.0, width: 23.0, height: 17.0 },
  { key: "echeance1",       label: "Échéance",                       left: 47.0, top: 13.0, width: 9.0,  height: 4.5 },
  { key: "lieuA",           label: "A (lieu)",                       left: 75.5, top: 13.0, width: 12.0, height: 4.5 },
  { key: "ribTire",         label: "RIB ou RIP du Tiré",             left: 27.0, top: 22.5, width: 47.0, height: 4.5 },
  { key: "montant1",        label: "Montant (chiffres)",             left: 75.0, top: 23.5, width: 23.0, height: 5.5 },
  { key: "tireur",          label: "Tireur",                         left: 2.0,  top: 32.0, width: 23.0, height: 12.5 },
  { key: "ordrePayer",      label: "Payer à l'ordre de",             left: 27.0, top: 32.5, width: 47.0, height: 5.5 },
  { key: "protestable",     label: "Protestable (Oui/Non)",          left: 49.5, top: 35.5, width: 10.0, height: 4.0 },
  { key: "montant2",        label: "Montant (chiffres) — droite",    left: 75.0, top: 32.0, width: 23.0, height: 5.5 },
  { key: "montantLettre",   label: "Montant en lettres (FR)",        left: 2.0,  top: 44.0, width: 96.0, height: 4.5 },
  { key: "montantLettreAr", label: "Montant en lettres (AR)",        left: 2.0,  top: 48.0, width: 96.0, height: 4.0 },
  { key: "lieuCreation",    label: "Lieu de création",               left: 2.0,  top: 51.0, width: 15.0, height: 5.0 },
  { key: "dateCreation",    label: "Date de création",               left: 18.0, top: 51.0, width: 17.0, height: 5.0 },
  { key: "echeance2",       label: "Échéance (bas)",                 left: 36.0, top: 51.0, width: 17.0, height: 5.0 },
  { key: "nomCedant",       label: "Nom du cédant",                  left: 55.0, top: 51.0, width: 22.0, height: 5.0 },
  { key: "codesReserves",   label: "Codes réservés",                 left: 79.0, top: 51.0, width: 19.0, height: 5.0 },
  { key: "ribTireur",       label: "RIB ou RIP du Tireur",           left: 2.0,  top: 60.5, width: 42.0, height: 7.0 },
  { key: "valeurEn",        label: "Valeur en",                      left: 45.0, top: 60.5, width: 16.0, height: 4.0 },
  { key: "qte",             label: "Quantité",                       left: 62.0, top: 60.5, width: 19.0, height: 4.0 },
  { key: "domiciliation",   label: "Domiciliation",                  left: 82.0, top: 60.5, width: 16.0, height: 9.0 },
  { key: "nomAdresseTire",  label: "Nom et adresse du Tiré",         left: 45.0, top: 65.0, width: 37.0, height: 12.0 },
  { key: "acceptation",     label: "Acceptation",                    left: 2.0,  top: 71.5, width: 21.0, height: 11.0 },
  { key: "aval",            label: "Aval",                           left: 23.0, top: 71.5, width: 20.0, height: 11.0 },
  { key: "signatureTireur", label: "Signature du tireur",            left: 82.0, top: 78.0, width: 16.0, height: 7.0 },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [values, setValues] = useState<Record<string, string>>({})
  const [fields, setFields] = useState<FieldPosition[]>(INITIAL_FIELDS)
  const [editMode, setEditMode] = useState(true)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const dragInfo = useRef<{ key: string; mode: "move" | "resize"; startX: number; startY: number; orig: FieldPosition } | null>(null)

  // Fix §1.3 — load form when reopening from history
  useEffect(() => {
    const formId = searchParams.get("formId")
    if (!formId) return
    const token = localStorage.getItem("token")
    setLoading(true)
    fetch(`http://localhost:3000/api/forms/${formId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.values) setValues(data.values)
        if (data.positions && data.positions.length > 0) {
          setFields(prev => prev.map(f => {
            const saved = data.positions.find((p: FieldPosition) => p.key === f.key)
            return saved ? { ...f, ...saved } : f
          }))
        }
        setEditMode(false)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate("/login") }

  const handleChange = (key: string, val: string) => {
    const updated: Record<string, string> = { ...values, [key]: val }
    if (key === "montant1") updated["montant2"] = val
    if (key === "echeance1") updated["echeance2"] = val
    setValues(updated)
  }

  const startDrag = (e: React.MouseEvent, key: string, mode: "move" | "resize") => {
    if (!editMode) return
    e.preventDefault()
    e.stopPropagation()
    const field = fields.find(f => f.key === key)!
    dragInfo.current = { key, mode, startX: e.clientX, startY: e.clientY, orig: { ...field } }
    setActiveKey(key)
    window.addEventListener("mousemove", onDrag)
    window.addEventListener("mouseup", stopDrag)
  }

  const onDrag = (e: MouseEvent) => {
    if (!dragInfo.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dxPct = ((e.clientX - dragInfo.current.startX) / rect.width) * 100
    const dyPct = ((e.clientY - dragInfo.current.startY) / rect.height) * 100
    const { key, mode, orig } = dragInfo.current
    setFields(prev => prev.map(f => {
      if (f.key !== key) return f
      if (mode === "move") {
        return { ...f, left: Math.max(0, Math.min(99, orig.left + dxPct)), top: Math.max(0, Math.min(99, orig.top + dyPct)) }
      } else {
        return { ...f, width: Math.max(2, orig.width + dxPct), height: Math.max(2, orig.height + dyPct) }
      }
    }))
  }

  const stopDrag = () => {
    dragInfo.current = null
    window.removeEventListener("mousemove", onDrag)
    window.removeEventListener("mouseup", stopDrag)
  }

  // Fix §4.6 — cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onDrag)
      window.removeEventListener("mouseup", stopDrag)
    }
  }, [])

const exportPDF = async () => {
  try {
    const token = localStorage.getItem("token")
    const settingsRes = await fetch("http://localhost:3000/api/calibration", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const { xOffset, yOffset } = await settingsRes.json()
    const doc = generateFilledPDF(values, fields, { xOffset: xOffset || 0, yOffset: yOffset || 0 })
    doc.save("kambiale.pdf")
  } catch {
    const doc = generateFilledPDF(values, fields)
    doc.save("kambiale.pdf")
  }
}

  const autoLettres = () => {
    const amount = parseFloat(values.montant1)
    if (isNaN(amount)) return
    const intPart = Math.floor(amount)
    const decPart = Math.round((amount - intPart) * 1000)
    const fr = numToFr(intPart) + " dinars" + (decPart > 0 ? " et " + numToFr(decPart) + " millimes" : "")
    const ar = numToAr(intPart) + " دينار" + (decPart > 0 ? " و" + numToAr(decPart) + " مليم" : "")
    setValues(prev => ({ ...prev, montantLettre: fr, montantLettreAr: ar }))
  }

  const saveDraft = async () => {
    const validationErrors = validateForm(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    const token = localStorage.getItem("token")
    const res = await fetch("http://localhost:3000/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        values,
        positions: fields.map(f => ({ key: f.key, left: f.left, top: f.top, width: f.width, height: f.height })),
      }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const active = fields.find(f => f.key === activeKey)

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6fb" }}>
        <div style={{ fontSize: 14, color: "#8892b0" }}>Chargement du formulaire...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #dde2f0", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1f36" }}>Quim<span style={{ color: "#5b5ef4" }}>bielle</span></span>
        <span style={{ flex: 1 }} />
        <button onClick={() => navigate("/history")} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>Historique</button>
<button onClick={() => navigate("/csv")} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>CSV</button>
<button onClick={() => navigate("/calibration")} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>🖨 Calibration</button>
        {user?.isAdmin && (
          <button onClick={() => navigate("/admin")} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #5b5ef4", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#5b5ef4" }}>Admin</button>
        )}
        <span style={{ fontSize: 13, color: "#8892b0" }}>Bienvenue, {user?.name || user?.userId?.slice(0, 8)}</span>
        <button onClick={handleLogout} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#4a5580" }}>Déconnexion</button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1f36", flex: 1 }}>Lettre de Change — Kambiale</h1>
          <button
            onClick={() => setEditMode(m => !m)}
            style={{ padding: "8px 18px", background: editMode ? "#5b5ef4" : "transparent", border: "1px solid #5b5ef4", borderRadius: 8, fontSize: 13, fontWeight: 600, color: editMode ? "#fff" : "#5b5ef4", cursor: "pointer" }}
          >
            {editMode ? "✓ Mode édition activé" : "Modifier les positions"}
          </button>
          <button onClick={saveDraft} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#4a5580", cursor: "pointer" }}>
            {saved ? "✓ Enregistré" : "Enregistrer"}
          </button>
          <button onClick={autoLettres} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #dde2f0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#4a5580", cursor: "pointer" }}>
            🔤 Auto-lettres
          </button>
          <button onClick={exportPDF} style={{ padding: "8px 18px", background: "#1a1f36", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
            ⬇ Exporter PDF
          </button>
        </div>

        {editMode && (
          <div style={{ background: "#1a1f36", color: "#fff", borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 12, fontFamily: "monospace", display: "flex", gap: 24 }}>
            <span><b>Mode édition :</b> clique-glisse pour déplacer, glisse le coin ↘ pour redimensionner</span>
            {active && (
              <span style={{ marginLeft: "auto" }}>
                {active.label} → left: {active.left.toFixed(1)}% top: {active.top.toFixed(1)}% w: {active.width.toFixed(1)}% h: {active.height.toFixed(1)}%
              </span>
            )}
          </div>
        )}

        <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, overflow: "hidden" }}>
          <div ref={containerRef} style={{ position: "relative", width: "100%", paddingBottom: "64.375%", background: "#f8f9fc" }}>
            <img
              src="/kambiale.png"
              alt="Kambiale form"
              draggable={false}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", userSelect: "none", pointerEvents: "none" }}
            />
            {fields.map(f => (
              <div
                key={f.key}
                onMouseDown={e => startDrag(e, f.key, "move")}
                style={{
                  position: "absolute",
                  left: `${f.left}%`,
                  top: `${f.top}%`,
                  width: `${f.width}%`,
                  height: `${f.height}%`,
                  background: editMode ? "rgba(91,94,244,0.10)" : "rgba(91,94,244,0.04)",
                  border: editMode ? "1px solid #5b5ef4" : "1px dashed rgba(91,94,244,0.3)",
                  borderRadius: 3,
                  cursor: editMode ? "move" : "default",
                  zIndex: activeKey === f.key ? 5 : 2,
                }}
              >
                {editMode ? (
                  <div style={{ fontSize: "clamp(6px, 0.85vw, 10px)", color: "#5b5ef4", padding: "1px 3px", pointerEvents: "none", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>
                    {f.label}
                  </div>
                ) : (
                  <textarea
                    value={values[f.key] || ""}
                    onChange={e => handleChange(f.key, e.target.value)}
                    style={{
                      width: "100%", height: "100%", border: "none", background: "transparent",
                      fontSize: "clamp(7px, 1vw, 12px)", padding: "2px 4px", resize: "none", outline: "none",
                      color: "#1a1f36", fontFamily: "Inter, sans-serif", lineHeight: 1.2,
                    }}
                  />
                )}
                {editMode && (
                  <div
                    onMouseDown={e => startDrag(e, f.key, "resize")}
                    style={{ position: "absolute", right: -4, bottom: -4, width: 10, height: 10, background: "#5b5ef4", borderRadius: 3, cursor: "nwse-resize" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {!editMode && (
          <div style={{ background: "#fff", border: "1px solid #dde2f0", borderRadius: 16, padding: 20, marginTop: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#4a5580", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tous les champs</p>
            {Object.keys(errors).length > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                {Object.values(errors).map((e, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#dc2626" }}>• {e}</div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {fields.map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: errors[f.key] ? "#dc2626" : "#8892b0", display: "block", marginBottom: 4 }}>{f.label}</label>
                  <input
                    type="text"
                    value={values[f.key] || ""}
                    onChange={e => handleChange(f.key, e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", fontSize: 12, border: `1px solid ${errors[f.key] ? "#fecaca" : "#dde2f0"}`, borderRadius: 6, outline: "none", color: "#1a1f36", background: "#f8f9fc" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}