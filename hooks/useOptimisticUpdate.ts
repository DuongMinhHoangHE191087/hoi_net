/**
 * Optimistic Locking Hooks for React
 * 
 * Provides utilities for handling version conflicts in forms
 */

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

// ==========================================
// Types
// ==========================================

export interface VersionedData {
  id: string
  version: number
  [key: string]: any
}

export interface ConflictError {
  code: 'VERSION_CONFLICT'
  expectedVersion: number
  currentVersion: number
  message: string
}

export interface UseOptimisticUpdateOptions<T> {
  onConflict?: (error: ConflictError, currentData: T | null) => void
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  showToast?: boolean
}

export interface UseOptimisticUpdateResult<T> {
  update: (id: string, updates: Partial<T>, version: number) => Promise<T | null>
  isLoading: boolean
  error: Error | null
  hasConflict: boolean
  currentVersion: number | null
  resetConflict: () => void
}

// ==========================================
// Conflict Detection
// ==========================================

/**
 * Check if response is a version conflict error
 */
export function isVersionConflict(response: any): response is { code: string; error?: string; meta?: { expectedVersion: number; currentVersion: number } } {
  return response?.code === 'VERSION_CONFLICT' || response?.error?.includes('modified by another user')
}

/**
 * Parse conflict details from response
 */
export function parseConflictDetails(response: any): ConflictError | null {
  if (!isVersionConflict(response)) return null
  
  return {
    code: 'VERSION_CONFLICT',
    expectedVersion: response.meta?.expectedVersion || 0,
    currentVersion: response.meta?.currentVersion || 0,
    message: response.error || 'Data was modified by another user'
  }
}

// ==========================================
// React Hook
// ==========================================

/**
 * Hook for handling optimistic locking updates
 * 
 * @example
 * const { update, hasConflict, isLoading } = useOptimisticUpdate<BlogPost>({
 *   onConflict: (error) => {
 *     // Show refresh dialog
 *   }
 * })
 * 
 * // In form submit:
 * const result = await update(post.id, { title: newTitle }, post.version)
 */
export function useOptimisticUpdate<T extends VersionedData>(
  apiEndpoint: string,
  options: UseOptimisticUpdateOptions<T> = {}
): UseOptimisticUpdateResult<T> {
  const { onConflict, onSuccess, onError, showToast = true } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasConflict, setHasConflict] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<number | null>(null)

  const resetConflict = useCallback(() => {
    setHasConflict(false)
    setCurrentVersion(null)
    setError(null)
  }, [])

  const update = useCallback(async (
    id: string,
    updates: Partial<T>,
    version: number
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)
    setHasConflict(false)

    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, version })
      })

      const data = await response.json()

      // Check for version conflict (409)
      if (response.status === 409) {
        const conflictError = parseConflictDetails(data)
        
        if (conflictError) {
          setHasConflict(true)
          setCurrentVersion(conflictError.currentVersion)
          
          if (showToast) {
            toast.error('Dữ liệu đã được sửa bởi người khác. Vui lòng tải lại trang.', {
              duration: 5000,
              icon: '⚠️'
            })
          }
          
          onConflict?.(conflictError, null)
          return null
        }
      }

      // Check for other errors
      if (!response.ok) {
        throw new Error(data.error || 'Update failed')
      }

      // Success
      const updatedData = data.data || data.post || data
      
      if (showToast) {
        toast.success('Cập nhật thành công!')
      }
      
      onSuccess?.(updatedData)
      return updatedData
      
    } catch (err: any) {
      const error = new Error(err.message || 'Update failed')
      setError(error)
      
      if (showToast) {
        toast.error(error.message)
      }
      
      onError?.(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [apiEndpoint, onConflict, onSuccess, onError, showToast])

  return {
    update,
    isLoading,
    error,
    hasConflict,
    currentVersion,
    resetConflict
  }
}

// ==========================================
// Conflict Resolution Dialog Hook
// ==========================================

export interface ConflictDialogState<T> {
  isOpen: boolean
  localData: T | null
  serverData: T | null
  conflictField: string | null
}

export function useConflictDialog<T extends VersionedData>() {
  const [state, setState] = useState<ConflictDialogState<T>>({
    isOpen: false,
    localData: null,
    serverData: null,
    conflictField: null
  })

  const openDialog = useCallback((localData: T, serverData: T, conflictField?: string) => {
    setState({
      isOpen: true,
      localData,
      serverData,
      conflictField: conflictField || null
    })
  }, [])

  const closeDialog = useCallback(() => {
    setState({
      isOpen: false,
      localData: null,
      serverData: null,
      conflictField: null
    })
  }, [])

  const acceptLocal = useCallback((): T | null => {
    const data = state.localData
    closeDialog()
    return data
  }, [state.localData, closeDialog])

  const acceptServer = useCallback((): T | null => {
    const data = state.serverData
    closeDialog()
    return data
  }, [state.serverData, closeDialog])

  return {
    ...state,
    openDialog,
    closeDialog,
    acceptLocal,
    acceptServer
  }
}

// ==========================================
// Utility: Refresh data with current version
// ==========================================

export async function fetchWithVersion<T extends VersionedData>(
  apiEndpoint: string,
  id: string
): Promise<T | null> {
  try {
    const response = await fetch(`${apiEndpoint}/${id}`)
    if (!response.ok) return null
    
    const data = await response.json()
    return data.data || data.post || data
  } catch {
    return null
  }
}

