'use client'

import { useState, useCallback, useTransition } from 'react'

interface UseAsyncActionOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  minLoadingTime?: number // Minimum loading time in ms for better UX
}

interface UseAsyncActionReturn<T extends (...args: any[]) => Promise<any>> {
  execute: (...args: Parameters<T>) => Promise<ReturnType<T> | undefined>
  isLoading: boolean
  error: Error | null
  reset: () => void
}

/**
 * Hook for handling async actions with instant loading feedback
 * Provides immediate visual feedback before async operation starts
 */
export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: UseAsyncActionOptions = {}
): UseAsyncActionReturn<T> {
  const { onSuccess, onError, minLoadingTime = 200 } = options
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      // Immediate loading state - provides instant feedback
      setIsLoading(true)
      setError(null)

      const startTime = Date.now()

      try {
        const result = await asyncFn(...args)

        // Ensure minimum loading time for better UX
        const elapsed = Date.now() - startTime
        if (elapsed < minLoadingTime) {
          await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsed))
        }

        onSuccess?.()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred')
        setError(error)
        onError?.(error)
        return undefined
      } finally {
        setIsLoading(false)
      }
    },
    [asyncFn, onSuccess, onError, minLoadingTime]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  return { execute, isLoading, error, reset }
}

/**
 * Hook for button click with instant loading feedback
 * Simpler version for button clicks
 */
export function useButtonLoading() {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const startLoading = useCallback((id: string) => {
    setLoadingId(id)
  }, [])

  const stopLoading = useCallback(() => {
    setLoadingId(null)
  }, [])

  const isLoading = useCallback(
    (id: string) => loadingId === id,
    [loadingId]
  )

  const withLoading = useCallback(
    async <T,>(id: string, action: () => Promise<T>): Promise<T | undefined> => {
      startLoading(id)
      try {
        const result = await action()
        return result
      } catch (error) {
        console.error('Action failed:', error)
        return undefined
      } finally {
        // Small delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 100))
        stopLoading()
      }
    },
    [startLoading, stopLoading]
  )

  return { loadingId, isLoading, startLoading, stopLoading, withLoading }
}

/**
 * Hook using React's useTransition for non-blocking updates
 */
export function useOptimisticAction() {
  const [isPending, startTransition] = useTransition()
  const [isExecuting, setIsExecuting] = useState(false)

  const execute = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
      setIsExecuting(true)

      return new Promise((resolve) => {
        startTransition(async () => {
          try {
            const result = await action()
            resolve(result)
          } catch (error) {
            console.error('Action failed:', error)
            resolve(undefined)
          } finally {
            setIsExecuting(false)
          }
        })
      })
    },
    [startTransition]
  )

  return { isLoading: isPending || isExecuting, execute }
}

export default useAsyncAction

