export * from './database'

export interface CreditPack {
  key: 'starter_20' | 'standard_60' | 'pro_150'
  name: string
  credits: number
  priceCents: number
  featured?: boolean
}

export const CREDIT_PACKS: CreditPack[] = [
  { key: 'starter_20', name: 'Starter', credits: 20, priceCents: 1900 },
  { key: 'standard_60', name: 'Standard', credits: 60, priceCents: 3900, featured: true },
  { key: 'pro_150', name: 'Pro', credits: 150, priceCents: 7900 },
]

export const ROOM_TYPE_LABELS: Record<string, string> = {
  living_room: 'Living Room',
  bedroom: 'Bedroom',
  dining_room: 'Dining Room',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  office: 'Office',
  outdoor: 'Outdoor',
}

export const STYLE_PRESET_LABELS: Record<string, string> = {
  modern_luxury: 'Modern Luxury',
  minimal_clean: 'Minimal Clean',
  family_friendly: 'Family-Friendly',
  airbnb_style: 'Airbnb Style',
}

export interface UploadResponse {
  image_id: string
  storage_path: string
}

export interface GenerateResponse {
  generation_id: string
  output_image_url: string
}

export interface InpaintResponse {
  generation_id: string
  output_image_url: string
}

export interface GenerationStatusResponse {
  id: string
  status: 'pending' | 'completed' | 'failed'
  output_image_url?: string
}

export interface CreditsResponse {
  balance: number
}
