// src/app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ── Service Role Client (bypasses RLS — only used in server-side webhooks) ────
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Verify the webhook signature from PayMongo
// PayMongo sends a signature in the header to prove the request is from them
async function verifyPaymongoSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string
): Promise<boolean> {
  if (!signatureHeader) return false

  try {
    // PayMongo signature format: "t=<timestamp>,te=<test_sig>,li=<live_sig>"
    const parts = Object.fromEntries(
      signatureHeader.split(",").map((part) => part.split("=") as [string, string])
    )

    const timestamp = parts["t"]
    const signature = parts["te"] || parts["li"] // te = test, li = live

    if (!timestamp || !signature) return false

    // Reconstruct the signed payload: "<timestamp>.<rawBody>"
    const signedPayload = `${timestamp}.${rawBody}`

    // HMAC-SHA256 using the webhook secret
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    )

    // Convert to hex string
    const computedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    return computedSignature === signature
  } catch (err) {
    console.error("Signature verification error:", err)
    return false
  }
}

// ── Main Webhook Handler ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let rawBody: string

  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: "Could not read body." }, { status: 400 })
  }

  // ── 1. Verify Signature ────────────────────────────────────────────────────
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET

  if (!webhookSecret || webhookSecret === "whsec_placeholder_for_now") {
    // In development without a real webhook secret, skip verification
    // In production this should never be hit
    console.warn("⚠️  Webhook secret not set — skipping signature verification (dev mode)")
  } else {
    const signatureHeader = req.headers.get("paymongo-signature")
    const isValid = await verifyPaymongoSignature(rawBody, signatureHeader, webhookSecret)

    if (!isValid) {
      console.error("❌ Invalid PayMongo webhook signature")
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 })
    }
  }

  // ── 2. Parse Payload ───────────────────────────────────────────────────────
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const eventType = payload?.data?.attributes?.type
  console.log("📦 PayMongo webhook received:", eventType)

  // ── 3. Only Handle Successful Payment Events ───────────────────────────────
  // PayMongo fires this event when a checkout session is paid
  if (eventType !== "checkout_session.payment.paid") {
    // Acknowledge other events without processing them
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // ── 4. Extract Data from Payload ──────────────────────────────────────────
  // Metadata lives on payment_intent.attributes.metadata, NOT the checkout session
  const checkoutAttrs   = payload?.data?.attributes?.data?.attributes
  const sessionId       = payload?.data?.attributes?.data?.id
  const paymentIntent   = checkoutAttrs?.payment_intent
  const metadata        = paymentIntent?.attributes?.metadata
  const paymentIntentId = paymentIntent?.id ?? null

  const challengeId = metadata?.challenge_id ?? null
  const userId      = metadata?.user_id ?? null

  console.log("🔍 Extracted:", { sessionId, challengeId, userId })

  if (!sessionId || !challengeId || !userId) {
    console.error("❌ Missing required fields:", { sessionId, challengeId, userId })
    return NextResponse.json(
      { error: "Missing required fields in webhook payload." },
      { status: 400 }
    )
  }

  // ── 5. Initialize Supabase (Service Role — bypasses RLS) ──────────────────
  const supabase = createServiceClient()

  // ── 6. Idempotency Check ───────────────────────────────────────────────────
  // If we've already processed this session, don't join the challenge again
  // This protects against PayMongo firing the webhook more than once
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("checkout_session_id", sessionId)
    .single()

  if (existingPayment?.status === "paid") {
    console.log("✅ Already processed this payment session — skipping:", sessionId)
    return NextResponse.json({ received: true, skipped: true }, { status: 200 })
  }

  // ── 7. Update Payment Record to "paid" ────────────────────────────────────
  if (existingPayment) {
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingPayment.id)

    if (updateError) {
      console.error("❌ Failed to update payment record:", updateError)
      // Don't return error — still try to join the challenge below
    }
  } else {
    // Edge case: payment record wasn't created in create-checkout
    // Insert it now so we have a record
    const { error: insertError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        amount: paymentIntent?.attributes?.amount ?? 0,
        currency: "PHP",
        status: "paid",
        provider: "paymongo",
        checkout_session_id: sessionId,
        payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error("❌ Failed to insert payment record:", insertError)
    }
  }

  // ── 8. Check if Already a Participant ─────────────────────────────────────
  // Extra safety — don't double-join
  const { data: alreadyJoined } = await supabase
    .from("challenge_participants")
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .single()

  if (alreadyJoined) {
    console.log("✅ User already joined challenge — skipping joinChallenge():", userId)
    return NextResponse.json({ received: true, skipped: true }, { status: 200 })
  }

  // ── 9. Officially Join the Challenge ──────────────────────────────────────
  // joinChallenge() uses the session user, but webhook has no session.
  // So we insert the participant row directly here instead.
  const { error: joinError } = await supabase
    .from("challenge_participants")
    .insert({
      challenge_id: challengeId,
      user_id: userId,
      team_id: null,
      status: "active",
      joined_at: new Date().toISOString(),
    })

  if (joinError) {
    console.error("❌ Failed to join challenge after payment:", joinError)
    return NextResponse.json(
      { error: "Payment recorded but failed to join challenge." },
      { status: 500 }
    )
  }

  console.log(`✅ User ${userId} successfully joined challenge ${challengeId} after payment.`)

  // ── 10. Always return 200 to PayMongo ─────────────────────────────────────
  // If we return anything other than 200, PayMongo will retry the webhook
  return NextResponse.json({ received: true }, { status: 200 })
}