# StageAI — Product Requirements Document

> Version 1.0 | April 2026

---

## 1. Product Overview

### Name
StageAI (working title)

### One-liner
An AI staging tool that transforms empty or poorly presented room photos into listing-ready interiors, with optional inpainting for targeted refinements.

### Problem
Property listings often rely on empty, cluttered, or visually weak room photos that make it difficult for buyers to imagine how a space could look when furnished and styled. This reduces listing appeal, weakens buyer engagement, and can hurt perceived property value.

Current alternatives are slow, expensive, or require creative skill:
- Publishing raw photos as-is (weak, unprofessional)
- Manual virtual staging or physical staging (expensive, slow)
- Generic editing tools (skill-dependent, time-consuming)

### Solution
StageAI enables users to capture or upload a room photo and instantly generate a professionally staged version optimized for real estate presentation. Users can then refine specific parts of the output using inpainting — such as replacing furniture or adjusting decor — without regenerating the full image.

This gives real estate professionals a faster, simpler, and more cost-effective way to create polished listing visuals.

### Differentiators
- Purpose-built for real estate staging, not general-purpose image generation
- Mobile-first: designed for on-site capture and quick edits
- Inpainting for targeted refinements without full regeneration
- Pay-as-you-go credits — no subscription required
- Simple enough for non-technical agents and brokers

---

## 2. Target Users

### Primary User
**Real estate agents and brokers** who want to improve listing visuals quickly without relying on designers, editors, or staging vendors.

- Comfortable with lightweight digital tools
- Work in fast-moving, mobile-heavy environments
- Care most about speed, realism, and ease of use
- Do not want to learn complex editing software

### Secondary Users
- Real estate marketing teams
- Property developers and developer marketing teams
- Airbnb / short-term rental hosts or managers
- Property photographers or listing media agencies

### Explicitly NOT Building For
- Interior designers
- Renovation-focused homeowners
- Furniture shoppers
- Professional creative editors requiring Photoshop-grade tooling

### Usage Context
Typical usage moments:
- During property visits and showings (mobile, on-site)
- Immediately after taking room photos
- While preparing listings and marketing assets (desktop or mobile)
- Before sharing visuals on WhatsApp, property portals, or social media
- When improving underperforming listings

Primary device: mobile (iPhone/Android). Secondary: desktop (review, download, asset prep).

---

## 3. Core Features

### P0 — Must-Have for Launch

| # | Feature | Description |
|---|---------|-------------|
| 1 | Image upload / capture | Upload from gallery or capture via device camera on mobile and desktop |
| 2 | AI staging generation | Generate a staged version of a room photo using predefined style presets |
| 3 | Room type selection | User selects room type (living room, bedroom, dining room, etc.) for contextually appropriate staging |
| 4 | Style preset selection | User chooses from presets: Modern Luxury, Minimal Clean, Family-Friendly, Airbnb Style |
| 5 | Result preview | View the generated staged image within the product before acting |
| 6 | Inpainting / targeted edit | Mask a specific area and regenerate only that region with a refinement instruction |
| 7 | Inpainting prompt input | Enter a lightweight instruction for the masked area (e.g., "replace this couch with a beige modern sofa") |
| 8 | Full regeneration | Regenerate the entire staged output if unsatisfied with the current result |
| 9 | Download finished asset | Download the final staged image; does not consume additional credits |
| 10 | Credit-based usage system | 3 free credits on signup; each AI generation action costs 1 credit |
| 11 | Credit visibility | Credit balance always visible throughout the generation and editing flow |

### P1 — Important, Not Launch-Blocking

| # | Feature | Description |
|---|---------|-------------|
| 1 | Before / after comparison | Toggle or slider to compare original and staged result |
| 2 | Multiple output variations | Generate 2–4 staging options per request |
| 3 | Generation history / gallery | View and revisit past staged images |
| 4 | Share to WhatsApp / copy link | Quick sharing of generated results to clients or colleagues |
| 5 | Auto room type detection | Infer room type automatically using AI |
| 6 | Suggested inpainting actions | Quick actions like "swap sofa," "change decor," "add wall art" |
| 7 | Account system | Create an account to save projects, track credits, and resume across devices |
| 8 | Credit purchase UI | Simple flow to buy additional credit packs after free credits are exhausted |

### P2 — Post-Launch

- Bulk upload for multiple listing rooms
- Consistent style across all rooms in a property
- Team / brokerage workspace
- Listing asset export package
- Virtual decluttering (remove clutter before staging)
- Listing copy / caption generation
- Branding / white-label support
- Advanced editing (multiple masks, sequential edits, brush precision)
- High-resolution export quality tiers

### Non-Features (Deliberately Excluded)

