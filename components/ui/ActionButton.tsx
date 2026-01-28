'use client'

import React, { useState, useCallback } from 'react'
import { Loader2, Check } from 'lucide-react'

interface ActionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass' | 'glass-primary'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  onClick?: () => Promise<void> | void
  loadingText?: string
  successText?: string
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

/**
 * ActionButton - Button with instant loading feedback
 * Automatically shows loading state when onClick is async
 */
export default function ActionButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  loadingText,
  successText,
  fullWidth = false,
  disabled,
  icon,
  iconPosition = 'left',
  ...props
}: ActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClick = useCallback(async () => {
    if (!onClick || isLoading) return

    // Immediate loading feedback
    setIsLoading(true)

    try {
      await onClick()
      
      // Show success state briefly if successText provided
      if (successText) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1500)
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      // Small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 150))
      setIsLoading(false)
    }
  }, [onClick, isLoading, successText])

  const baseStyles = `
    rounded-xl font-semibold transition-all duration-150 
    cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed 
    flex items-center justify-center gap-2 select-none touch-manipulation
    active:scale-[0.97]
  `

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  const variants = {
    primary: `
      bg-gradient-to-r from-primary to-primary/90 text-white 
      hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5
      active:shadow-md
    `,
    secondary: `
      border-2 border-gray-200 hover:border-gray-300 
      text-gray-700 hover:bg-gray-50 
      active:bg-gray-100
    `,
    ghost: `
      text-gray-600 hover:text-gray-900 hover:bg-gray-100 
      active:bg-gray-200
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 text-white 
      hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5
      active:shadow-md
    `,
    glass: `
      bg-white/70 backdrop-blur-sm border border-white/50 
      text-gray-700 hover:bg-white/90 
      shadow-lg shadow-black/5
    `,
    'glass-primary': `
      bg-gradient-to-r from-primary/90 to-secondary/90 
      backdrop-blur-sm text-white 
      hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1
      active:shadow-lg
    `,
  }

  const LoadingSpinner = () => (
    <Loader2 className="w-5 h-5 animate-spin" />
  )

  // CSS-only success check animation
  const SuccessCheck = () => (
    <Check className="w-5 h-5 animate-scale-in" />
  )

  const renderContent = () => {
    if (showSuccess && successText) {
      return (
        <>
          <SuccessCheck />
          {successText}
        </>
      )
    }

    if (isLoading) {
      return (
        <>
          <LoadingSpinner />
          {loadingText || 'Đang xử lý...'}
        </>
      )
    }

    return (
      <>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </>
    )
  }

  return (
    <button
      className={`
        ${baseStyles} 
        ${sizes[size]} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {renderContent()}
    </button>
  )
}

/**
 * LinkButton - For navigation with loading state
 */
interface LinkButtonProps {
  href: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'glass-primary'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  onClick?: () => void
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
}: LinkButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    // Show loading immediately
    setIsNavigating(true)
    onClick?.()
    
    // Let the browser handle navigation, loading will be cleared on page change
  }

  const baseStyles = `
    rounded-xl font-semibold transition-all duration-150 
    cursor-pointer flex items-center justify-center gap-2 
    select-none touch-manipulation active:scale-[0.97]
    no-underline
  `

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  const variants = {
    primary: `
      bg-gradient-to-r from-primary to-primary/90 text-white 
      hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5
    `,
    secondary: `
      border-2 border-gray-200 hover:border-gray-300 
      text-gray-700 hover:bg-gray-50
    `,
    ghost: `
      text-gray-600 hover:text-gray-900 hover:bg-gray-100
    `,
    glass: `
      bg-white/70 backdrop-blur-sm border border-white/50 
      text-gray-700 hover:bg-white/90 shadow-lg shadow-black/5
    `,
    'glass-primary': `
      bg-gradient-to-r from-primary/90 to-secondary/90 
      backdrop-blur-sm text-white 
      hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1
    `,
  }

  return (
    <a
      href={href}
      className={`
        ${baseStyles} 
        ${sizes[size]} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${isNavigating ? 'opacity-70' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {isNavigating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang chuyển...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </a>
  )
}

