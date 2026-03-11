"use server";

import { createClient } from "@/utils/supabase/server";

export async function getOrCreateDirectConversation(studentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Step 1: Get all conversation_ids the current user is part of
  const { data: myParticipations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);

  const myConversationIds = (myParticipations ?? []).map(
    (p) => p.conversation_id
  );

  if (myConversationIds.length > 0) {
    // Step 2: Find any of those conversations that the student is also part of
    const { data: sharedParticipations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", studentId)
      .in("conversation_id", myConversationIds);

    if (sharedParticipations && sharedParticipations.length > 0) {
      const sharedIds = sharedParticipations.map((p) => p.conversation_id);

      // Step 3: Verify it's a direct conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("type", "direct")
        .in("id", sharedIds)
        .limit(1)
        .single();

      if (conv) return { conversationId: conv.id };
    }
  }

  // No existing conversation — create one
  const { data: newConv, error: convError } = await supabase
    .from("conversations")
    .insert({ type: "direct" })
    .select()
    .single();

  if (convError || !newConv) {
    return { error: convError?.message ?? "Failed to create conversation" };
  }

  // Add both participants using profile_id
  const { error: participantsError } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: newConv.id, profile_id: user.id },
      { conversation_id: newConv.id, profile_id: studentId },
    ]);

  if (participantsError) {
    return { error: participantsError.message };
  }

  return { conversationId: newConv.id };
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", messages: [] };

  // Verify the user is a participant
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!participant) return { error: "Access denied", messages: [] };

  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `
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
    `
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return { error: error.message, messages: [] };

  return { messages: messages ?? [], currentUserId: user.id };
}

export async function sendDirectMessage(
  conversationId: string,
  content: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify the user is a participant
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!participant) return { error: "Access denied" };

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      is_read: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return { message };
}

export async function markConversationAsRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("is_read", false)

  return { success: true }
}