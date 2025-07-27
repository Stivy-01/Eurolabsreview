import { createClient } from '@supabase/supabase-js'

// Handle missing environment variables during build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if environment variables are properly set
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.includes('.supabase.co') &&
         supabaseAnonKey.startsWith('eyJ')
}

// Database type definitions
export interface Review {
  id: string
  pi_name: string
  institution: string
  lab_group_name?: string
  field?: string
  position: 'PhD' | 'Postdoc' | 'Intern' | 'Visitor'
  year: number
  ratings: {
    supervision: number
    communication: number
    career_help: number
    work_life_balance: number
    lab_environment: number
  }
  review_text?: string
  is_anonymous: boolean
  reviewer_name?: string
  is_flagged: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface PIProfile {
  id: string
  name: string
  institution: string
  field?: string
  country?: string
  review_count: number
  average_rating: number
  created_at: string
  updated_at: string
}

export interface ModerationLog {
  id: string
  input_text: string
  decision: 'ACCEPTED' | 'REJECTED_SOFT' | 'REJECTED_HARD'
  reason?: string
  method: 'AUTO' | 'MANUAL' | 'LLM'
  created_at: string
}

export interface Report {
  id: string
  review_id: string
  reason: string
  description?: string
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED'
  created_at: string
} 