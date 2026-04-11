export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'dining_room'
  | 'kitchen'
  | 'bathroom'
  | 'office'
  | 'outdoor'

export type StylePreset =
  | 'modern_luxury'
  | 'minimal_clean'
  | 'family_friendly'
  | 'airbnb_style'

export type GenerationType = 'initial_staging' | 'full_regeneration' | 'inpainting'
export type GenerationStatus = 'pending' | 'completed' | 'failed'

export type CreditTransactionType =
  | 'signup_bonus'
  | 'generation_success'
  | 'generation_refund'
  | 'credit_purchase'
  | 'reserved'

export type PurchaseStatus = 'pending' | 'confirmed' | 'failed'

export type CreditPackKey = 'starter_20' | 'standard_60' | 'pro_150'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          created_at: string
          last_seen_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          last_seen_at?: string | null
        }
        Update: {
          email?: string | null
          last_seen_at?: string | null
        }
        Relationships: []
      }
      guest_sessions: {
        Row: {
          id: string
          created_at: string
          expires_at: string
          converted_to: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          expires_at: string
          converted_to?: string | null
        }
        Update: {
          converted_to?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string | null
          guest_session_id: string | null
          room_type: RoomType
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          guest_session_id?: string | null
          room_type: RoomType
          created_at?: string
        }
        Update: {
          room_type?: RoomType
        }
        Relationships: []
      }
      uploaded_images: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          storage_path: string
          file_size: number
          mime_type: string
          width: number | null
          height: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          storage_path: string
          file_size: number
          mime_type: string
          width?: number | null
          height?: number | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      generations: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          type: GenerationType
          status: GenerationStatus
          source_image_id: string
          mask_id: string | null
          style_preset: StylePreset | null
          room_type: RoomType | null
          instruction: string | null
          provider: string
          provider_job_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          type: GenerationType
          status?: GenerationStatus
          source_image_id: string
          mask_id?: string | null
          style_preset?: StylePreset | null
          room_type?: RoomType | null
          instruction?: string | null
          provider?: string
          provider_job_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: GenerationStatus
          provider_job_id?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      generated_output_images: {
        Row: {
          id: string
          generation_id: string
          project_id: string
          user_id: string | null
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          generation_id: string
          project_id: string
          user_id?: string | null
          storage_path: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      inpainting_masks: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          source_output_id: string
          storage_path: string
          instruction: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          source_output_id: string
          storage_path: string
          instruction?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string | null
          guest_session_id: string | null
          type: CreditTransactionType
          amount: number
          reason: string | null
          generation_id: string | null
          purchase_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          guest_session_id?: string | null
          type: CreditTransactionType
          amount: number
          reason?: string | null
          generation_id?: string | null
          purchase_id?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      credit_pack_purchases: {
        Row: {
          id: string
          user_id: string
          pack_key: CreditPackKey
          credits: number
          price_cents: number
          currency: string
          status: PurchaseStatus
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pack_key: CreditPackKey
          credits: number
          price_cents: number
          currency?: string
          status?: PurchaseStatus
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          status?: PurchaseStatus
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          confirmed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
