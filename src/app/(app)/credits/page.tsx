import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CREDIT_PACKS } from '@/types'
import { CreditPackCard } from '@/components/credits/CreditPackCard'

export const metadata = { title: 'Buy Credits — StageAI' }

export default async function CreditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/credits')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold mb-2">Buy Credits</h1>
      <p className="text-sm text-muted-foreground mb-8">
        1 credit = 1 AI generation. Credits never expire.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {CREDIT_PACKS.map(pack => (
          <CreditPackCard key={pack.key} pack={pack} />
        ))}
      </div>
    </div>
  )
}
