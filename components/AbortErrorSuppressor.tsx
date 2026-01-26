'use client'

import { useEffect } from 'react'

/**
 * Suppresses unhandled AbortError promises that occur during navigation
 * These are expected when components unmount while async operations are in progress
 */
export function AbortErrorSuppressor() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      
      // Check if it's an AbortError or lock-related error
      const isAbortError = 
        reason?.name === 'AbortError' ||
        reason?.message?.includes('aborted') ||
        reason?.message?.includes('signal is aborted') ||
        reason?.message?.includes('lock') ||
        // Check for Supabase lock errors
        (typeof reason === 'object' && reason?.code === 'ABORT_ERR')
      
      if (isAbortError) {
        // Prevent the error from showing in console
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleError = (event: ErrorEvent) => {
      const message = event.message?.toLowerCase() || ''
      
      if (
        message.includes('aborterror') ||
        message.includes('aborted') ||
        message.includes('signal is aborted') ||
        message.includes('lock')
      ) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    // Add global handlers
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
    window.addEventListener('error', handleError, true)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      window.removeEventListener('error', handleError, true)
    }
  }, [])

  return null
}

export default AbortErrorSuppressor

