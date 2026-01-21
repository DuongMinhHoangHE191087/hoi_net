/**
 * Supabase Client Exports
 *
 * Usage:
 * - Browser/Client Components: import { createClient } from '@/lib/supabase/client'
 * - Server Components/Actions: import { createClient } from '@/lib/supabase/server'
 * - Middleware: import { updateSession } from '@/lib/supabase/middleware'
 */

// Re-export for backward compatibility
export { createClient as createBrowserClient, supabase } from './client'
export { createClient as createServerClient } from './server'
export { updateSession } from './middleware'

// Types
export type { User, Session, AuthError } from '@supabase/supabase-js'
