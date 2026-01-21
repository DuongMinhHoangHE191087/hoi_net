'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  // NO ANIMATIONS - INSTANT DISPLAY
  // This removes all lag from page transitions
  return (
    <div key={pathname}>
      {children}
    </div>
  )
}
