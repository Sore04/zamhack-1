"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/app/(student)/profile/actions"
import { Database } from "@/types/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface EditProfileDialogProps {
  profile: Profile | null
}

export const EditProfileDialog = ({ profile }: EditProfileDialogProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const router = useRouter()

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [university, setUniversity] = useState("")
  const [degree, setDegree] = useState("")
  const [graduationYear, setGraduationYear] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [resumeLink, setResumeLink] = useState("")

  // Pre-fill form when profile data changes or dialog opens
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setBio(profile.bio || "")
      setUniversity(profile.university || "")
      setDegree(profile.degree || "")
      setGraduationYear(profile.graduation_year?.toString() || "")
      setGithubUrl(profile.github_url || "")
      setLinkedinUrl(profile.linkedin_url || "")
      setResumeLink(profile.resume_link || "")
    }
  }, [profile, open])

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setToast(null)

    try {
      const formData = new FormData()
      if (firstName.trim()) formData.append("first_name", firstName.trim())
      if (lastName.trim()) formData.append("last_name", lastName.trim())
      if (bio.trim()) formData.append("bio", bio.trim())
      if (university.trim()) formData.append("university", university.trim())
      if (degree.trim()) formData.append("degree", degree.trim())
      if (graduationYear.trim()) formData.append("graduation_year", graduationYear.trim())
      if (githubUrl.trim()) formData.append("github_url", githubUrl.trim())
      if (linkedinUrl.trim()) formData.append("linkedin_url", linkedinUrl.trim())
      if (resumeLink.trim()) formData.append("resume_link", resumeLink.trim())

      const result = await updateProfile(formData)

      if (result.error) {
        setToast({ message: result.error, type: "error" })
      } else {
        setToast({ message: "Profile updated successfully!", type: "success" })
        // Close dialog and refresh page after a short delay
        setTimeout(() => {
          setOpen(false)
          router.refresh()
        }, 1000)
      }
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. All fields are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSubmitting}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSubmitting}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isSubmitting}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              disabled={isSubmitting}
              placeholder="University Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                disabled={isSubmitting}
                placeholder="Bachelor of Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduation_year">Graduation Year</Label>
              <Input
                id="graduation_year"
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                disabled={isSubmitting}
                placeholder="2024"
                min="1900"
                max="2100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={isSubmitting}
              placeholder="https://github.com/username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={isSubmitting}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume_link">Resume Link</Label>
            <Input
              id="resume_link"
              type="url"
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
              disabled={isSubmitting}
              placeholder="https://example.com/resume.pdf"
            />
          </div>

          {toast && (
            <div
              className={`p-3 rounded-md text-sm ${
                toast.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
              role="alert"
            >
              {toast.message}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}












