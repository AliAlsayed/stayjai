import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreditBadge } from '@/components/credits/CreditBadge'
import { SignOutButton } from '@/components/auth/SignOutButton'

const navLinkClass = 'text-xs text-muted-foreground hover:text-foreground transition-colors'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-10">
      <Link href="/" className="font-semibold text-sm tracking-tight text-foreground">
        StageAI
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href="/dashboard" className={navLinkClass}>Dashboard</Link>
            <Link href="/history" className={navLinkClass}>History</Link>
            <Link href="/credits" className={navLinkClass}>Credits</Link>
            <Link href="/account" className={navLinkClass}>Account</Link>
            <CreditBadge />
            <SignOutButton />
          </>
        ) : (
          <Link
            href="/login"
            className="text-xs font-medium text-foreground hover:opacity-75 transition-opacity"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
