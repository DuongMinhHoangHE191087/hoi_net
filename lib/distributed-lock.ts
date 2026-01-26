/**
 * Distributed Locking Utilities
 * Prevents concurrent modifications to critical resources
 * 
 * Use cases:
 * - Batch operations that must be atomic
 * - Resource provisioning
 * - Scheduled tasks that should only run once
 */

import { supabaseAdmin } from './supabase-admin'

// ==========================================
// Types
// ==========================================

export interface LockResult {
  acquired: boolean
  lockId: string | null
  error?: string
}

export interface LockOptions {
  ttlSeconds?: number      // Lock expiration time (default: 30s)
  waitTimeMs?: number      // Time to wait for lock (default: 0 - no wait)
  retryIntervalMs?: number // Retry interval if waiting (default: 100ms)
}

// ==========================================
// Distributed Lock Implementation
// ==========================================

/**
 * Acquire a distributed lock
 * Returns immediately if lock is not available (unless waitTimeMs is set)
 */
export async function acquireDistributedLock(
  lockName: string,
  options: LockOptions = {}
): Promise<LockResult> {
  const {
    ttlSeconds = 30,
    waitTimeMs = 0,
    retryIntervalMs = 100
  } = options

  const lockId = `${lockName}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()
  
  const startTime = Date.now()
  
  while (true) {
    try {
      // Try to insert new lock
      const { data, error } = await supabaseAdmin
        .from('distributed_locks')
        .insert({
          lock_name: lockName,
          lock_id: lockId,
          expires_at: expiresAt,
          acquired_by: 'system'
        })
        .select()
        .single()

      if (!error && data) {
        return { acquired: true, lockId }
      }

      // If unique violation, try to take over expired lock
      if (error?.code === '23505') {
        const { data: updated } = await supabaseAdmin
          .from('distributed_locks')
          .update({
            lock_id: lockId,
            expires_at: expiresAt,
            acquired_by: 'system',
            created_at: new Date().toISOString()
          })
          .eq('lock_name', lockName)
          .lt('expires_at', new Date().toISOString())  // Only if expired
          .select()
          .single()

        if (updated) {
          return { acquired: true, lockId }
        }
      }
    } catch (error: any) {
      // Log but continue if waiting
      console.warn(`[DistributedLock] Error acquiring ${lockName}:`, error.message)
    }

    // Check if we should wait and retry
    const elapsed = Date.now() - startTime
    if (waitTimeMs > 0 && elapsed < waitTimeMs) {
      await new Promise(resolve => setTimeout(resolve, retryIntervalMs))
      continue
    }

    // Lock not acquired and no more waiting
    return { acquired: false, lockId: null, error: 'Lock not available' }
  }
}

/**
 * Release a distributed lock
 */
export async function releaseDistributedLock(
  lockName: string,
  lockId: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('distributed_locks')
      .delete()
      .eq('lock_name', lockName)
      .eq('lock_id', lockId)

    return !error
  } catch (error) {
    console.error('[DistributedLock] Error releasing lock:', error)
    return false
  }
}

/**
 * Extend a lock's expiration time
 */
export async function extendLock(
  lockName: string,
  lockId: string,
  additionalSeconds: number = 30
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('distributed_locks')
      .update({
        expires_at: new Date(Date.now() + additionalSeconds * 1000).toISOString()
      })
      .eq('lock_name', lockName)
      .eq('lock_id', lockId)
      .select()
      .single()

    return !!data && !error
  } catch (error) {
    console.error('[DistributedLock] Error extending lock:', error)
    return false
  }
}

/**
 * Check if a lock is held
 */
export async function isLockHeld(lockName: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('distributed_locks')
      .select('lock_name')
      .eq('lock_name', lockName)
      .gt('expires_at', new Date().toISOString())
      .single()

    return !!data
  } catch {
    return false
  }
}

/**
 * Execute a function with a distributed lock
 * Automatically acquires and releases the lock
 */
export async function withDistributedLock<T>(
  lockName: string,
  fn: () => Promise<T>,
  options: LockOptions = {}
): Promise<{ result?: T; error?: string; lockAcquired: boolean }> {
  const { acquired, lockId, error: lockError } = await acquireDistributedLock(
    lockName, 
    options
  )

  if (!acquired || !lockId) {
    return { 
      error: lockError || 'Could not acquire lock', 
      lockAcquired: false 
    }
  }

  try {
    const result = await fn()
    return { result, lockAcquired: true }
  } catch (error: any) {
    return { 
      error: error.message || 'Operation failed', 
      lockAcquired: true 
    }
  } finally {
    await releaseDistributedLock(lockName, lockId)
  }
}

/**
 * Cleanup expired locks
 * Call this periodically (e.g., via cron job)
 */
export async function cleanupExpiredLocks(): Promise<number> {
  try {
    const { data } = await supabaseAdmin.rpc('cleanup_expired_locks')
    return data || 0
  } catch (error) {
    console.error('[DistributedLock] Error cleaning up locks:', error)
    return 0
  }
}

// ==========================================
// Resource-Specific Lock Helpers
// ==========================================

/**
 * Lock a specific database row for exclusive access
 */
export async function lockRow(
  table: string,
  rowId: string,
  options?: LockOptions
): Promise<LockResult> {
  return acquireDistributedLock(`row:${table}:${rowId}`, options)
}

/**
 * Lock an entire table for batch operations
 */
export async function lockTable(
  table: string,
  options?: LockOptions
): Promise<LockResult> {
  return acquireDistributedLock(`table:${table}`, {
    ttlSeconds: 60,  // Longer TTL for table operations
    ...options
  })
}

/**
 * Lock a user's resources to prevent concurrent modifications
 */
export async function lockUserResources(
  userId: string,
  resourceType: string,
  options?: LockOptions
): Promise<LockResult> {
  return acquireDistributedLock(`user:${userId}:${resourceType}`, options)
}

