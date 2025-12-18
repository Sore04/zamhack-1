"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, isAfter, isBefore, startOfDay } from "date-fns"
import { CalendarIcon, Plus, Trash2, ChevronRight, ChevronLeft, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { createChallenge } from "@/app/challenges/create-actions"
import { toast } from "sonner"

// --- Schemas ---
const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  requiresGithub: z.boolean().default(false),
  requiresUrl: z.boolean().default(false),
  requiresText: z.boolean().default(false),
})

const formSchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  industry: z.string().min(1, "Industry is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  participationType: z.enum(["solo", "team", "both"]),
  maxParticipants: z.union([z.string(), z.number()]).optional(),
  maxTeams: z.union([z.string(), z.number()]).optional(),
  maxTeamSize: z.union([z.string(), z.number()]).optional(),
  
  // Step 2: Timeline
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  registrationDeadline: z.date().optional(),
  
  // Step 3: Milestones
  milestones: z.array(milestoneSchema).min(1, "At least one milestone is required"),
  
  // Step 4: Skills
  skills: z.array(z.string()).min(1, "Add at least one skill"),
})

type FormValues = z.infer<typeof formSchema>

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "E-commerce", "Other"]
const DIFFICULTIES = ["beginner", "intermediate", "advanced"]
const TYPES = ["solo", "team", "both"]

const STEPS = ["Basic Info", "Timeline", "Milestones", "Skills", "Review"]

