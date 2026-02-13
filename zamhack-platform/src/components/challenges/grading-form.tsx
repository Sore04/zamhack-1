"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { submitEvaluation } from "@/app/challenges/grading-actions"
import { Database } from "@/types/supabase"

type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"]
type Rubric = Database["public"]["Tables"]["rubrics"]["Row"]
type Score = Database["public"]["Tables"]["scores"]["Row"]

// Zod schema for dynamic rubrics array
const gradingSchema = z.object({
  rubricScores: z.array(
    z.object({
      rubric_id: z.string(),
      criteria_name: z.string(),
      max_points: z.number(),
      score: z.number().min(0, "Score cannot be negative"),
    })
  ).superRefine((data, ctx) => {
    // Check max points for each rubric item
    data.forEach((item, index) => {
      if (item.score > item.max_points) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Score cannot exceed max points (${item.max_points})`,
          path: [index, "score"],
        })
      }
    })
  }),
  feedback: z.string().min(1, "Feedback is required"),
  isDraft: z.boolean().default(false),
})

type GradingFormValues = z.infer<typeof gradingSchema>

interface GradingFormProps {
  submissionId: string
  rubrics: Rubric[]
  existingScores: Score[]
  initialEvaluation?: Evaluation | null
}

export const GradingForm = ({ 
  submissionId, 
  rubrics, 
  existingScores, 
  initialEvaluation 
}: GradingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Map rubrics to initial form values
  const defaultRubricScores = rubrics.map(rubric => {
    const existing = existingScores.find(s => s.rubric_id === rubric.id)
    return {
      rubric_id: rubric.id,
      criteria_name: rubric.criteria_name,
      max_points: rubric.max_points || 10,
      score: existing ? existing.points_awarded : 0,
    }
  })

  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema),
    defaultValues: {
      rubricScores: defaultRubricScores,
      feedback: initialEvaluation?.feedback ?? "",
      isDraft: initialEvaluation?.is_draft ?? false,
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "rubricScores",
  })

  // Watch scores to calculate the live total
  const watchedScores = form.watch("rubricScores")
  const currentTotal = watchedScores.reduce((sum, item) => sum + (Number(item.score) || 0), 0)
  const maxTotal = rubrics.reduce((sum, r) => sum + (r.max_points || 10), 0)

  const onSubmit = async (data: GradingFormValues, isDraftOverride?: boolean) => {
    setIsSubmitting(true)
    try {
      const finalIsDraft = isDraftOverride !== undefined ? isDraftOverride : data.isDraft
      
      // Clean up payload for the server action
      const submissionScores = data.rubricScores.map(item => ({
        rubric_id: item.rubric_id,
        score: item.score
      }))

      const result = await submitEvaluation(
        submissionId,
        submissionScores,
        data.feedback,
        finalIsDraft
      )

      if (result.success) {
        toast.success(
          finalIsDraft
            ? "Draft saved successfully"
            : "Evaluation submitted successfully"
        )
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
    <Card className="border-t-4 border-t-primary shadow-md">
      <CardHeader>
        <CardTitle>Scorecard</CardTitle>
      </CardHeader>
      <CardContent>
        {rubrics.length === 0 ? (
           <div className="text-center py-6 text-muted-foreground">
             No rubrics have been defined for this challenge.
           </div>
        ) : (
          <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-8">
            
            {/* Dynamic Rubric Inputs */}
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-base font-semibold">{field.criteria_name}</Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Max: {field.max_points} pts
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-24 space-y-1">
                      <Input
                        type="number"
                        min={0}
                        max={field.max_points}
                        {...form.register(`rubricScores.${index}.score` as const, { valueAsNumber: true })}
                      />
                      {form.formState.errors.rubricScores?.[index]?.score && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.rubricScores[index]?.score?.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Visual Progress Bar indicator */}
                    <div className="flex-1 h-2 mt-4 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/50 transition-all duration-300" 
                        style={{ width: `${Math.min((watchedScores[index]?.score || 0) / field.max_points * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Score Display */}
            <div className="bg-muted/30 p-4 rounded-lg border flex justify-between items-center">
              <span className="font-bold text-lg">Total Score</span>
              <div className="text-2xl font-bold">
                <span className="text-primary">{currentTotal}</span>
                <span className="text-muted-foreground text-lg font-normal"> / {maxTotal}</span>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Overall Feedback *</Label>
              <Textarea
                id="feedback"
                {...form.register("feedback")}
                placeholder="Provide detailed, constructive feedback..."
                rows={6}
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
              <Label htmlFor="isDraft" className="text-sm font-normal cursor-pointer">
                Save as Draft
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="default"
                disabled={isSubmitting}
                onClick={() => {
                  form.handleSubmit((data) => onSubmit(data, false))()
                }}
                className="flex-1"
              >
                {isSubmitting && !form.watch("isDraft") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Final Review
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
                {isSubmitting && form.watch("isDraft") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Draft
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}