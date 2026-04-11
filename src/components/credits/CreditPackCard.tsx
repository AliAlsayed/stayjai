'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { CreditPack } from '@/types'

export function CreditPackCard({ pack }: { pack: CreditPack }) {
  const [loading, setLoading] = useState(false)

  async function handlePurchase() {
    setLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack_key: pack.key }),
    })
    const data = await res.json()
    if (data.checkout_url) {
      window.location.href = data.checkout_url
    }
    setLoading(false)
  }

  return (
    <Card className={`p-5 flex flex-col gap-3 relative ${pack.featured ? 'ring-2 ring-neutral-900' : ''}`}>
      {pack.featured && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-medium bg-neutral-900 text-white px-2 py-0.5 rounded-full">
          Most popular
        </span>
      )}
      <div>
        <p className="font-semibold">{pack.name}</p>
        <p className="text-2xl font-bold mt-1">${(pack.priceCents / 100).toFixed(0)}</p>
        <p className="text-sm text-neutral-500">{pack.credits} credits</p>
      </div>
      <Button
        onClick={handlePurchase}
        disabled={loading}
        variant={pack.featured ? 'default' : 'outline'}
        className="w-full mt-auto"
      >
        {loading ? 'Loading…' : 'Buy'}
      </Button>
    </Card>
  )
}
