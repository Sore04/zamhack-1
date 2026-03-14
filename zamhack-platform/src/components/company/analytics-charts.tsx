"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  LineChart, Line,
} from "recharts"

// ── Types ──────────────────────────────────────────────────────────────────

export interface TopSchool       { university: string; count: number }
export interface TopSkill        { skill: string; count: number; beginner: number; intermediate: number; advanced: number }
export interface ChallengePerf   { title: string; participants: number; submissions: number; avgScore: number | null; completionRate: number }
export interface WeeklySubmission{ week: string; count: number }
export interface DegreeSlice     { degree: string; count: number }

// ── Palette ────────────────────────────────────────────────────────────────

const CORAL   = "#FF9B87"
const NAVY    = "#2C3E50"
const COLORS  = ["#FF9B87","#2C3E50","#6366F1","#10B981","#F59E0B","#EC4899","#14B8A6","#8B5CF6"]

const chartStyle = {
  fontSize: 12,
  fontFamily: "inherit",
}

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid rgba(44,62,80,0.12)",
  boxShadow: "0 4px 20px rgba(44,62,80,0.10)",
  fontSize: 12,
}

// ── Subcomponents ──────────────────────────────────────────────────────────

export function TopSchoolsChart({ data }: { data: TopSchool[] }) {
  if (!data.length) return <Empty label="No school data yet" />
  const formatted = data.map(d => ({ ...d, university: truncate(d.university, 20) }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(44,62,80,0.08)" />
        <XAxis type="number" tick={chartStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="university" width={130} tick={{ ...chartStyle, fill: "#4A6072" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,155,135,0.08)" }} />
        <Bar dataKey="count" name="Students" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {formatted.map((_, i) => <Cell key={i} fill={i === 0 ? CORAL : `${CORAL}${Math.max(40, 100 - i * 12).toString(16)}`} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TopSkillsChart({ data }: { data: TopSkill[] }) {
  if (!data.length) return <Empty label="No skill data yet" />
  const top = data.slice(0, 10)
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={top} margin={{ left: 8, right: 24, top: 4, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44,62,80,0.08)" />
        <XAxis dataKey="skill" tick={{ ...chartStyle, fill: "#4A6072" }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
        <YAxis tick={chartStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,155,135,0.08)" }} />
        <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
        <Bar dataKey="beginner"     name="Beginner"     stackId="a" fill="#FFD4C8" radius={[0,0,0,0]} maxBarSize={40} />
        <Bar dataKey="intermediate" name="Intermediate" stackId="a" fill={CORAL}   radius={[0,0,0,0]} maxBarSize={40} />
        <Bar dataKey="advanced"     name="Advanced"     stackId="a" fill="#C0392B" radius={[4,4,0,0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ChallengeComparisonChart({ data }: { data: ChallengePerf[] }) {
  if (!data.length) return <Empty label="No challenge data yet" />
  const formatted = data.map(d => ({ ...d, title: truncate(d.title, 18) }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ left: 8, right: 24, top: 4, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44,62,80,0.08)" />
        <XAxis dataKey="title" tick={{ ...chartStyle, fill: "#4A6072" }} angle={-30} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
        <YAxis tick={chartStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(44,62,80,0.04)" }} />
        <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
        <Bar dataKey="participants"   name="Participants"   fill={NAVY}  radius={[4,4,0,0]} maxBarSize={32} />
        <Bar dataKey="submissions"    name="Submissions"    fill={CORAL} radius={[4,4,0,0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SubmissionsOverTimeChart({ data }: { data: WeeklySubmission[] }) {
  if (!data.length) return <Empty label="No submission history yet" />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,62,80,0.08)" />
        <XAxis dataKey="week" tick={{ ...chartStyle, fill: "#4A6072" }} axisLine={false} tickLine={false} />
        <YAxis tick={chartStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="count" name="Submissions" stroke={CORAL} strokeWidth={2.5} dot={{ fill: CORAL, r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DegreeBreakdownChart({ data }: { data: DegreeSlice[] }) {
  if (!data.length) return <Empty label="No degree data yet" />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data as any[]} dataKey="count" nameKey="degree" cx="50%" cy="50%"
          outerRadius={90} innerRadius={48} paddingAngle={3}
          label={({ name, percent }) => (percent ?? 0) > 0.05 ? `${truncate(name ?? "", 14)} ${((percent ?? 0) * 100).toFixed(0)}%` : ""}
          labelLine={false}
        >
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Students"]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "…" : str
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm" style={{ color: "var(--cp-text-muted)" }}>
      {label}
    </div>
  )
}