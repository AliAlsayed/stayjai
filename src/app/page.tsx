import { ImageUploader } from '@/components/upload/ImageUploader'
import { CreditBadge } from '@/components/credits/CreditBadge'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <span className="font-semibold text-sm tracking-tight">StageAI</span>
        <CreditBadge />
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-4 py-10 text-center gap-3">
        <h1 className="text-2xl font-semibold leading-tight max-w-xs">
          Stage any room in seconds
        </h1>
        <p className="text-sm text-neutral-500 max-w-xs">
          Upload a room photo, pick a style, and get a listing-ready interior — instantly.
        </p>
        <p className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          3 free credits — no account required
        </p>
      </section>

      {/* Upload surface */}
      <section className="px-4 pb-10 max-w-lg mx-auto w-full">
        <ImageUploader />
      </section>
    </div>
  )
}
