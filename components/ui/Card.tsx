'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  // CSS-only animations - no framer-motion for better performance
  const hoverStyles = hover 
    ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' 
    : ''
  
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in-up transition-all duration-300 ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

