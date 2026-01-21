/**
 * Advanced Query Caching & Optimization System
 * Giảm tải server, tránh query trùng lặp, instant loading states
 */

// 1. Query Result Cache với TTL
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      // Expired
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  invalidate(key: string) {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear() {
    this.cache.clear()
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// 2. Request Deduplication - Tránh gửi duplicate requests
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>()

  async deduplicate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Nếu đang có request pending cho key này, return promise đó
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>
    }

    // Tạo request mới
    const promise = fetcher()
      .finally(() => {
        // Cleanup sau khi done
        this.pending.delete(key)
      })

    this.pending.set(key, promise)
    return promise
  }

  isPending(key: string): boolean {
    return this.pending.has(key)
  }

  cancelAll() {
    this.pending.clear()
  }
}

// 3. Optimistic Updates - Instant UI updates
export interface OptimisticUpdate<T> {
  key: string
  optimisticData: T
  rollback?: T
}

class OptimisticUpdateManager {
  private updates = new Map<string, any>()

  // Apply optimistic update
  apply<T>(key: string, optimisticData: T, rollback?: T) {
    this.updates.set(key, { optimisticData, rollback })
    return optimisticData
  }

  // Commit update (success)
  commit(key: string) {
    this.updates.delete(key)
  }

  // Rollback update (error)
  rollback(key: string): any | null {
    const update = this.updates.get(key)
    if (!update) return null

    this.updates.delete(key)
    return update.rollback
  }

  getOptimistic(key: string): any | null {
    const update = this.updates.get(key)
    return update?.optimisticData || null
  }
}

// 4. Prefetching - Preload data trước khi user cần
class PrefetchManager {
  private queryCache: QueryCache
  private deduplicator: RequestDeduplicator

  constructor(queryCache: QueryCache, deduplicator: RequestDeduplicator) {
    this.queryCache = queryCache
    this.deduplicator = deduplicator
  }

  async prefetch(key: string, fetcher: () => Promise<any>, ttl?: number) {
    // Check cache first
    const cached = this.queryCache.get(key)
    if (cached) return

    // Deduplicate và fetch
    try {
      const data = await this.deduplicator.deduplicate(key, fetcher)
      this.queryCache.set(key, data, ttl)
    } catch (error) {
      console.warn(`[Prefetch] Failed to prefetch ${key}:`, error)
    }
  }

  // Prefetch multiple queries
  async prefetchAll(queries: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>) {
    await Promise.allSettled(
      queries.map(({ key, fetcher, ttl }) => this.prefetch(key, fetcher, ttl))
    )
  }
}

// 5. Query Batching - Gộp nhiều queries thành 1 request
export interface BatchQuery {
  id: string
  query: () => Promise<any>
}

class QueryBatcher {
  private batch: BatchQuery[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private batchDelay = 50 // ms

  add(query: BatchQuery): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batch.push({
        ...query,
        query: async () => {
          try {
            const result = await query.query()
            resolve(result)
            return result
          } catch (error) {
            reject(error)
            throw error
          }
        },
      })

      // Clear existing timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }

      // Set new timeout để flush batch
      this.batchTimeout = setTimeout(() => {
        this.flush()
      }, this.batchDelay)
    })
  }

  private async flush() {
    if (this.batch.length === 0) return

    const queries = [...this.batch]
    this.batch = []

    // Execute all queries in parallel
    await Promise.allSettled(queries.map((q) => q.query()))
  }
}

// ============================================
// MAIN EXPORT - Combined System
// ============================================

export const queryCache = new QueryCache()
export const requestDeduplicator = new RequestDeduplicator()
export const optimisticUpdates = new OptimisticUpdateManager()
export const prefetchManager = new PrefetchManager(queryCache, requestDeduplicator)
export const queryBatcher = new QueryBatcher()

// Helper function: Fetch với caching + deduplication
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    forceRefresh?: boolean
  } = {}
): Promise<T> {
  const { ttl = 5 * 60 * 1000, forceRefresh = false } = options

  // Check cache nếu không force refresh
  if (!forceRefresh) {
    const cached = queryCache.get(key)
    if (cached !== null) {
      return cached as T
    }
  }

  // Deduplicate request
  const data = await requestDeduplicator.deduplicate(key, fetcher)

  // Cache result
  queryCache.set(key, data, ttl)

  return data as T
}

// Helper function: Invalidate cache khi mutation
export function invalidateCachePattern(pattern: string) {
  queryCache.invalidatePattern(pattern)
}

// Helper function: Clear all cache
export function clearAllCache() {
  queryCache.clear()
  requestDeduplicator.cancelAll()
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Fetch với caching
const requests = await fetchWithCache(
  'admin:requests:all',
  () => fetch('/api/admin/requests').then(r => r.json()),
  { ttl: 2 * 60 * 1000 } // 2 phút
)

// Example 2: Prefetch trước khi user navigate
prefetchManager.prefetch(
  'admin:requests:pending',
  () => fetch('/api/admin/requests?status=pending').then(r => r.json())
)

// Example 3: Optimistic update
// Khi user click approve, update UI ngay
optimisticUpdates.apply('request:123', { ...request, status: 'approved' })
try {
  await updateRequest('123', { status: 'approved' })
  optimisticUpdates.commit('request:123')
} catch (error) {
  const rollbackData = optimisticUpdates.rollback('request:123')
  setRequest(rollbackData)
}

// Example 4: Invalidate cache sau mutation
invalidateCachePattern('admin:requests')

// Example 5: Request batching
const [user1, user2, user3] = await Promise.all([
  queryBatcher.add({ id: '1', query: () => fetchUser('1') }),
  queryBatcher.add({ id: '2', query: () => fetchUser('2') }),
  queryBatcher.add({ id: '3', query: () => fetchUser('3') }),
])
*/
