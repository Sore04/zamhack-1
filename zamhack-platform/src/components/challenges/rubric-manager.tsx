"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { saveRubric, deleteRubric } from "@/app/challenges/grading-actions"
import { Pencil, Trash2, Plus, Check, X, ClipboardList } from "lucide-react"

interface Rubric {
  id: string
  challenge_id: string
  criteria_name: string
  max_points: number | null
  created_at: string | null
}

interface RubricManagerProps {
  challengeId: string
  initialRubrics: Rubric[]
}

interface EditingState {
  id: string | null   // null = new row
  criteriaName: string
  maxPoints: string
}

export function RubricManager({ challengeId, initialRubrics }: RubricManagerProps) {
  const [rubrics, setRubrics] = useState<Rubric[]>(initialRubrics)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [loading, setLoading] = useState<string | null>(null) // rubric id or "new"
  const [error, setError] = useState<string | null>(null)

  const totalPoints = rubrics.reduce((sum, r) => sum + (r.max_points ?? 0), 0)

  const startAdd = () => {
    setEditing({ id: null, criteriaName: "", maxPoints: "10" })
    setError(null)
  }

  const startEdit = (rubric: Rubric) => {
    setEditing({
      id: rubric.id,
      criteriaName: rubric.criteria_name,
      maxPoints: String(rubric.max_points ?? 10),
    })
    setError(null)
  }

  const cancelEdit = () => {
    setEditing(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!editing) return

    const name = editing.criteriaName.trim()
    const points = parseInt(editing.maxPoints, 10)

    if (!name) { setError("Criteria name is required"); return }
    if (isNaN(points) || points < 1 || points > 1000) { setError("Points must be between 1 and 1000"); return }

    setLoading(editing.id ?? "new")
    setError(null)

    const result = await saveRubric(
      challengeId,
      name,
      points,
      editing.id ?? undefined
    )

    setLoading(null)

    if (!result.success) {
      setError(result.error ?? "Something went wrong")
      return
    }

    if (editing.id) {
      // Update in local state
      setRubrics((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? { ...r, criteria_name: name, max_points: points }
            : r
        )
      )
    } else {
      // Append new rubric to local state
      setRubrics((prev) => [
        ...prev,
        {
          id: result.id!,
          challenge_id: challengeId,
          criteria_name: name,
          max_points: points,
          created_at: new Date().toISOString(),
        },
      ])
    }

    setEditing(null)
  }

  const handleDelete = async (rubricId: string) => {
    setLoading(rubricId)
    setError(null)

    const result = await deleteRubric(rubricId, challengeId)

    setLoading(null)

    if (!result.success) {
      setError(result.error ?? "Failed to delete rubric")
      return
    }

    setRubrics((prev) => prev.filter((r) => r.id !== rubricId))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Scoring Criteria</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            {rubrics.length > 0 && (
              <Badge variant="secondary" className="text-xs font-medium">
                {totalPoints} pts total
              </Badge>
            )}
            {!editing && (
              <Button size="sm" onClick={startAdd} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Criterion
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground pt-1">
          Criteria defined here are visible to students on their challenge progress page.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {rubrics.length === 0 && !editing && (
          <div className="rounded-md border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No scoring criteria yet. Add one to help students understand how they&apos;ll be evaluated.
            </p>
          </div>
        )}

        {/* Existing rubrics */}
        {rubrics.length > 0 && (
          <div className="divide-y divide-border rounded-md border">
            {rubrics.map((rubric, index) => (
              <div key={rubric.id} className="flex items-center gap-3 px-4 py-3">
                {editing?.id === rubric.id ? (
                  // Inline edit row
                  <>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <Input
                      className="h-8 flex-1 text-sm"
                      value={editing.criteriaName}
                      onChange={(e) => setEditing({ ...editing, criteriaName: e.target.value })}
                      placeholder="e.g. Code Quality"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancelEdit() }}
                    />
                    <Input
                      className="h-8 w-20 text-sm"
                      type="number"
                      min={1}
                      max={1000}
                      value={editing.maxPoints}
                      onChange={(e) => setEditing({ ...editing, maxPoints: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancelEdit() }}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">pts</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-green-600 hover:text-green-700"
                      onClick={handleSave}
                      disabled={loading === rubric.id}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={cancelEdit}
                      disabled={loading === rubric.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  // Display row
                  <>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{rubric.criteria_name}</span>
                    <Badge variant="outline" className="text-xs tabular-nums shrink-0">
                      {rubric.max_points ?? 0} pts
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(rubric)}
                      disabled={!!loading || !!editing}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(rubric.id)}
                      disabled={loading === rubric.id || !!editing}
                    >
                      {loading === rubric.id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            ))}

            {/* Total row */}
            <div className="flex items-center justify-between bg-muted/40 px-4 py-3 rounded-b-md">
              <span className="text-sm font-semibold">Total</span>
              <Badge variant="default" className="text-xs tabular-nums">
                {totalPoints} pts
              </Badge>
            </div>
          </div>
        )}

        {/* New row form */}
        {editing?.id === null && (
          <div className="flex items-center gap-3 rounded-md border border-dashed px-4 py-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {rubrics.length + 1}
            </span>
            <Input
              className="h-8 flex-1 text-sm"
              value={editing.criteriaName}
              onChange={(e) => setEditing({ ...editing, criteriaName: e.target.value })}
              placeholder="e.g. Code Quality"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancelEdit() }}
            />
            <Input
              className="h-8 w-20 text-sm"
              type="number"
              min={1}
              max={1000}
              value={editing.maxPoints}
              onChange={(e) => setEditing({ ...editing, maxPoints: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancelEdit() }}
            />
            <span className="text-xs text-muted-foreground shrink-0">pts</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-green-600 hover:text-green-700"
              onClick={handleSave}
              disabled={loading === "new"}
            >
              {loading === "new" ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={cancelEdit}
              disabled={loading === "new"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}