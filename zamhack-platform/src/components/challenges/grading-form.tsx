"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { submitEvaluation } from "@/app/challenges/grading-actions"
import { Database } from "@/types/supabase"

type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"]

const gradingSchema = z.object({
  score: z
    .number()
    .min(0, "Score must be at least 0")
    .max(100, "Score must be at most 100"),
  feedback: z.string().min(1, "Feedback is required"),
  isDraft: z.boolean().default(false),
})

type GradingFormValues = z.infer<typeof gradingSchema>

interface GradingFormProps {
  submissionId: string
  initialEvaluation?: Evaluation | null
}

export const GradingForm = ({ submissionId, initialEvaluation }: GradingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema),
    defaultValues: {
      score: initialEvaluation?.score ?? 0,
      feedback: initialEvaluation?.feedback ?? "",
      isDraft: initialEvaluation?.is_draft ?? false,
    },
  })

  const isDraft = form.watch("isDraft")

  const onSubmit = async (data: GradingFormValues, isDraftOverride?: boolean) => {
    setIsSubmitting(true)
    try {
      const finalIsDraft = isDraftOverride !== undefined ? isDraftOverride : data.isDraft
      const result = await submitEvaluation(
        submissionId,
        data.score,
        data.feedback,
        finalIsDraft
      )

      if (result.success) {
        toast.success(
          finalIsDraft
            ? "Draft saved successfully"
            : "Evaluation submitted successfully"
        )
        // Refresh the page to show updated state
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to submit evaluation")
      }
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="score">Score (0-100)</Label>
            <Input
              id="score"
              type="number"
              min={0}
              max={100}
              {...form.register("score", { valueAsNumber: true })}
              placeholder="Enter score"
            />
            {form.formState.errors.score && (
              <p className="text-xs text-destructive">
                {form.formState.errors.score.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback *</Label>
            <Textarea
              id="feedback"
              {...form.register("feedback")}
              placeholder="Provide detailed feedback..."
              rows={8}
            />
            {form.formState.errors.feedback && (
              <p className="text-xs text-destructive">
                {form.formState.errors.feedback.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDraft"
              checked={form.watch("isDraft")}
              onCheckedChange={(checked) =>
                form.setValue("isDraft", checked as boolean)
              }
            />
            <Label
              htmlFor="isDraft"
              className="text-sm font-normal cursor-pointer"
            >
              Save as Draft
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="default"
              disabled={isSubmitting}
              onClick={() => {
                form.handleSubmit((data) => onSubmit(data, false))()
              }}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                form.handleSubmit((data) => onSubmit(data, true))()
              }}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

