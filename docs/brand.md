# StageAI — Brand Tokens

This file is the single source of truth for all design tokens used in the product.
All values must be defined here first, then referenced via CSS custom properties in
`src/app/globals.css` and consumed via Tailwind theme tokens in components.

**Rule: Never use raw hex colors, hardcoded font sizes/weights, or hardcoded
margin/padding values in components. Always use a token defined here.**

---

## Color Tokens

Tokens are defined as CSS custom properties on `:root` in `globals.css`.
Tailwind v4 maps them via `@theme inline` using `var(--token-name)`.

### Base / Neutral (current — shadcn/ui defaults)

| Token | CSS Variable | Light value | Dark value | Usage |
|-------|-------------|-------------|------------|-------|
| `background` | `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Page background |
| `foreground` | `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Body text |
| `card` | `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Card surfaces |
| `card-foreground` | `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text on cards |
| `muted` | `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Subtle backgrounds |
| `muted-foreground` | `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Subdued text, captions |
| `border` | `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Dividers, input borders |
| `input` | `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input field border |
| `ring` | `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus ring |

### Primary / Brand Action

| Token | CSS Variable | Light value | Dark value | Usage |
|-------|-------------|-------------|------------|-------|
| `primary` | `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Primary buttons, CTAs |
| `primary-foreground` | `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Text on primary buttons |

> **TODO:** Replace `--primary` with the brand accent color once finalised.
> Candidate: a warm, restrained single accent (amber, slate-blue, or similar — TBD with design).

### Secondary / Supporting

| Token | CSS Variable | Light value | Dark value | Usage |
|-------|-------------|-------------|------------|-------|
| `secondary` | `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Secondary buttons, tags |
| `secondary-foreground` | `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on secondary |
| `accent` | `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover states, highlights |
| `accent-foreground` | `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent |

### Semantic

| Token | CSS Variable | Light value | Dark value | Usage |
|-------|-------------|-------------|------------|-------|
| `destructive` | `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error states, delete actions |

### Popover / Overlay

| Token | CSS Variable | Light value | Dark value | Usage |
|-------|-------------|-------------|------------|-------|
| `popover` | `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Dropdown / tooltip surfaces |
| `popover-foreground` | `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text in popovers |

---

## Border Radius Tokens

Base radius is `--radius: 0.625rem`. All radius values scale from it.

| Tailwind class | CSS Variable | Value |
|---------------|-------------|-------|
| `rounded-sm` | `--radius-sm` | `calc(var(--radius) * 0.6)` ≈ 0.375rem |
| `rounded-md` | `--radius-md` | `calc(var(--radius) * 0.8)` ≈ 0.5rem |
| `rounded-lg` | `--radius-lg` | `var(--radius)` = 0.625rem |
| `rounded-xl` | `--radius-xl` | `calc(var(--radius) * 1.4)` ≈ 0.875rem |
| `rounded-2xl` | `--radius-2xl` | `calc(var(--radius) * 1.8)` ≈ 1.125rem |
| `rounded-3xl` | `--radius-3xl` | `calc(var(--radius) * 2.2)` ≈ 1.375rem |
| `rounded-4xl` | `--radius-4xl` | `calc(var(--radius) * 2.6)` ≈ 1.625rem |

Use `rounded-lg` as the default card radius. Use `rounded-xl` or `rounded-2xl` for modals and image surfaces.

---

## Typography Tokens

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| `font-sans` | `--font-sans` | Geist Sans (configured in layout) | Body, UI labels |
| `font-mono` | `--font-mono` | `--font-geist-mono` | Code, debug |
| `font-heading` | `--font-heading` | same as `--font-sans` | Headings |

**Font sizes and weights:** always use Tailwind's type scale (`text-sm`, `text-base`, `text-lg`, `font-medium`, `font-semibold`, etc.). Never write `font-size: 14px` or `font-weight: 600` inline.

---

## Spacing

Use Tailwind's default spacing scale (`p-4`, `gap-6`, `mx-auto`, etc.).
Never write hardcoded `margin`, `padding`, or `gap` values in px/rem inline.

---

## Shadow

> **TODO:** Define shadow tokens here when shadows are introduced (e.g., card lift, modal overlay).
> Use `shadow-sm`, `shadow-md`, etc. from Tailwind until custom shadows are needed.

---

## How to Add a New Token

1. Add the CSS custom property to `:root` (and `.dark`) in `src/app/globals.css`
2. Map it in the `@theme inline` block in `globals.css` so Tailwind generates a utility class
3. Document it in this file under the appropriate section
4. Use the Tailwind utility class (e.g., `bg-brand-accent`) in components — never `style={{ color: '#...' }}`
