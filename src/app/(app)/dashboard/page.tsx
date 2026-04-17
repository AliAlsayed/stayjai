import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getCreditBalance(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credit_transactions')
    .select('amount')
    .eq('user_id', userId)
  if (!data) return 0
  return data.reduce((sum, row) => sum + row.amount, 0)
}

async function getRecentGenerationCount(userId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
  return count ?? 0
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [credits, generationCount] = await Promise.all([
    getCreditBalance(user.id),
    getRecentGenerationCount(user.id),
  ])

  const displayName = user.email?.split('@')[0] ?? 'there'

  return (
    <div className="flex-1 flex flex-col px-4 py-10 max-w-2xl mx-auto w-full gap-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ready to transform your next listing?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Credits
          </p>
          <p className="text-3xl font-semibold text-foreground">{credits}</p>
          <p className="text-xs text-muted-foreground">available to use</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Stagings
          </p>
          <p className="text-3xl font-semibold text-foreground">{generationCount}</p>
          <p className="text-xs text-muted-foreground">completed</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          Start Staging
        </Link>

        {generationCount > 0 && (
          <Link
            href="/history"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground text-sm font-medium px-5 py-2.5 hover:bg-muted transition-colors"
          >
            View History
          </Link>
        )}

        {credits === 0 && (
          <Link
            href="/credits"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground text-sm font-medium px-5 py-2.5 hover:bg-muted transition-colors"
          >
            Get More Credits
          </Link>
        )}
      </div>
    </div>
  )
}
