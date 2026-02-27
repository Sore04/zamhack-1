"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { updatePlatformSettings } from "./actions"
import {
  Loader2,
  Save,
  AlertTriangle,
  Settings,
  DollarSign,
} from "lucide-react"

interface SettingsFormProps {
  initialSettings: {
    maintenance_mode: boolean
    allow_new_signups: boolean
    default_currency: string
  }
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  // --- System Controls ---
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.maintenance_mode ?? false)
  const [allowSignups, setAllowSignups]       = useState(initialSettings.allow_new_signups ?? true)
  const [currency, setCurrency]               = useState(initialSettings.default_currency ?? "PHP")



  const handleSave = async () => {
    setIsLoading(true)
    const result = await updatePlatformSettings({
      maintenance_mode: maintenanceMode,
      allow_new_signups: allowSignups,
      default_currency: currency,
    })
    if (result.error) toast.error(result.error)
    else toast.success(result.success ?? "Settings saved!")
    setIsLoading(false)
  }

  // --- Reusable sub-components ---

  const SectionHeader = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ElementType
    title: string
    description: string
  }) => (
    <div className="admin-settings-section-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div className="admin-stat-icon blue" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0 }}>
        <Icon style={{ width: 16, height: 16 }} />
      </div>
      <div>
        <div className="admin-settings-section-title">{title}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--admin-gray-400)", marginTop: 1 }}>{description}</div>
      </div>
    </div>
  )

  const ToggleRow = ({
    label,
    description,
    checked,
    onChange,
    danger,
  }: {
    label: string
    description: string
    checked: boolean
    onChange: (v: boolean) => void
    danger?: boolean
  }) => (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      padding: "1rem 1.25rem",
      borderRadius: 8,
      background: danger && checked ? "var(--admin-red-bg)" : "var(--admin-gray-50)",
      border: `1.5px solid ${danger && checked ? "rgba(239,68,68,0.2)" : "var(--admin-gray-200)"}`,
      transition: "all 0.2s",
    }}>
      <div>
        <div style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: danger && checked ? "var(--admin-red-text)" : "var(--admin-gray-800)",
        }}>
          {label}
          {danger && checked && (
            <span className="admin-badge red" style={{ marginLeft: "0.5rem", verticalAlign: "middle" }}>
              Active
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--admin-gray-400)", marginTop: 2 }}>
          {description}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )



  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Maintenance warning banner */}
      {maintenanceMode && (
        <div className="admin-alert warning" style={{ gap: "0.75rem" }}>
          <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />
          <div>
            <strong>Maintenance mode is ON.</strong> All non-admin users are currently locked out of the platform.
          </div>
        </div>
      )}

      {/* ── Section 1: System Controls ── */}
      <div className="admin-settings-section">
        <SectionHeader
          icon={Settings}
          title="System Controls"
          description="Control platform-wide access and behaviour"
        />
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <ToggleRow
            label="Maintenance Mode"
            description="Locks out all non-admin users. Use during updates or incidents."
            checked={maintenanceMode}
            onChange={setMaintenanceMode}
            danger
          />
          <ToggleRow
            label="Allow New Signups"
            description="If disabled, new users cannot register. Existing users can still log in."
            checked={allowSignups}
            onChange={setAllowSignups}
          />
        </div>
      </div>

      {/* ── Section 2: Default Currency ── */}
      <div className="admin-settings-section">
        <SectionHeader
          icon={DollarSign}
          title="Currency"
          description="Default currency used for challenge entry fees"
        />
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ maxWidth: 240 }}>
            <label className="admin-label">Default Currency</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="admin-select" style={{ height: 38 }}>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHP">🇵🇭 Philippine Peso (PHP)</SelectItem>
                <SelectItem value="USD">🇺🇸 US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                <SelectItem value="GBP">🇬🇧 British Pound (GBP)</SelectItem>
              </SelectContent>
            </Select>
            <p style={{ fontSize: "0.75rem", color: "var(--admin-gray-400)", marginTop: 4 }}>
              Applied as default for new challenges with entry fees.
            </p>
          </div>
        </div>
      </div>

      {/* ── Save Button ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "0.75rem",
        padding: "1.25rem 1.5rem",
      }}>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="admin-btn admin-btn-primary"
          style={{ minWidth: 130 }}
        >
          {isLoading ? (
            <>
              <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
              Saving...
            </>
          ) : (
            <>
              <Save style={{ width: 15, height: 15 }} />
              Save Changes
            </>
          )}
        </button>
      </div>

    </div>
  )
}