'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? ''

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback/reset-password`,
  })

  return { error: error?.message ?? null }
}
