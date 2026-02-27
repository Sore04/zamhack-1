"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateOrganization } from "./actions"
import { Database } from "@/types/supabase"
import {
  Building2,
  Globe,
  Layers,
  FileText,
  Save,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react"

type Organization = Database["public"]["Tables"]["organizations"]["Row"]

interface OrgFormProps {
  organization: Organization
}

const INDUSTRIES = [
  "Technology", "Fintech", "EdTech", "Healthcare", "E-commerce",
  "Media & Entertainment", "Logistics", "Agriculture", "Manufacturing",
  "Retail", "Finance", "Real Estate", "Non-profit", "Other",
]

export function OrgForm({ organization }: OrgFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setSaved(false)

    const formData = new FormData(e.currentTarget)
    const result = await updateOrganization(organization.id, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── Section: Company Identity ── */}
      <div className="cp-card">
        <div className="cp-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: "2rem", height: "2rem", borderRadius: "var(--cp-radius-md, 12px)",
              background: "var(--cp-coral-muted)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Building2 style={{ width: "1rem", height: "1rem", color: "var(--cp-coral-dark)" }} />
            </div>
            <p className="cp-card-title">Company Identity</p>
          </div>
        </div>
        <div className="cp-card-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>

            {/* Company Name */}
            <div className="cp-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="name" className="cp-label">
                Company Name <span style={{ color: "var(--cp-coral)" }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                className="cp-input"
                defaultValue={organization.name}
                placeholder="e.g. Acme Corp"
                required
              />
              <p style={{ fontSize: "0.75rem", color: "var(--cp-text-muted)", marginTop: "0.375rem" }}>
                This is the name students will see on your challenges.
              </p>
            </div>

            {/* Industry */}
            <div className="cp-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="industry" className="cp-label">Industry</label>
              <select
                id="industry"
                name="industry"
                className="cp-input"
                defaultValue={organization.industry || ""}
                style={{ appearance: "auto" }}
              >
                <option value="">Select your industry…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* ── Section: Online Presence ── */}
      <div className="cp-card">
        <div className="cp-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: "2rem", height: "2rem", borderRadius: "var(--cp-radius-md, 12px)",
              background: "var(--cp-navy-muted)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Globe style={{ width: "1rem", height: "1rem", color: "var(--cp-navy)" }} />
            </div>
            <p className="cp-card-title">Online Presence</p>
          </div>
        </div>
        <div className="cp-card-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>

            {/* Website */}
            <div className="cp-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="website" className="cp-label">Website</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
                  fontSize: "0.8125rem", color: "var(--cp-text-muted)", pointerEvents: "none",
                  userSelect: "none",
                }}>
                  https://
                </span>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="cp-input"
                  defaultValue={organization.website || ""}
                  placeholder="yourcompany.com"
                  style={{ paddingLeft: "4.25rem" }}
                />
              </div>
            </div>

            {/* Logo URL */}
            <div className="cp-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="logo_url" className="cp-label">
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <ImageIcon style={{ width: "0.875rem", height: "0.875rem" }} />
                  Logo URL
                </span>
              </label>
              <input
                id="logo_url"
                name="logo_url"
                type="url"
                className="cp-input"
                defaultValue={(organization as any).logo_url || ""}
                placeholder="https://yourcompany.com/logo.png"
              />
              {(organization as any).logo_url && (
                <div style={{ marginTop: "0.625rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <img
                    src={(organization as any).logo_url}
                    alt="Logo preview"
                    style={{
                      width: "2.5rem", height: "2.5rem", borderRadius: "var(--cp-radius-md, 12px)",
                      objectFit: "cover", border: "1px solid var(--cp-border)",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--cp-text-muted)" }}>Current logo</span>
                </div>
              )}
              <p style={{ fontSize: "0.75rem", color: "var(--cp-text-muted)", marginTop: "0.375rem" }}>
                Enter a public URL to your company logo (PNG, JPG, SVG). Shown on challenge cards.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Section: About ── */}
      <div className="cp-card">
        <div className="cp-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: "2rem", height: "2rem", borderRadius: "var(--cp-radius-md, 12px)",
              background: "var(--cp-coral-muted)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText style={{ width: "1rem", height: "1rem", color: "var(--cp-coral-dark)" }} />
            </div>
            <p className="cp-card-title">About Your Company</p>
          </div>
        </div>
        <div className="cp-card-body">
          <div className="cp-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="description" className="cp-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="cp-textarea"
              defaultValue={organization.description || ""}
              placeholder="Tell students what your company does, your mission, culture, and what kind of talent you're looking for…"
              rows={5}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--cp-text-muted)", marginTop: "0.375rem" }}>
              Shown on your challenge pages. A compelling description attracts better talent.
            </p>
          </div>
        </div>
      </div>

      {/* ── Save Button ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", alignItems: "center" }}>
        {saved && (
          <span style={{
            display: "flex", alignItems: "center", gap: "0.375rem",
            fontSize: "0.8125rem", fontWeight: 600, color: "#166534",
            animation: "fadeIn 0.2s ease",
          }}>
            <CheckCircle2 style={{ width: "1rem", height: "1rem" }} />
            Saved successfully
          </span>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="cp-btn cp-btn-primary"
          style={{
            opacity: isSaving ? 0.7 : 1,
            cursor: isSaving ? "not-allowed" : "pointer",
            minWidth: "140px",
          }}
        >
          {isSaving ? (
            <>
              <span style={{
                width: "1rem", height: "1rem", borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "white",
                animation: "cp-spin 0.7s linear infinite",
                display: "inline-block",
              }} />
              Saving…
            </>
          ) : (
            <>
              <Save style={{ width: "1rem", height: "1rem" }} />
              Save Changes
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes cp-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .org-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  )
}