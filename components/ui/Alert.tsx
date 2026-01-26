import React from 'react'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
  className?: string
}

export default function Alert({ type = 'info', children, className = '' }: AlertProps) {
  const styles = {
    success: {
      bg: 'bg-success/10',
      border: 'border-success',
      text: 'text-success',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-error/10',
      border: 'border-error',
      text: 'text-error',
      icon: XCircle
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning',
      text: 'text-warning',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-primary/10',
      border: 'border-primary',
      text: 'text-primary',
      icon: Info
    }
  }

  const style = styles[type]
  const Icon = style.icon

  return (
    <div className={`${style.bg} ${style.text} border ${style.border} rounded-lg p-4 flex items-start gap-3 ${className}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  )
}