The MVP does not include:
- Full interior redesign or architectural changes (wall moves, layout changes)
- Structural edits (windows, ceiling height, room structure)
- Exterior staging or landscaping
- Professional-grade image editing suite
- Furniture shopping / e-commerce integration
- Collaborative review workflows
- Full desktop asset management (folders, project dashboards)
- Video generation or walkthrough rendering
- Open-ended creative prompting for arbitrary scenes
- Listing portal integrations (Bayut, Property Finder, Zillow)
- Subscription-based pricing plans

---

## 4. User Flows

### Primary Flow (Core Loop)

1. User opens app → sees upload/capture CTA + credit balance (3 free credits for new users)
2. User uploads a room photo or captures via camera
3. User selects room type (living room, bedroom, dining room, etc.)
4. User selects a staging style preset
5. System consumes 1 credit and generates a staged image
6. User reviews the generated output
7. **Decision point:**
   - Satisfied → download the image (no credit cost)
   - Wants full redo → regenerate (costs 1 credit)
   - Wants targeted fix → enter inpainting flow
8. **Inpainting flow (if chosen):**
   - User enters edit mode
   - User masks the area to change using brush tool
   - User enters a refinement instruction
   - System consumes 1 credit and regenerates the masked area only
   - User reviews updated result
   - Repeat or proceed to download
9. User downloads final image
10. If credits run out → purchase flow is presented; session preserved

### Onboarding Flow (First-Time User)

1. User lands on home screen
2. Sees clear product headline and what it does
3. Sees "3 free credits" communicated visibly
4. Prompted with primary CTA: Upload / Take Photo
5. Progresses through core flow without any upfront paywall
6. After first generation, may continue using remaining credits
7. Once credits exhausted, prompted to sign up (if still in guest mode) and purchase

### Credit Purchase Flow

1. User attempts generation with 0 credits
2. Generation does not start
3. User sees message: "You're out of credits" + purchase CTA
4. User selects a credit pack
5. Stripe payment flow
6. On webhook confirmation: credits are added to account
7. User is returned to their session and can resume

### Return User Flow

1. User opens app → signed in, sees credit balance
2. Directly accesses upload/capture CTA
3. Optionally accesses history to revisit prior generations
4. Continues normal generation loop

---

## 5. Data Model

### Core Entities

**User**
- Identity and auth info (linked to Supabase Auth)
- Credit balance (derived from credit ledger)
- Profile metadata

**Project / Session**
- Belongs to one User (or guest session)
- Groups one uploaded image, all generations, and all masks
- Lightweight in MVP; not necessarily exposed in UI

**Uploaded Image**
- Belongs to one User, one Project
- Source file path / storage URL
- Room type selection
- File metadata (size, type, timestamps)

**Generation**
- Belongs to one User, one Project
- Type: `initial_staging` | `full_regeneration` | `inpainting`
- References one source (either uploaded image or prior generated output)
- For inpainting: also references an Inpainting Mask
- Consumes 1 credit on successful completion
- Produces one Generated Output Image

**Generated Output Image**
- Belongs to one Generation, one User, one Project
- Output file path / storage URL
- Style preset used, room type used
- Prompt / instruction metadata
- Timestamps

**Inpainting Mask**
- Belongs to one inpainting Generation
- Mask image / brush coordinate data
- Refinement instruction string
- Short-term retention only (7–30 days)

**Credit Transaction (Ledger)**
- Append-only; never mutate
- Fields: user_id, type, amount, reason, timestamp
- Types: `signup_bonus` (+3), `generation_success` (−1), `generation_refund` (+1), `credit_purchase` (+N)
- User's visible credit balance = sum of all transactions

**Credit Pack Purchase**
- Belongs to one User
- Pack selected, price paid, credits granted
- Payment status: `pending` | `confirmed` | `failed`
- Stripe payment intent / session reference

### Relationships

```
User
  ├── many Projects / Sessions
  │     ├── one Uploaded Image
  │     └── many Generations
  │           ├── one Generated Output Image
  │           └── (if inpainting) one Inpainting Mask
  ├── many Credit Transactions (ledger)
  └── many Credit Pack Purchases
```

### File / Media Storage

All assets stored in Supabase Storage, private by default.

| Asset Type | Retention | Notes |
|-----------|-----------|-------|
| Original uploads | 30–90 days | Source for staging and inpainting |
| Generated outputs | 30–90 days | User downloads directly |
| Inpainting masks | 7–30 days | Only needed for job execution |

Access via signed URLs or authenticated retrieval. No public file access.

---

## 6. Authentication & Authorization

### Sign-In Methods
- Google OAuth (via Supabase Auth)
- Email magic link (via Supabase Auth)
- No traditional password auth in MVP

