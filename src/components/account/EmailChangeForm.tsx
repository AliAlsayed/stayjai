'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EmailChangeForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (email === currentEmail) {
      toast.error('That is already your current email address.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ email })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        A confirmation link has been sent to{' '}
        <span className="text-foreground font-medium">{email}</span>. Click it to confirm the change.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">New email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !email || email === currentEmail}
        className="w-full sm:w-auto"
      >
        {loading ? 'Sending…' : 'Update email'}
      </Button>
    </form>
  )
}
