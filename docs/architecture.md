# StageAI — Technical Architecture

> Version 1.0 | April 2026

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                                                                 │
│  Next.js App Router  ·  TypeScript  ·  Tailwind  ·  shadcn/ui  │
│  HTML5 Canvas (mask tool)  ·  Mobile-first responsive layout   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Next.js on Vercel)                  │
│                                                                 │
│  Server Actions / API Routes                                    │
│  ├── Auth (Supabase Auth SDK)                                   │
│  ├── Upload handler (validates + stores to Supabase Storage)    │
│  ├── Generation service (calls Nano Banana, manages credits)    │
│  ├── Inpainting service (mask + prompt → Nano Banana)           │
│  ├── Credit ledger (append-only transactions)                   │
│  └── Stripe webhook handler (grants credits on confirmation)    │
└──────┬───────────────────┬───────────────────┬──────────────────┘
       │                   │                   │
┌──────▼──────┐   ┌────────▼──────┐   ┌────────▼──────┐
│  Supabase   │   │ Supabase      │   │    Stripe      │
│  Postgres   │   │ Storage       │   │  (Payments)    │
│  (+ Auth)   │   │               │   │                │
│  RLS on all │   │ Private-only  │   │  Credit pack   │
│  user data  │   │ Signed URLs   │   │  purchases     │
└─────────────┘   └───────────────┘   └───────────────┘
                                               │
                                      ┌────────▼──────┐
                                      │  Nano Banana   │
                                      │  (AI Provider) │
                                      │                │
                                      │  img-to-img    │
                                      │  inpainting    │
                                      └────────────────┘
```

---

## Primary User Flow — Data Flow

**"Take photo → stage → download"**

```
1. User opens app
   → Client loads guest session or authenticated session from Supabase Auth
   → Client fetches credit balance (sum of credit_transactions for user)

2. User uploads/captures room image
   → Client sends file to POST /api/upload
   → Backend validates: file type, size, dimensions
   → Backend uploads to Supabase Storage: /uploads/{user_id}/{uuid}.jpg
   → Backend creates uploaded_images record in Postgres
   → Returns: { image_id, storage_path }

3. User selects room type + style preset
   → Stored client-side until generation is triggered

4. User triggers generation
   → Client sends POST /api/generate
     { image_id, room_type, style_preset }
   → Backend checks credit balance (server-side ledger query)
   → If credits = 0: return 402, present purchase flow
   → If credits > 0:
       a. Create generation record (status: pending)
       b. Insert credit_transaction: { type: 'reserved', amount: -1 }
       c. Fetch source image from Supabase Storage (signed URL)
       d. Call Nano Banana API (server-side only)
       e. Receive generated image bytes
       f. Upload output to Supabase Storage: /outputs/{user_id}/{uuid}.jpg
       g. Create generated_output_images record
       h. Update generation record (status: completed)
       i. Finalize credit_transaction: { type: 'generation_success', amount: -1 }
          (or restore if failed: { type: 'generation_refund', amount: +1 })
   → Returns: { generation_id, output_image_url (signed) }

5. User views result
   → Client displays signed URL image
   → Credit balance updates (re-fetched or derived from response)

6. User downloads result
   → Client fetches image from signed URL
   → No credit consumed

7. Optional: User enters inpainting flow (see Inpainting Flow below)
```

---

## Inpainting Flow — Data Flow

```
1. User enters edit mode on a generated output image
   → Client renders the output image on HTML5 Canvas

2. User draws mask using brush tool
   → Canvas overlay captures brush strokes
   → Mask stored as canvas ImageData (client-side until submission)
   → Brush size adjustable; erase mode supported; clear/reset available

3. User enters refinement instruction
   → Text input: e.g., "replace this couch with a beige modern sofa"

4. User submits inpainting request
   → Client exports mask as PNG blob
   → Client sends POST /api/inpaint
     { source_generation_id, mask_blob, instruction }
   → Backend:
       a. Validates ownership of source_generation_id
       b. Uploads mask PNG to Supabase Storage: /masks/{user_id}/{uuid}.png
       c. Creates inpainting_mask record
       d. Creates generation record (type: inpainting, status: pending)
       e. Reserves 1 credit (same as staging flow)
       f. Fetches source output image from Supabase Storage
       g. Calls Nano Banana inpainting API with:
          - source image
          - mask image
          - instruction text
       h. Uploads inpainted output to Supabase Storage
       i. Creates generated_output_images record
       j. Finalizes credit deduction or restores on failure
   → Returns: { generation_id, output_image_url (signed) }

5. User reviews updated result
   → May repeat inpainting on new output (as long as credits available)
   → Or download
```

---

## Database Schema

### users
```sql
id              uuid PRIMARY KEY  -- Supabase Auth user ID
email           text
created_at      timestamptz
last_seen_at    timestamptz
```

### guest_sessions
```sql
id              uuid PRIMARY KEY  -- non-guessable session token
created_at      timestamptz
expires_at      timestamptz
converted_to    uuid REFERENCES users(id)  -- set when guest signs up
```

### projects
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)   -- null if guest
guest_session_id uuid REFERENCES guest_sessions(id)  -- null if auth'd
room_type       text  -- 'living_room' | 'bedroom' | 'dining_room' | etc.
created_at      timestamptz
```

