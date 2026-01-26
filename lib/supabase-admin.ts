/**
 * Supabase Admin Client - Server-side only
 * Uses service role key for admin operations like creating users, resetting passwords
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Validate environment variables - log once at startup
const isConfigured = !!(supabaseUrl && supabaseServiceRoleKey)
if (!isConfigured) {
  console.error('❌ [supabaseAdmin] CRITICAL: Supabase admin environment variables not configured!')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ configured' : '✗ MISSING')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✓ configured' : '✗ MISSING')
  console.error('   Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.')
} else {
  console.log('✅ [supabaseAdmin] Configured with service role key')
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

