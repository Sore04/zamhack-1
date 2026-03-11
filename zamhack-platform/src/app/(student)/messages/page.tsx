import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { MessagesClient } from "./messages-client"

export default async function StudentMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  const { conversation: activeConversationId } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch all direct conversations this student is part of
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id)

  const conversationIds = (participations ?? []).map((p) => p.conversation_id)

  let conversations: any[] = []

  if (conversationIds.length > 0) {
    const { data } = await supabase
      .from("conversations")
      .select(`
        id,
        type,
        created_at,
        conversation_participants (
          profile_id,
          profiles (
            id,
            first_name,
            last_name,
            avatar_url,
            role,
            organization_id,
            organizations ( name )
          )
        ),
        messages (
          id,
          content,
          created_at,
          sender_id,
          is_read
        )
      `)
      .in("id", conversationIds)
      .eq("type", "direct")
      .order("created_at", { ascending: false })

    conversations = data ?? []
  }

  // Build enriched list — unread count from DB (client will zero it out instantly)
  const enriched = conversations.map((conv) => {
    const otherParticipant = conv.conversation_participants?.find(
      (p: any) => p.profile_id !== user.id
    )
    const otherProfile = otherParticipant?.profiles

    const sortedMessages = [...(conv.messages ?? [])].sort(
      (a: any, b: any) =>
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )
    const lastMessage = sortedMessages[0] ?? null

    const unreadCount = (conv.messages ?? []).filter(
      (m: any) => !m.is_read && m.sender_id !== user.id
    ).length

    return { id: conv.id, otherProfile, lastMessage, unreadCount }
  })

  // Fetch message thread for active conversation
  let activeMessages: any[] = []
  let activeOtherProfile: any = null

  if (activeConversationId && conversationIds.includes(activeConversationId)) {
    const { data: msgs } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        is_read,
        sender_profile:profiles!sender_id (
          first_name,
          last_name,
          role,
          avatar_url
        )
      `)
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })

    activeMessages = msgs ?? []
    activeOtherProfile = enriched.find((c) => c.id === activeConversationId)?.otherProfile ?? null
  }

  return (
    <MessagesClient
      conversations={enriched}
      activeConversationId={activeConversationId ?? null}
      activeMessages={activeMessages}
      activeOtherProfile={activeOtherProfile}
      currentUserId={user.id}
    />
  )
}