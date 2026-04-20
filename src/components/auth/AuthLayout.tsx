import Link from 'next/link'

const CURRENT_YEAR = new Date().getFullYear()

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12">
        <Link href="/" className="text-sm font-semibold tracking-tight text-background opacity-90">
          StageAI
        </Link>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-background opacity-40">
              AI Virtual Staging
            </p>
            <h2 className="text-4xl font-semibold leading-tight text-background">
              Transform empty rooms into listing-ready interiors.
            </h2>
          </div>
          <p className="text-sm text-background opacity-50 leading-relaxed max-w-xs">
            Upload a photo. Pick a style. Get a professionally staged result in seconds — no furniture, no photographer.
          </p>
        </div>
        <p className="text-xs text-background opacity-25 tracking-wide">
          © {CURRENT_YEAR} StageAI
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <Link href="/" className="lg:hidden text-sm font-semibold tracking-tight text-foreground">
            StageAI
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
