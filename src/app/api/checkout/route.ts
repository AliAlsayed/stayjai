import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { CREDIT_PACKS } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { pack_key } = await req.json() as { pack_key: string }
  const pack = CREDIT_PACKS.find(p => p.key === pack_key)

  if (!pack) {
    return NextResponse.json({ error: 'Invalid pack key' }, { status: 400 })
  }

  const purchaseId = uuidv4()

  // Create pending purchase record
  await supabase.from('credit_pack_purchases').insert({
    id: purchaseId,
    user_id: user.id,
    pack_key: pack.key,
    credits: pack.credits,
    price_cents: pack.priceCents,
    currency: 'usd',
    status: 'pending',
  })

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: pack.priceCents,
          product_data: {
            name: `StageAI ${pack.name} Pack — ${pack.credits} Credits`,
          },
        },
      },
    ],
    metadata: {
      purchase_id: purchaseId,
      user_id: user.id,
      pack_key: pack.key,
      credits: String(pack.credits),
    },
    success_url: `${origin}/credits?success=1`,
    cancel_url: `${origin}/credits?canceled=1`,
  })

  await supabase
    .from('credit_pack_purchases')
    .update({ stripe_session_id: session.id })
    .eq('id', purchaseId)

  return NextResponse.json({ checkout_url: session.url })
}
