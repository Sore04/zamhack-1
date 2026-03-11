"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

// Module-level set — persists across renders/navigations for the lifetime of the page session
const readConversationIds = new Set<string>()

export function UnreadMessagesBadge() {
  const [count, setCount] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeConversationId = pathname === "/messages"
    ? searchParams.get("conversation")
    : null

  // Track the currently open conversation as read immediately
  useEffect(() => {
    if (activeConversationId) {
      readConversationIds.add(activeConversationId)
      setCount(0)
    }
  }, [activeConversationId])

  const fetchCount = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", user.id)

    const ids = (participations ?? []).map((p) => p.conversation_id)
    if (ids.length === 0) { setCount(0); return }

    const { data: unread } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", ids)
      .eq("is_read", false)
      .neq("sender_id", user.id)

    // Filter out conversations the user has already opened this session
    const distinct = new Set(
      (unread ?? [])
        .map((m) => m.conversation_id)
        .filter((id): id is string => id !== null && !readConversationIds.has(id))
    )
    setCount(distinct.size)
  }

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 8_000)
    return () => clearInterval(interval)
  }, []) // only on mount — module-level set handles the filtering

  if (count === 0) return null

  return (
    <span style={{
      marginLeft: "auto",
      background: "#e8836f",
      color: "#fff",
      borderRadius: 999,
      fontSize: "0.65rem",
      fontWeight: 700,
      padding: "1px 7px",
      minWidth: 18,
      textAlign: "center",
    }}>
      {count}
    </span>
  )
}