export const CreateChallengeForm = ({ organizationId }: { organizationId: string }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [skillsInput, setSkillsInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participationType: "solo",
      difficulty: "beginner",
      milestones: [{ title: "Final Submission", requiresGithub: true, requiresUrl: true, requiresText: true }],
      skills: [],
    },
    mode: "onChange", 
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestones",
  })

  const watchedValues = form.watch()

  // --- Validation Logic ---
  const validateStep = async (step: number) => {
    let fieldsToValidate: any[] = []
    
    switch (step) {
      case 1:
        fieldsToValidate = ["title", "description", "industry", "difficulty", "participationType"]
        break
      case 2:
        fieldsToValidate = ["startDate", "endDate"]
        break
      case 3:
        fieldsToValidate = ["milestones"]
        break
      case 4:
        fieldsToValidate = ["skills"]
        break
    }
    
    const isFieldsValid = await form.trigger(fieldsToValidate)
    if (!isFieldsValid) return false

    // Date Logic Checks
    if (step === 2) {
      const start = form.getValues("startDate")
      const end = form.getValues("endDate")
      const reg = form.getValues("registrationDeadline")

      if (isAfter(start, end) || start.getTime() === end.getTime()) {
        form.setError("endDate", { message: "End date must be after start date" })
        return false
      }
      
      if (reg && (isAfter(reg, end))) {
         form.setError("registrationDeadline", { message: "Registration must end before challenge ends" })
         return false
      }
    }

    if (step === 3) {
      const start = startOfDay(form.getValues("startDate"))
      const end = startOfDay(form.getValues("endDate"))
      const milestones = form.getValues("milestones")
      
      let milestoneError = false
      
      milestones.forEach((m, idx) => {
        if (!m.dueDate) return
        const due = startOfDay(m.dueDate)
        
        if (isBefore(due, start) || isAfter(due, end)) {
          form.setError(`milestones.${idx}.dueDate`, { 
            message: `Date must be between ${format(start, 'MMM d')} and ${format(end, 'MMM d')}` 
          })
          milestoneError = true
        }
      })
      
      if (milestoneError) {
        toast.error("Please fix milestone dates")
        return false
      }
    }

    return true
  }

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault()
    const isValid = await validateStep(currentStep)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // --- Skills Input Logic ---
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.includes(",")) {
      const newSkills = val.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      const currentSkills = form.getValues("skills") || []
      const uniqueSkills = Array.from(new Set([...currentSkills, ...newSkills]))
      form.setValue("skills", uniqueSkills)
      form.trigger("skills")
      setSkillsInput("")
    } else {
      setSkillsInput(val)
    }
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      const val = skillsInput.trim()
      if (val) {
        const currentSkills = form.getValues("skills") || []
        if (!currentSkills.includes(val)) {
          form.setValue("skills", [...currentSkills, val])
          form.trigger("skills")
        }
        setSkillsInput("")
      }
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills")
    form.setValue("skills", currentSkills.filter((s) => s !== skillToRemove))
  }

  // --- Submission ---
  const onSubmit = async (data: FormValues) => {
    // FIX: Guard Clause to prevent premature submission
    if (currentStep !== STEPS.length) return

    setIsSubmitting(true)
    try {
      const result = await createChallenge({
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        registrationDeadline: data.registrationDeadline?.toISOString(),
        maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : undefined,
        maxTeams: data.maxTeams ? Number(data.maxTeams) : undefined,
        maxTeamSize: data.maxTeamSize ? Number(data.maxTeamSize) : undefined,
        milestones: data.milestones.map(m => ({
            ...m,
            dueDate: m.dueDate.toISOString()
        })),
        organizationId,
      })

      if (result.success) {
        toast.success("Challenge created successfully!")
        router.push("/company/dashboard")
      } else {
        console.error(result.error)
        toast.error("Failed to create challenge: " + result.error)
      }
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Global Enter prevention
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault()
    }
  }

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex justify-between items-center px-2">
        {STEPS.map((step, index) => {
          const stepNum = index + 1
          const isActive = stepNum === currentStep
          const isCompleted = stepNum < currentStep
          return (
            <div key={step} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : 
                  isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {stepNum}
              </div>
              <span className={cn("text-xs hidden sm:block", isActive ? "font-medium" : "text-muted-foreground")}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1]}</CardTitle>
          <CardDescription>Step {currentStep} of {STEPS.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            onKeyDown={handleKeyDown} 
            className="space-y-6"
          >
            
            {/* STEP 1: BASIC INFO */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Challenge Title</Label>
                  <Input {...form.register("title")} placeholder="e.g. AI Customer Support Bot" />
                  {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea {...form.register("description")} placeholder="Describe the challenge..." rows={5} />
                  {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select onValueChange={(val) => form.setValue("industry", val)} defaultValue={watchedValues.industry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.industry && <p className="text-xs text-destructive">{form.formState.errors.industry.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select onValueChange={(val: any) => form.setValue("difficulty", val)} defaultValue={watchedValues.difficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                    <Label>Participation Type</Label>
                    <div className="flex gap-4">
                        {TYPES.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                                <input 
                                    type="radio" 
                                    id={type} 
                                    value={type}
                                    checked={watchedValues.participationType === type}
                                    onChange={() => form.setValue("participationType", type as any)}
                                    className="accent-primary h-4 w-4"
                                />
                                <Label htmlFor={type} className="capitalize cursor-pointer">{type}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Max Participants</Label>
                        <Input type="number" {...form.register("maxParticipants")} placeholder="50" />
                    </div>
                    {(watchedValues.participationType === "team" || watchedValues.participationType === "both") && (
                        <>
                            <div className="space-y-2">
                                <Label>Max Teams</Label>
                                <Input type="number" {...form.register("maxTeams")} placeholder="20" />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Team Size</Label>
                                <Input type="number" {...form.register("maxTeamSize")} placeholder="4" />
                            </div>
                        </>
                    )}
                </div>
              </div>
            )}

            {/* STEP 2: TIMELINE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 flex flex-col">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn(!watchedValues.startDate && "text-muted-foreground", "justify-start text-left font-normal")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {watchedValues.startDate ? format(watchedValues.startDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={watchedValues.startDate} onSelect={(date) => form.setValue("startDate", date!)} initialFocus />
                            </PopoverContent>
                        </Popover>
                        {form.formState.errors.startDate && <p className="text-xs text-destructive">{form.formState.errors.startDate.message}</p>}
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label>End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn(!watchedValues.endDate && "text-muted-foreground", "justify-start text-left font-normal")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {watchedValues.endDate ? format(watchedValues.endDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={watchedValues.endDate} onSelect={(date) => form.setValue("endDate", date!)} initialFocus />
                            </PopoverContent>
                        </Popover>
                        {form.formState.errors.endDate && <p className="text-xs text-destructive">{form.formState.errors.endDate.message}</p>}
                    </div>
                </div>
                
                {form.formState.errors.endDate?.message === "End date must be after start date" && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        Error: End date cannot be before the start date.
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Registration Deadline (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchedValues.registrationDeadline && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {watchedValues.registrationDeadline ? (
                            format(watchedValues.registrationDeadline, "PPP")
                            ) : (
                            <span>Pick a date (optional)</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={watchedValues.registrationDeadline}
                            onSelect={(date) => {
                            if (date) {
                                form.setValue("registrationDeadline", date)
                            }
                            }}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    {form.formState.errors.registrationDeadline && <p className="text-xs text-destructive">{form.formState.errors.registrationDeadline.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: MILESTONES */}
            {currentStep === 3 && (
                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                            <div className="flex justify-between items-start">
                                <h4 className="font-medium">Milestone {index + 1}</h4>
                                {fields.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input {...form.register(`milestones.${index}.title`)} placeholder="e.g. Project Proposal" />
                                    {form.formState.errors.milestones?.[index]?.title && <p className="text-xs text-destructive">{form.formState.errors.milestones[index]?.title?.message}</p>}
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label>Due Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn(!watchedValues.milestones[index]?.dueDate && "text-muted-foreground", "justify-start text-left font-normal")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {watchedValues.milestones[index]?.dueDate ? format(watchedValues.milestones[index].dueDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={watchedValues.milestones[index]?.dueDate} onSelect={(date) => form.setValue(`milestones.${index}.dueDate`, date!)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    {form.formState.errors.milestones?.[index]?.dueDate && <p className="text-xs text-destructive">{form.formState.errors.milestones[index]?.dueDate?.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Input {...form.register(`milestones.${index}.description`)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Submission Requirements</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`github-${index}`} 
                                            // FIX: Default to false to satisfy strictly boolean checked prop
                                            checked={watchedValues.milestones[index]?.requiresGithub || false} 
                                            onCheckedChange={(checked) => form.setValue(`milestones.${index}.requiresGithub`, checked as boolean)} 
                                        />
                                        <Label htmlFor={`github-${index}`}>GitHub Link</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`url-${index}`} 
                                            checked={watchedValues.milestones[index]?.requiresUrl || false} 
                                            onCheckedChange={(checked) => form.setValue(`milestones.${index}.requiresUrl`, checked as boolean)} 
                                        />
                                        <Label htmlFor={`url-${index}`}>Demo URL</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`text-${index}`} 
                                            checked={watchedValues.milestones[index]?.requiresText || false} 
                                            onCheckedChange={(checked) => form.setValue(`milestones.${index}.requiresText`, checked as boolean)} 
                                        />
                                        <Label htmlFor={`text-${index}`}>Written Report</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ title: "", description: "", dueDate: new Date(), requiresGithub: false, requiresUrl: false, requiresText: true })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Milestone
                    </Button>
                </div>
            )}

            {/* STEP 4: SKILLS */}
            {currentStep === 4 && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Required Skills</Label>
                        <p className="text-sm text-muted-foreground">Type a skill and press Enter or Comma to add.</p>
                        <Input 
                            value={skillsInput}
                            onChange={handleSkillsChange}
                            onKeyDown={handleSkillKeyDown}
                            placeholder="e.g. React, Python, Design..." 
                        />
                        {form.formState.errors.skills && <p className="text-xs text-destructive">{form.formState.errors.skills.message}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {watchedValues.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 5: REVIEW */}
            {currentStep === 5 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-muted-foreground text-sm">Challenge Title</h3>
                            <p>{watchedValues.title}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-muted-foreground text-sm">Difficulty</h3>
                            <p className="capitalize">{watchedValues.difficulty}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-muted-foreground text-sm">Timeline</h3>
                            <p>{format(watchedValues.startDate, "PP")} - {format(watchedValues.endDate, "PP")}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-muted-foreground text-sm">Milestones</h3>
                            <p>{watchedValues.milestones.length} milestones defined</p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-2">Skills</h3>
                        <div className="flex gap-2 flex-wrap">
                            {watchedValues.skills.map(s => (
                                <Badge key={s} variant="outline">{s}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* BUTTONS */}
            <div className="flex justify-between pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>

                {currentStep < STEPS.length ? (
                    <Button key="next-button" type="button" onClick={handleNext}>
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button key="submit-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Challenge"}
                    </Button>
                )}
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Badge Component
function Badge({ children, variant, className }: any) {
    return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className, variant === "secondary" ? "border-transparent bg-secondary text-secondary-foreground" : "text-foreground")}>{children}</span>
}