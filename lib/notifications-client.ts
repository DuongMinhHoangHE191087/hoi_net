// ============================================
// Notification Types & Client Helpers
// (Client-safe - no server dependencies)
// ============================================

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'request_update'
  | 'request_delivered'
  | 'system'
  | 'payment'
  | 'admin_message'

export type EmailFrequency = 'instant' | 'daily' | 'weekly' | 'never'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  action_url?: string | null
  action_label?: string | null
  metadata: Record<string, any>
  expires_at?: string | null
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  request_updates: boolean
  request_delivered: boolean
  system_announcements: boolean
  marketing_emails: boolean
  email_frequency: EmailFrequency
  created_at: string
  updated_at: string
}

export interface CreateNotificationData {
  user_id: string
  type: NotificationType
  title: string
  message: string
  action_url?: string
  action_label?: string
  metadata?: Record<string, any>
  expires_at?: Date | string
}

// ============================================
// Client-Safe Helper Functions
// ============================================

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    info: '📢',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    request_update: '🔄',
    request_delivered: '🎉',
    system: '⚙️',
    payment: '💳',
    admin_message: '👤'
  }
  return icons[type] || '📬'
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    request_update: 'purple',
    request_delivered: 'pink',
    system: 'gray',
    payment: 'green',
    admin_message: 'indigo'
  }
  return colors[type] || 'gray'
}
