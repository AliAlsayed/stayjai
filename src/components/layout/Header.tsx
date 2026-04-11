'use client'

import Link from 'next/link'
import { CreditBadge } from '@/components/credits/CreditBadge'

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white sticky top-0 z-10">
      <Link href="/" className="font-semibold text-sm tracking-tight">
        StageAI
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/history" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
          History
        </Link>
        <CreditBadge />
      </div>
    </header>
  )
}
