import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import { Github, Linkedin, FileText, GraduationCap, BookOpen } from "lucide-react"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

async function getProfileData() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
  }

  return {
    profile: profile as Profile | null,
    user,
  }
}

const getInitials = (firstName: string | null, lastName: string | null): string => {
  const first = firstName?.charAt(0).toUpperCase() || ""
  const last = lastName?.charAt(0).toUpperCase() || ""
  return first + last || "U"
}

export default async function ProfilePage() {
  const { profile, user } = await getProfileData()

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
    : "User"

  const headline = profile
    ? [profile.university, profile.degree].filter(Boolean).join(" • ") || "No education information"
    : "No education information"

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={fullName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile?.first_name || null, profile?.last_name || null)
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <p className="text-muted-foreground mt-1">{headline}</p>
              </div>
            </div>
            <EditProfileDialog profile={profile} />
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* About Me */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.bio ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No bio added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile?.github_url ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground italic py-2">
                  No GitHub link added
                </div>
              )}

              {profile?.linkedin_url ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground italic py-2">
                  No LinkedIn link added
                </div>
              )}

              {profile?.resume_link ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={profile.resume_link} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    Resume
                  </a>
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground italic py-2">
                  No resume link added
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.university ? (
                <div>
                  <p className="text-sm font-medium">University</p>
                  <p className="text-sm text-muted-foreground">{profile.university}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No university added</p>
              )}

              {profile?.degree ? (
                <div>
                  <p className="text-sm font-medium">Degree</p>
                  <p className="text-sm text-muted-foreground">{profile.degree}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No degree added</p>
              )}

              {profile?.graduation_year ? (
                <div>
                  <p className="text-sm font-medium">Graduation Year</p>
                  <p className="text-sm text-muted-foreground">{profile.graduation_year}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No graduation year added</p>
              )}
            </CardContent>
          </Card>

          {/* Skills - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                Skills section coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}












