'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function CreditBadge() {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => setBalance(d.balance ?? 0))
      .catch(() => setBalance(0))
  }, [])

  if (balance === null) return null

  return (
    <Link href="/credits" className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-neutral-200 hover:border-neutral-400 transition-colors">
      <span className="text-amber-500">✦</span>
      <span>{balance} credit{balance !== 1 ? 's' : ''}</span>
    </Link>
  )
}