### uploaded_images
```sql
id              uuid PRIMARY KEY
project_id      uuid REFERENCES projects(id)
user_id         uuid  -- denormalized for RLS
storage_path    text  -- Supabase Storage path
file_size       int
mime_type       text
width           int
height          int
created_at      timestamptz
```

### generations
```sql
id              uuid PRIMARY KEY
project_id      uuid REFERENCES projects(id)
user_id         uuid  -- denormalized for RLS
type            text  -- 'initial_staging' | 'full_regeneration' | 'inpainting'
status          text  -- 'pending' | 'completed' | 'failed'
source_image_id uuid  -- uploaded_images.id OR generated_output_images.id
mask_id         uuid REFERENCES inpainting_masks(id)  -- null unless inpainting
style_preset    text
room_type       text
instruction     text  -- inpainting instruction text
provider        text  -- 'nano_banana'
provider_job_id text  -- external job reference
created_at      timestamptz
completed_at    timestamptz
```

### generated_output_images
```sql
id              uuid PRIMARY KEY
generation_id   uuid REFERENCES generations(id)
project_id      uuid REFERENCES projects(id)
user_id         uuid  -- denormalized for RLS
storage_path    text  -- Supabase Storage path
created_at      timestamptz
```

### inpainting_masks
```sql
id              uuid PRIMARY KEY
project_id      uuid REFERENCES projects(id)
user_id         uuid  -- denormalized for RLS
source_output_id uuid REFERENCES generated_output_images(id)
storage_path    text  -- mask PNG in Supabase Storage
instruction     text
created_at      timestamptz
```

### credit_transactions
```sql
id              uuid PRIMARY KEY
user_id         uuid  -- null if guest
guest_session_id uuid  -- null if auth'd
type            text  -- 'signup_bonus' | 'generation_success' | 'generation_refund' | 'credit_purchase'
amount          int   -- positive = credit added, negative = deducted
reason          text
generation_id   uuid  -- if related to a generation
purchase_id     uuid  -- if related to a purchase
created_at      timestamptz
```

### credit_pack_purchases
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
pack_key        text  -- 'starter_20' | 'standard_60' | 'pro_150'
credits         int
price_cents     int
currency        text
status          text  -- 'pending' | 'confirmed' | 'failed'
stripe_payment_intent_id text
stripe_session_id text
created_at      timestamptz
confirmed_at    timestamptz
```

---

## API Routes Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/upload` | Guest or User | Validate + store uploaded image |
| POST | `/api/generate` | Guest or User | Trigger staging or regeneration |
| POST | `/api/inpaint` | Guest or User | Trigger inpainting on a prior output |
| GET | `/api/generations/:id` | Owner only | Poll generation status |
| GET | `/api/credits` | Guest or User | Return current credit balance |
| POST | `/api/checkout` | User required | Create Stripe checkout session |
| POST | `/api/webhooks/stripe` | Stripe signature | Handle payment confirmation → grant credits |
| GET | `/api/history` | User required | Return past projects/generations |

---

## File Storage Structure

```
Supabase Storage bucket: stageai-assets  (private)

/uploads/
  {user_id}/
    {uuid}.jpg       ← original room photos

/outputs/
  {user_id}/
    {uuid}.jpg       ← all generated outputs (staging, regen, inpaint)

/masks/
  {user_id}/
    {uuid}.png       ← inpainting mask PNGs (short-term retention)
```

All files accessed via **signed URLs** with time-limited expiry. No public URLs.

---

## Auth Flow

```
New user (guest):
  → App creates guest_session record (UUID, non-guessable)
  → guest_session_id stored in cookie / localStorage
  → 3 free credits added via credit_transactions (type: signup_bonus)
  → User can upload, generate, download

Sign-up triggered (purchase / history / cross-device):
  → Supabase Auth: Google OAuth or email magic link
  → On auth callback:
      a. Create users record (if new)
      b. Migrate guest_session data to user_id
      c. Set guest_sessions.converted_to = user.id
      d. Update all related records (projects, uploads, generations, transactions) to user_id

Returning user:
  → Supabase Auth session (JWT in cookie)
  → RLS enforces data access
```

---

## Payment Flow

```
1. User selects credit pack → POST /api/checkout
2. Backend creates Stripe Checkout session with:
   - price / pack info
   - metadata: { user_id, pack_key, credits }
3. User completes payment on Stripe-hosted page
4. Stripe sends webhook to POST /api/webhooks/stripe
5. Backend verifies Stripe signature
6. On checkout.session.completed:
   a. Lookup credit_pack_purchases record by stripe_session_id
   b. If already confirmed → skip (idempotency)
   c. Update purchase status = 'confirmed'
   d. Insert credit_transaction: { type: 'credit_purchase', amount: +N }
7. User is redirected back to app with credits available
```

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| All AI calls server-side | Security: never expose Nano Banana API keys to client |
| Append-only credit ledger | Auditability, fraud prevention, no race conditions on mutable balance |
| Credit reserved on start, finalized on success | Users never lose credits on provider failures |
| Stripe webhook as only fulfillment source | Prevents client-side manipulation of credit grants |
| Inpainting modeled as a Generation subtype | Consistent credit flow, history, and ownership logic |
| Supabase RLS on all user data | Defense in depth; users can never access other users' assets |
| Private storage with signed URLs | Property photos are sensitive; no accidental public access |
| Guest session → user migration | Reduces onboarding friction; preserves trial work on signup |
| Next.js App Router on Vercel | Collocates frontend and backend; fast iteration; server components |
