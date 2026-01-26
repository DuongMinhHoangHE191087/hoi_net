'use client'

import { useState, useEffect, useCallback } from 'react'
import { geminiClient } from '@/lib/gemini-client'

/**
 * Hook for managing Gemini BYOK (Bring Your Own Key)
 * Handles localStorage key management and validation
 */
export function useGeminiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [hasKey, setHasKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load key from localStorage on mount
  useEffect(() => {
    const storedKey = geminiClient.getKey()
    if (storedKey) {
      setApiKey(storedKey)
      setHasKey(true)
    }
    setIsLoaded(true)
  }, [])

  /**
   * Save and validate API key
   */
  const saveKey = useCallback(async (key: string): Promise<{
    success: boolean
    error?: string
  }> => {
    if (!key || key.trim().length === 0) {
      return { success: false, error: 'Vui lòng nhập API key' }
    }

    const trimmedKey = key.trim()
    
    // Basic format validation
    if (!trimmedKey.startsWith('AIza')) {
      return { 
        success: false, 
        error: 'API key không đúng định dạng. Key hợp lệ bắt đầu bằng "AIza..."' 
      }
    }

    setIsValidating(true)
    setValidationError(null)

    try {
      // Validate with Gemini
      const result = await geminiClient.validateKey(trimmedKey)
      
      if (result.valid) {
        geminiClient.saveKey(trimmedKey)
        setApiKey(trimmedKey)
        setHasKey(true)
        setValidationError(null)
        return { success: true }
      } else {
        setValidationError(result.error || 'API key không hợp lệ')
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Lỗi xác thực API key'
      setValidationError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsValidating(false)
    }
  }, [])

  /**
   * Remove API key
   */
  const removeKey = useCallback(() => {
    geminiClient.removeKey()
    setApiKey(null)
    setHasKey(false)
    setValidationError(null)
  }, [])

  /**
   * Re-validate existing key
   */
  const validateKey = useCallback(async (): Promise<boolean> => {
    const key = geminiClient.getKey()
    if (!key) return false

    setIsValidating(true)
    try {
      const result = await geminiClient.validateKey(key)
      if (!result.valid) {
        setValidationError(result.error || 'API key không còn hợp lệ')
        return false
      }
      setValidationError(null)
      return true
    } catch {
      return false
    } finally {
      setIsValidating(false)
    }
  }, [])

  /**
   * Mask API key for display (show first 10 and last 4 chars)
   */
  const maskedKey = apiKey 
    ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
    : null

  return {
    apiKey,
    maskedKey,
    hasKey,
    isValidating,
    validationError,
    isLoaded,
    saveKey,
    removeKey,
    validateKey,
  }
}

export default useGeminiKey

