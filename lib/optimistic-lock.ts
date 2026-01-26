/**
 * Optimistic Locking Utilities
 * Prevents data conflicts when multiple users edit the same record
 * 
 * Usage:
 * - Always include version in your GET responses
 * - Pass version in PUT/PATCH requests
 * - Handle 409 Conflict responses in frontend
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ==========================================
// Types
// ==========================================

export interface VersionedEntity {
  id: string
  version: number
  updated_at: string
}

export interface OptimisticLockResult<T> {
  data: T | null
  error: any
  conflict: boolean
  currentVersion?: number
}

export interface ConflictDetails {
  expectedVersion: number
  actualVersion: number
  rowId: string
  tableName: string
}

// ==========================================
// Optimistic Locking Functions
// ==========================================

/**
 * Update a record with optimistic locking
 * Only succeeds if the version matches
 */
export async function updateWithOptimisticLock<T extends VersionedEntity>(
  supabase: SupabaseClient,
  table: string,
  id: string,
  updates: Partial<Omit<T, 'id' | 'version' | 'updated_at'>>,
  expectedVersion: number
): Promise<OptimisticLockResult<T>> {
  try {
    // Attempt update with version check
    const { data, error } = await supabase
      .from(table)
      .update({
        ...updates,
        // Note: version is auto-incremented by trigger
        // updated_at is auto-set by trigger
      })
      .eq('id', id)
      .eq('version', expectedVersion)  // KEY: Only update if version matches
      .select()
      .maybeSingle()  // Use maybeSingle to handle 0 rows

    if (error) {
      return { data: null, error, conflict: false }
    }

    // No data means version mismatch (row exists but version changed)
    if (!data) {
      // Fetch current version to provide helpful error
      const { data: current } = await supabase
        .from(table)
        .select('version')
        .eq('id', id)
        .single()

      if (current) {
        // Version mismatch - conflict detected
        return { 
          data: null, 
          error: null, 
          conflict: true,
          currentVersion: current.version
        }
      } else {
        // Row was deleted
        return { 
          data: null, 
          error: new Error('Record not found - may have been deleted'),
          conflict: false 
        }
      }
    }

    return { data: data as T, error: null, conflict: false }
  } catch (error) {
    return { data: null, error, conflict: false }
  }
}

/**
 * Delete a record with optimistic locking
 */
export async function deleteWithOptimisticLock(
  supabase: SupabaseClient,
  table: string,
  id: string,
  expectedVersion: number
): Promise<OptimisticLockResult<null>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('version', expectedVersion)
      .select('id')
      .maybeSingle()

    if (error) {
      return { data: null, error, conflict: false }
    }

    if (!data) {
      // Check if row still exists
      const { data: current } = await supabase
        .from(table)
        .select('version')
        .eq('id', id)
        .single()

      if (current) {
        return { 
          data: null, 
          error: null, 
          conflict: true,
          currentVersion: current.version
        }
      }
    }

    return { data: null, error: null, conflict: false }
  } catch (error) {
    return { data: null, error, conflict: false }
  }
}

// ==========================================
// Conflict Logging
// ==========================================

/**
 * Log a conflict for monitoring purposes
 */
export async function logConflict(
  supabase: SupabaseClient,
  details: ConflictDetails & { userId?: string }
): Promise<void> {
  try {
    await supabase.from('conflict_log').insert({
      table_name: details.tableName,
      row_id: details.rowId,
      user_id: details.userId,
      expected_version: details.expectedVersion,
      actual_version: details.actualVersion
    })
  } catch (error) {
    // Silent fail - logging should not affect main operation
    console.error('[ConflictLog] Failed to log conflict:', error)
  }
}

// ==========================================
// API Response Helpers
// ==========================================

export function createConflictResponse(details: ConflictDetails) {
  return {
    error: 'Conflict detected',
    code: 'CONFLICT',
    message: 'This record was modified by another user. Please refresh and try again.',
    details: {
      expectedVersion: details.expectedVersion,
      currentVersion: details.actualVersion
    }
  }
}

/**
 * Check if an error is a conflict error
 */
export function isConflictError(error: any): boolean {
  return error?.code === 'CONFLICT' || error?.status === 409
}

