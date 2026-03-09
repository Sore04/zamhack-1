"use client"

/**
 * ZamHack — Download Certificate Button
 *
 * Usage (Completion):
 *   <DownloadCertificateButton
 *     type="completion"
 *     studentName="Juan dela Cruz"
 *     challengeTitle="Build a REST API"
 *     organizationName="TechCorp Inc."
 *     completionDate="March 8, 2026"
 *     totalScore={285}
 *   />
 *
 * Usage (Winner):
 *   <DownloadCertificateButton
 *     type="winner"
 *     studentName="Juan dela Cruz"
 *     challengeTitle="Build a REST API"
 *     organizationName="TechCorp Inc."
 *     rank={1}
 *     score={285}
 *     awardDate="March 8, 2026"
 *   />
 *
 * Dependencies (add to package.json):
 *   npm install html2canvas jspdf
 */

import { useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import CompletionCertificate from "@/components/certificate/certificate-template"
import WinnerCertificate from "@/components/certificate/winner-certificate-template"

// ── Types ──────────────────────────────────────────────────────────────────

type CompletionProps = {
  type: "completion"
  studentName: string
  challengeTitle: string
  organizationName: string
  completionDate: string
  totalScore?: number | null
}

type WinnerProps = {
  type: "winner"
  studentName: string
  challengeTitle: string
  organizationName: string
  rank: 1 | 2 | 3
  score?: number | null
  awardDate: string
}

type Props = CompletionProps | WinnerProps

// ── Component ───────────────────────────────────────────────────────────────

export default function DownloadCertificateButton(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!containerRef.current) return
    setLoading(true)

    try {
      // Dynamically import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      // Wait a tick for React to finish rendering hidden cert
      await new Promise((r) => requestAnimationFrame(r))
      await new Promise((r) => setTimeout(r, 100))

      const canvas = await html2canvas(containerRef.current, {
        scale: 2,          // 2× for retina sharpness
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")

      // A4 landscape: 297 × 210 mm
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210)

      const safeName = props.studentName.replace(/\s+/g, "_")
      const safeChallenge = props.challengeTitle.replace(/\s+/g, "_").slice(0, 30)
      const prefix = props.type === "winner" ? `Winner_${props.rank}st` : "Certificate"
      pdf.save(`ZamHack_${prefix}_${safeName}_${safeChallenge}.pdf`)
    } catch (err) {
      console.error("Certificate generation failed:", err)
    } finally {
      setLoading(false)
    }
  }, [props])

  const buttonLabel =
    props.type === "winner"
      ? `Download ${["1st", "2nd", "3rd"][props.rank - 1]} Place Certificate`
      : "Download Certificate"

  const buttonStyle =
    props.type === "winner"
      ? props.rank === 1
        ? "bg-amber-500 hover:bg-amber-600 text-white"
        : props.rank === 2
        ? "bg-slate-500 hover:bg-slate-600 text-white"
        : "bg-orange-700 hover:bg-orange-800 text-white"
      : "bg-[#FF9B87] hover:bg-[#E8836F] text-white"

  return (
    <>
      {/* ── Hidden certificate DOM node (portal so it doesn't affect layout) ── */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: "-9999px",
              left: "-9999px",
              zIndex: -1,
              pointerEvents: "none",
            }}
          >
            <div ref={containerRef}>
              {props.type === "completion" ? (
                <CompletionCertificate
                  studentName={props.studentName}
                  challengeTitle={props.challengeTitle}
                  organizationName={props.organizationName}
                  completionDate={props.completionDate}
                  totalScore={props.totalScore}
                />
              ) : (
                <WinnerCertificate
                  studentName={props.studentName}
                  challengeTitle={props.challengeTitle}
                  organizationName={props.organizationName}
                  rank={props.rank}
                  score={props.score}
                  awardDate={props.awardDate}
                />
              )}
            </div>
          </div>,
          document.body
        )}

      {/* ── Visible button ── */}
      <Button
        onClick={handleDownload}
        disabled={loading}
        className={`${buttonStyle} flex items-center gap-2 font-semibold`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {loading ? "Generating PDF…" : buttonLabel}
      </Button>
    </>
  )
}