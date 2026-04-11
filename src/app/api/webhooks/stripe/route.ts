import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { insertCreditTransaction } from '@/lib/credits/ledger'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { purchase_id, user_id, credits } = session.metadata ?? {}

    if (!purchase_id || !user_id || !credits) {
      console.error('[stripe webhook] missing metadata', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Idempotency check
    const { data: purchase } = await supabase
      .from('credit_pack_purchases')
      .select('id, status')
      .eq('id', purchase_id)
      .single()

    if (!purchase || purchase.status === 'confirmed') {
      return NextResponse.json({ received: true })
    }

    await supabase
      .from('credit_pack_purchases')
      .update({ status: 'confirmed', stripe_session_id: session.id, confirmed_at: new Date().toISOString() })
      .eq('id', purchase_id)

    await insertCreditTransaction({
      userId: user_id,
      type: 'credit_purchase',
      amount: Number(credits),
      reason: 'stripe_webhook_confirmed',
      purchaseId: purchase_id,
    })
  }

  return NextResponse.json({ received: true })
}
