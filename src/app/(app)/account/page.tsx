import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmailChangeForm } from '@/components/account/EmailChangeForm'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Only show password section for email/password accounts, not OAuth-only accounts
  const hasPasswordProvider = user.identities?.some(i => i.provider === 'email') ?? false

  return (
    <div className="flex-1 flex flex-col px-4 py-10 max-w-2xl mx-auto w-full gap-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Account settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">Email address</h2>
          <p className="text-xs text-muted-foreground">
            Change the email associated with your account. You&apos;ll need to confirm the new address.
          </p>
        </div>
        <EmailChangeForm currentEmail={user.email ?? ''} />
      </div>

      {hasPasswordProvider && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-foreground">Password</h2>
            <p className="text-xs text-muted-foreground">
              Update the password for your account.
            </p>
          </div>
          <ChangePasswordForm />
        </div>
      )}
    </div>
  )
}