### Guest / Anonymous Mode
- New users can use the product without signing up
- Guest session is created on first visit (non-guessable session ID)
- 3 free credits available to guest
- Guest sessions isolated and protected from cross-user access
- Sign-up required to: purchase credits, access history across devices, persist session

### Auth Gates
| Action | Requires Auth? |
|--------|---------------|
| Upload image | No (guest allowed) |
| Generate / inpaint | No (guest allowed, uses guest credits) |
| Download result | No |
| Purchase credits | Yes (must be signed in) |
| View history | Yes |
| Cross-device access | Yes |

### Authorization Rules
- All user-owned data protected by Supabase Row-Level Security (RLS)
- Users can only read/write their own: uploads, generations, masks, projects, transactions, purchases
- Guest session data accessible only via the originating session token

---

## 7. Monetization & Business Logic

### Pricing Model
Pay-as-you-go credit packs. No subscriptions at launch.

**1 AI generation action = 1 credit**

This includes:
- Initial staging generation
- Full regeneration
- Inpainting refinement

**Credit Packs**

| Pack | Credits | Price | Notes |
|------|---------|-------|-------|
| Starter | 20 | $19 | |
| Standard | 60 | $39 | Recommended / featured |
| Pro | 150 | $79 | |

**Free Trial**
- New users receive 3 free credits on first use
- No expiry on any credits
- Downloading generated images does not consume credits

### Credit Lifecycle
1. User initiates generation → credit is reserved (pending)
2. Job completes successfully → credit deduction finalized
3. Job fails → credit automatically restored
4. Payment confirmed via Stripe webhook → credits added to account

### Payment Edge Cases

| Scenario | Behavior |
|----------|----------|
| Zero credits, attempts generation | Generation does not start; purchase flow presented; session preserved |
| Generation fails (provider error, timeout) | Credit auto-restored; user notified |
| Payment fails | No credits added; user shown clear error; can retry |
| Duplicate / ambiguous payment | Held in pending state; credits only granted after webhook confirms |
| App closed during generation | Job continues server-side; result shown on return; credit restored if failed |
| User buys credits, doesn't use them | Credits remain indefinitely; no expiry |

### Credit Integrity Rules
- Credit logic is enforced server-side only; client is never trusted
- All credit changes are recorded in the append-only Credit Transaction ledger
- The ledger supports troubleshooting, fraud prevention, and reconciliation

---

## 8. Technical Constraints

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Canvas / masking | HTML5 Canvas |
| Backend | Next.js server actions + API routes |
| Database | Supabase Postgres |
| Storage | Supabase Storage |
| Auth | Supabase Auth (Google OAuth + magic link) |
| Payments | Stripe (webhooks for fulfillment) |
| AI provider | Nano Banana (image-to-image staging + inpainting) |
| Hosting | Vercel (frontend + backend), Supabase (DB + storage + auth) |

### Security Requirements (Hard Rules)
1. All AI and payment API keys must remain server-side — never in client code
2. No client-side secrets of any kind (Nano Banana, Stripe secret key, Supabase service role key)
3. Row-Level Security (RLS) must be enabled on all user-owned tables
4. Supabase Storage access must be private by default (signed URLs or authenticated access)
5. Credit deduction logic must be enforced server-side only
6. Credits are only granted after verified Stripe webhook confirmation
7. Generation ownership enforced: users can only access their own images and generations
8. Guest sessions must be non-guessable and isolated from other sessions
9. File uploads must be validated: allowed formats, file size limits, dimension limits
10. Credit and purchase events must be auditable via the transaction ledger

### Performance Expectations
- Generation latency is a core UX concern; perceived speed affects repeat usage significantly
- Loading states must be clear and smooth, especially on mobile
- Image uploads should be client-side validated before sending to reduce unnecessary round trips

### Platform Requirements
- Responsive web application — no native app at launch
- Mobile-first layout (primary: Safari iOS, Chrome Android)
- Desktop support (Chrome, Safari, Edge)
- PWA path should remain open (no architectural decisions that block it)

---

## 9. UX & Design Direction

### Feel
Clean, premium, modern, and visually confident. Fast-feeling. Mobile-native.

The product should feel like a **polished professional tool**, not a gimmicky AI playground.

### Design Principles
- Mobile-first layout
- Large imagery as the primary focus
- Minimal chrome and UI noise
- Primary actions always obvious and accessible
- Calm, premium surfaces
- Fast-feeling interactions and transitions
- Clear before/after emphasis

### Visual Style
- White / neutral base
- Restrained single accent color
- Rounded panels and cards
- Soft shadows
- Strong spacing
- Minimal text
- Large image surfaces
- Highly legible controls

