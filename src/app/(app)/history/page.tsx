import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'History — StageAI' }

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/history')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold mb-6">Your Generations</h1>
      <p className="text-sm text-muted-foreground">History will load here.</p>
    </div>
  )
}
