'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface NavButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'glass' | 'glass-primary' | 'glass-secondary'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  loadingText?: string
  prefetch?: boolean
}

/**
 * NavButton - Navigation button with instant loading feedback
 * Shows loading spinner immediately on click for better UX
 */
export default function NavButton({
  href,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  loadingText = 'Đang chuyển...',
  prefetch = true,
}: NavButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Reset loading state when route changes
  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Immediate loading feedback
    setIsLoading(true)
    
    // Navigate after a tiny delay to show loading
    setTimeout(() => {
      router.push(href)
    }, 50)
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    glass: 'bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-white/90',
    'glass-primary': 'btn-glass-primary',
    'glass-secondary': 'btn-glass-secondary',
  }

  // For glass variants, use the existing class names
  const isGlassVariant = variant === 'glass-primary' || variant === 'glass-secondary'
  const baseClass = isGlassVariant 
    ? variants[variant]
    : `rounded-xl font-semibold transition-all duration-150 ${sizes[size]} ${variants[variant]}`

  return (
    <Link href={href} prefetch={prefetch} onClick={handleClick}>
      <button
        className={`
          ${baseClass}
          ${sizes[size]}
          flex items-center justify-center gap-2
          transition-all hover:scale-105 hover:-translate-y-1 active:scale-95
          disabled:opacity-70 disabled:cursor-wait
          ${className}
        `}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {loadingText}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </span>
        )}
      </button>
    </Link>
  )
}

/**
 * Simple inline link with loading state
 */
interface LoadingLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  showSpinner?: boolean
}

export function LoadingLink({
  href,
  children,
  className = '',
  showSpinner = true,
}: LoadingLinkProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => router.push(href), 50)
  }

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      {isLoading && showSpinner && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {children}
    </Link>
  )
}