### Inspiration References
- **Arc / Linear** — clean, intentional interface language
- **Midjourney web UI (lightly)** — visual-first interaction
- **Canva (lightly)** — approachable, simpler
- **Apple camera / photo editing** — direct, touch-friendly interaction
- **Airbnb / Stripe / Notion** — calm, refined product polish

### Primary CTAs (Always Visually Obvious)
1. Upload / Take Photo
2. Generate
3. Refine
4. Download
5. Buy Credits

### Product Personality
"This is a fast, high-quality visual tool for making property photos market-ready."
Not: "This is a fun AI image toy."

### Complex UI Components

**1. Inpainting Mask Tool**
- Brush-based masking (touch on mobile, mouse/trackpad on desktop)
- Adjustable brush size
- Erase mode
- Clear / reset mask
- Precision goal: object-level (mask a couch, a rug, a fixture) — not pixel-perfect
- No lasso, polygon, or rectangle selection in MVP
- No AI auto-segmentation in MVP

**2. Before / After Toggle**
- Simple button-based toggle: show original vs. staged result
- Slider version is a P1 enhancement

**3. Generation Progress UI**
- States: in progress → credit consumed → success / failure
- Must be clearly communicated, especially on mobile
- Retry path visible on failure

**4. Credit Balance UI**
- Always visible during generation flows
- Shows current balance, confirms "1 credit will be used," and triggers purchase flow when zero

**5. Mobile Image Review Surface**
- Clear image viewing, zoom support
- Easy entry into refine or download from view state
- Smooth on small screens

---

## 10. MVP Scope & Success Metrics

### Irreducible MVP (Absolute Minimum)
1. Upload or capture a room image
2. Select room type
3. Select staging style preset
4. Generate staged output
5. View result
6. Download result
7. 3 free credits + paid credit purchase flow

**Single-sentence MVP:** Take a room photo → choose a style → get a staged image → download it.

### What Gets Cut First (If Needed)
1. Inpainting (most complex component; not required to prove core value)
2. Guest session cross-device continuity
3. Generation history / project UI
4. Before / after interaction
5. Multiple result variations

### Success Metrics (Early Validation)
- % of new users who complete at least one successful generation
- % of users who exhaust all 3 free credits (signal: perceived value)
- % of free-credit users who purchase a credit pack (core monetization signal)
- Repeat usage rate (users who return for a second session)
- Qualitative: do users describe outputs as "usable" or "listing-ready"?

---

## 11. Open Questions & Risks

### Open Product Questions
1. How good does the output need to be for users to actually pay? What is the minimum realism threshold for "listing-usable"?
2. Is inpainting required for first purchase intent, or only for retention and repeat usage?
3. How many generations does a typical successful session require? (Affects pricing confidence and UX expectations.)
4. Which staging style presets do users actually want most? (Initial list is assumed.)
5. Will users primarily use the product on-site (capture-first) or during listing prep (upload-first)?

### Technical Open Questions
6. How reliable and visually consistent is Nano Banana across room types, lighting conditions, and wide-angle mobile photos?
7. How good will inpainting feel on mobile touch input? Will brush masking be intuitive or frustrating?
8. What is the acceptable generation latency range before the experience feels slow?
9. How should guest sessions merge cleanly into authenticated accounts without data loss?

### Business Open Questions
10. Will users purchase credits immediately after the 3 free credits, or will there be significant drop-off?
11. Which user segment converts best first: brokers, developers, Airbnb hosts, photographers?
12. Is the product better suited to self-serve or direct outreach / demo-driven sales?

### Core Assumptions (Requiring Validation)
| Assumption | Risk if Wrong |
|------------|--------------|
| Users will pay for AI-staged images | Core business fails without monetization validation |
| Output quality will be "good enough" for listing use | Product value proposition breaks down |
| Credit-based pricing feels intuitive and fair | High churn post-trial; pricing model needs rework |
| Mobile-first usage is real and valuable | UX prioritization may need to shift to desktop-first |
| 3 free credits are enough to communicate value and drive conversion | Trial structure needs redesign |

### Market Risks
- Users may like the product but not need it frequently enough for strong repeat usage
- Existing alternatives (manual staging services, freelancers, generic AI tools) may feel "good enough"
- Some agents may not trust AI-generated staging for professional listings

### Product Risks
- Product drifting into "generic room redesign AI" without disciplined real-estate-focused positioning
- Credit system feeling punitive if good results consistently require multiple retries
- Inpainting feeling frustrating on mobile, reducing the perceived value of the refine flow

### Technical Risks
- AI output inconsistency (realism, scale, lighting) across varied real-world room photos
- Dependency on Nano Banana: changes in cost, speed, API behavior, or quality could materially affect the product
- Generation latency negatively impacting perceived product quality
