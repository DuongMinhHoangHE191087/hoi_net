/**
 * Supabase Admin Client - Server-side only
 * Uses service role key for admin operations like creating users, resetting passwords
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Validate environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('⚠️ Supabase admin environment variables not configured. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.')
}

// Singleton pattern for admin client
let supabaseAdminInstance: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminInstance
}

export const supabaseAdmin = getSupabaseAdmin()
