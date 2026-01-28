'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  // Base styles with CSS-only animations (no framer-motion)
  const baseStyles = "rounded-lg font-medium transition-all duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center select-none touch-manipulation active:scale-[0.97]"

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 active:bg-primary/70",
    secondary: "border border-gray-300 hover:bg-gray-50 text-gray-700 active:bg-gray-200",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
  }

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

