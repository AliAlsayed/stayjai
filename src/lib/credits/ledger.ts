import { createServiceClient } from '@/lib/supabase/server'
import { type CreditTransactionType } from '@/types/database'

export async function getCreditBalance(opts: {
  userId?: string
  guestSessionId?: string
}): Promise<number> {
  const supabase = await createServiceClient()

  let query = supabase
    .from('credit_transactions')
    .select('amount')

  if (opts.userId) {
    query = query.eq('user_id', opts.userId)
  } else if (opts.guestSessionId) {
    query = query.eq('guest_session_id', opts.guestSessionId)
  } else {
    return 0
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch credit balance: ${error.message}`)
  }

  return (data ?? []).reduce((sum, tx) => sum + tx.amount, 0)
}

export async function insertCreditTransaction(tx: {
  userId?: string
  guestSessionId?: string
  type: CreditTransactionType
  amount: number
  reason?: string
  generationId?: string
  purchaseId?: string
}): Promise<string> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: tx.userId ?? null,
      guest_session_id: tx.guestSessionId ?? null,
      type: tx.type,
      amount: tx.amount,
      reason: tx.reason ?? null,
      generation_id: tx.generationId ?? null,
      purchase_id: tx.purchaseId ?? null,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to insert credit transaction: ${error.message}`)
  }

  return data.id
}
