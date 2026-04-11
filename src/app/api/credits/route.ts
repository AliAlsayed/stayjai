import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCreditBalance } from '@/lib/credits/ledger'

export async function GET(req: NextRequest) {
  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  const guestSessionId = req.nextUrl.searchParams.get('guest_session_id') ?? undefined

  const balance = await getCreditBalance({
    userId: user?.id,
    guestSessionId,
  })

  return NextResponse.json({ balance })
}
