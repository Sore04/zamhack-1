import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, FileText, GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !profile) notFound()

  const { data: studentSkills } = await supabase
    .from("student_skills")
    .select("level, skill:skills(name)")
    .eq("profile_id", params.id)

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Student"

  const getInitials = (first: string | null, last: string | null) =>
    `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase() || "S"

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/company/talent">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Talent Search
        </Link>
      </Button>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {getInitials(profile.first_name, profile.last_name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{fullName}</h1>
              {profile.university && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {profile.university}
                  {profile.degree ? ` • ${profile.degree}` : ""}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        {profile.bio && (
          <CardContent>
            <p className="text-muted-foreground">{profile.bio}</p>
          </CardContent>
        )}
      </Card>

      {/* Skills */}
      {studentSkills && studentSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {studentSkills.map((entry) => {
              const skillName = (entry.skill as { name: string } | null)?.name
              if (!skillName) return null
              return (
                <Badge key={skillName} variant="secondary">
                  {skillName}
                  <span className="ml-1 text-xs opacity-60 capitalize">
                    · {entry.level}
                  </span>
                </Badge>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.github_url ? (
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" /> GitHub
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground italic">No GitHub link</p>
          )}
          {profile.linkedin_url ? (
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground italic">No LinkedIn link</p>
          )}
          {profile.resume_link ? (
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href={profile.resume_link} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" /> Resume
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground italic">No resume link</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}