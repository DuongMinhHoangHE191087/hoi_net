/**
 * 🔐 Auth Provider - React Integration
 * 
 * Minimal React component that initializes auth on mount.
 * All state is managed by Zustand, not React Context.
 * 
 * Benefits:
 * - No Context re-render issues
 * - Children only render once auth is ready
 * - Clean separation of concerns
 */

'use client'

import { useEffect, useRef } from 'react'
import { AuthService } from './service'
import { useAuthStore } from './store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialized = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return
    initialized.current = true

    // Initialize auth service
    AuthService.initialize()
  }, [])

  return <>{children}</>
}

