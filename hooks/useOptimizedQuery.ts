/**
 * Enhanced Fetch Utility với Instant Loading States
 * Tránh delay, hiển thị loading ngay lập tức
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  queryCache,
  requestDeduplicator,
  optimisticUpdates,
  fetchWithCache,
  invalidateCachePattern,
} from '../lib/query-optimizer'

// ============================================
// INSTANT LOADING HOOK
// ============================================

export interface UseQueryOptions<T> {
  cacheKey: string
  fetcher: () => Promise<T>
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number | false
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  initialData?: T
}

export function useQuery<T>({
  cacheKey,
  fetcher,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  refetchInterval = false,
  onSuccess,
  onError,
  initialData,
}: UseQueryOptions<T>) {
  // ✅ INSTANT LOADING STATE - Set ngay lập tức
  const [data, setData] = useState<T | undefined>(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)

  const refetchIntervalRef = useRef<NodeJS.Timeout>()
  const isMountedRef = useRef(true)

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) return

      // ✅ INSTANT LOADING - Show loading ngay
      setLoading(true)
      setError(null)

      try {
        const result = await fetchWithCache(cacheKey, fetcher, {
          ttl: staleTime,
          forceRefresh,
        })

        if (!isMountedRef.current) return

        setData(result)
        setLoading(false)
        onSuccess?.(result)
      } catch (err) {
        if (!isMountedRef.current) return

        const error = err as Error
        setError(error)
        setLoading(false)
        onError?.(error)
      }
    },
    [cacheKey, fetcher, enabled, staleTime, onSuccess, onError]
  )

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true

    // Check cache first - INSTANT data nếu có
    const cached = queryCache.get(cacheKey)
    if (cached !== null) {
      setData(cached)
      setLoading(false)
      // Still fetch in background để update
      fetchData()
    } else {
      fetchData()
    }

    return () => {
      isMountedRef.current = false
    }
  }, [cacheKey, fetchData])

  // Refetch interval
  useEffect(() => {
    if (refetchInterval === false || !refetchInterval) return

    refetchIntervalRef.current = setInterval(() => {
      fetchData(true)
    }, refetchInterval)

    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current)
      }
    }
  }, [refetchInterval, fetchData])

  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const invalidate = useCallback(() => {
    queryCache.invalidate(cacheKey)
    return fetchData(true)
  }, [cacheKey, fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  }
}

// ============================================
// INSTANT MUTATION HOOK - Optimistic Updates
// ============================================

export interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onMutate?: (variables: TVariables) => any // Return snapshot for rollback
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables, snapshot?: any) => void
  invalidateQueries?: string[] // Cache keys to invalidate
}

export function useMutation<TData, TVariables>({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
  invalidateQueries = [],
}: UseMutationOptions<TData, TVariables>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (variables: TVariables) => {
      // ✅ INSTANT UI UPDATE - Call onMutate ngay
      let snapshot: any
      if (onMutate) {
        snapshot = onMutate(variables)
      }

      setLoading(true)
      setError(null)

      try {
        const data = await mutationFn(variables)

        setLoading(false)
        onSuccess?.(data, variables)

        // Invalidate cache
        for (const key of invalidateQueries) {
          invalidateCachePattern(key)
        }

        return data
      } catch (err) {
        const error = err as Error
        setLoading(false)
        setError(error)
        onError?.(error, variables, snapshot)
        throw error
      }
    },
    [mutationFn, onMutate, onSuccess, onError, invalidateQueries]
  )

  return {
    mutate,
    loading,
    error,
  }
}

// ============================================
// PREFETCH HOOK - Load data trước khi cần
// ============================================

export function usePrefetch() {
  const prefetch = useCallback(
    async <T,>(cacheKey: string, fetcher: () => Promise<T>, staleTime?: number) => {
      const cached = queryCache.get(cacheKey)
      if (cached !== null) return // Already cached

      try {
        const data = await requestDeduplicator.deduplicate(cacheKey, fetcher)
        queryCache.set(cacheKey, data, staleTime)
      } catch (error) {
        console.warn(`[usePrefetch] Failed to prefetch ${cacheKey}:`, error)
      }
    },
    []
  )

  return { prefetch }
}

// ============================================
// INSTANT PAGINATION HOOK
// ============================================

export interface UsePaginationOptions<T> {
  cacheKeyPrefix: string
  fetcher: (page: number, limit: number) => Promise<{ data: T[]; total: number }>
  pageSize?: number
  enabled?: boolean
}

export function usePagination<T>({
  cacheKeyPrefix,
  fetcher,
  pageSize = 20,
  enabled = true,
}: UsePaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const cacheKey = `${cacheKeyPrefix}:page:${currentPage}:limit:${pageSize}`

  const { data, loading, error, refetch } = useQuery({
    cacheKey,
    fetcher: () => fetcher(currentPage, pageSize),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 phút
    onSuccess: (result) => {
      setTotalCount(result.total)
      setTotalPages(Math.ceil(result.total / pageSize))
    },
  })

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  // ✅ PREFETCH next page - Load trước khi user click
  const { prefetch } = usePrefetch()

  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPageKey = `${cacheKeyPrefix}:page:${currentPage + 1}:limit:${pageSize}`
      prefetch(nextPageKey, () => fetcher(currentPage + 1, pageSize))
    }
  }, [currentPage, totalPages, cacheKeyPrefix, pageSize, fetcher, prefetch])

  return {
    data: data?.data || [],
    currentPage,
    totalPages,
    totalCount,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    refetch,
  }
}

// ============================================
// EXPORT ALL
// ============================================

export { queryCache, invalidateCachePattern, fetchWithCache }
