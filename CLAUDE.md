@AGENTS.md

# StageAI — Codebase Rules

## Stack
- Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
- Supabase: Postgres (with RLS) + Storage + Auth (Google OAuth + magic link)
- Stripe (webhooks only for credit fulfillment)
- Nano Banana (AI provider: image-to-image staging + inpainting)
- Vercel (hosting)

## Security Rules (Non-Negotiable)
1. All AI and payment API calls must be server-side only — never in client code
2. Never expose Nano Banana, Stripe secret key, or Supabase service role key to the client
3. RLS must be enabled on every user-owned table
4. Supabase Storage is private by default — always use signed URLs, never public URLs
5. Credit deduction logic is server-side only — never trust the client
6. Credits are only granted after verified Stripe webhook confirmation
7. Users can only access their own uploads, generations, masks, projects, and transactions
8. Guest sessions must use non-guessable UUIDs and be isolated from other sessions
9. File uploads must be validated server-side: allowed formats, file size, dimensions
10. All credit and purchase events must be recorded in the append-only transaction ledger

## Credit System Rules
- The credit ledger (`credit_transactions`) is append-only — never mutate existing rows
- Credit is reserved at generation start, finalized on success, restored on failure
- User balance = `SUM(amount)` across all their credit_transactions
- Transaction types: `signup_bonus` (+3), `generation_success` (−1), `generation_refund` (+1), `credit_purchase` (+N)
- Downloading an image never consumes a credit
- New users (including guests) get 3 free credits via `signup_bonus`

## API Routes
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/upload` | Guest or User |
| POST | `/api/generate` | Guest or User |
| POST | `/api/inpaint` | Guest or User |
| GET | `/api/generations/:id` | Owner only |
| GET | `/api/credits` | Guest or User |
| POST | `/api/checkout` | User required |
| POST | `/api/webhooks/stripe` | Stripe signature |
| GET | `/api/history` | User required |

## Data Model (Key Tables)
- `users` — Supabase Auth user ID as PK
- `guest_sessions` — non-guessable UUID; `converted_to` set on signup
- `projects` — belongs to user or guest session; holds room_type
- `uploaded_images` — denormalized `user_id` for RLS
- `generations` — type: `initial_staging | full_regeneration | inpainting`; status: `pending | completed | failed`
- `generated_output_images` — one per generation
- `inpainting_masks` — short-term retention (7–30 days)
- `credit_transactions` — append-only ledger
- `credit_pack_purchases` — status: `pending | confirmed | failed`; Stripe webhook is the only thing that sets `confirmed`

## Storage Layout (bucket: `stageai-assets`, private)
```
/uploads/{user_id}/{uuid}.jpg
/outputs/{user_id}/{uuid}.jpg
/masks/{user_id}/{uuid}.png
```

## Auth & Guest Sessions
- Guests get a UUID session stored in cookie/localStorage; 3 free credits on creation
- Sign-up triggers migration: all guest records (`projects`, `uploads`, `generations`, `credit_transactions`) are updated to the new `user_id`
- `guest_sessions.converted_to` is set after migration

## Generation Flow (Summary)
1. Check credit balance server-side; return 402 if zero
2. Create generation record (`pending`) + reserve credit (`amount: -1`)
3. Fetch source image via signed URL
4. Call Nano Banana server-side
5. Upload output to Supabase Storage
6. Finalize generation (`completed`) + finalize credit deduction
7. On any failure: set generation to `failed` + insert `generation_refund` (+1)

## Credit Packs
| Key | Credits | Price |
|-----|---------|-------|
| `starter_20` | 20 | $19 |
| `standard_60` | 60 | $39 |
| `pro_150` | 150 | $79 |

## Style Notes
- All UI must use Tailwind theme tokens configured from `docs/brand.md` — that file is the single source of truth for all design tokens
- Never use raw hex colors (e.g. `#fff`, `color: '#3b82f6'`), hardcoded font sizes/weights, or hardcoded margin/padding/gap values in components
- Always use a CSS custom property token mapped through `@theme inline` in `globals.css`, then consumed via a Tailwind utility class (e.g. `bg-primary`, `text-muted-foreground`, `rounded-lg`)
- When adding a new color, radius, shadow, or font token: add it to `globals.css` first, map it in `@theme inline`, document it in `docs/brand.md`, then use the Tailwind class
- Use Tailwind's type scale for font sizes (`text-sm`, `text-lg`, etc.) and weight utilities (`font-medium`, `font-semibold`) — never inline style values

## What This Product Is NOT
- Not a general-purpose image generation tool
- No subscriptions (pay-as-you-go only)
- No listing portal integrations
- No collaborative workflows
- No open-ended creative prompting
