'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { sendPasswordResetEmail } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await sendPasswordResetEmail(email)
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      setSent(true)
    }
  }

  return (
    <AuthLayout>
      {sent ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If an account exists for{' '}
              <span className="text-foreground font-medium">{email}</span>,
              you&apos;ll receive a password reset link shortly.
            </p>
          </div>
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
            <p className="text-sm text-muted-foreground">
              Enter the email address for your account and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-foreground font-medium hover:underline underline-offset-2 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
