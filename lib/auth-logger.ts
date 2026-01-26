/**
 * Authentication Event Logger
 * Centralized logging for all auth-related events
 */

export type AuthEventType =
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'SIGNUP_ATTEMPT'
  | 'SIGNUP_SUCCESS'
  | 'SIGNUP_FAILURE'
  | 'LOGOUT'
  | 'SESSION_CREATED'
  | 'SESSION_VERIFIED'
  | 'SESSION_EXPIRED'
  | 'SESSION_REFRESH'
  | 'SESSION_REFRESH_FAILED'
  | 'OAUTH_ATTEMPT'
  | 'OAUTH_SUCCESS'
  | 'OAUTH_FAILURE'
  | 'OAUTH_CALLBACK'
  | 'MIDDLEWARE_BLOCK'
  | 'MIDDLEWARE_ALLOW'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'EMAIL_CONFIRMATION_SENT'
  | 'EMAIL_CONFIRMATION_SUCCESS'

interface AuthLogData {
  event: AuthEventType
  timestamp: string
  userId?: string
  email?: string
  method?: 'email' | 'google' | 'oauth'
  success?: boolean
  error?: string
  errorCode?: string
  path?: string
  reason?: string
  metadata?: Record<string, any>
}

class AuthLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logs: AuthLogData[] = []
  private maxLogs = 100 // Keep last 100 logs in memory

  /**
   * Core logging method
   */
  private log(data: AuthLogData) {
    const logEntry = {
      ...data,
      timestamp: new Date().toISOString(),
    }

    // Always log to console in development
    if (this.isDevelopment) {
      const emoji = this.getEventEmoji(data.event)
      const style = data.success === false ? 'color: #ef4444' : 'color: #22c55e'
      console.log(
        `%c[Auth ${emoji}] ${data.event}`,
        style,
        {
          ...logEntry,
          timestamp: new Date(logEntry.timestamp).toLocaleTimeString()
        }
      )
    }

    // Store in memory (circular buffer)
    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // TODO: In production, send to analytics service
    // if (!this.isDevelopment) {
    //   this.sendToAnalytics(logEntry)
    // }
  }

  /**
   * Get emoji for event type
   */
  private getEventEmoji(event: AuthEventType): string {
    const emojiMap: Record<AuthEventType, string> = {
      LOGIN_ATTEMPT: '🔐',
      LOGIN_SUCCESS: '✅',
      LOGIN_FAILURE: '❌',
      SIGNUP_ATTEMPT: '📝',
      SIGNUP_SUCCESS: '🎉',
      SIGNUP_FAILURE: '⚠️',
      LOGOUT: '👋',
      SESSION_CREATED: '🔑',
      SESSION_VERIFIED: '✓',
      SESSION_EXPIRED: '⏰',
      SESSION_REFRESH: '🔄',
      SESSION_REFRESH_FAILED: '⚠️',
      OAUTH_ATTEMPT: '🔐',
      OAUTH_SUCCESS: '✅',
      OAUTH_FAILURE: '❌',
      OAUTH_CALLBACK: '↩️',
      MIDDLEWARE_BLOCK: '🚫',
      MIDDLEWARE_ALLOW: '✓',
      PASSWORD_RESET_REQUEST: '🔑',
      PASSWORD_RESET_SUCCESS: '✅',
      EMAIL_CONFIRMATION_SENT: '📧',
      EMAIL_CONFIRMATION_SUCCESS: '✅',
    }
    return emojiMap[event] || '📋'
  }

  /**
   * Public logging methods
   */

  loginAttempt(email: string, metadata?: Record<string, any>) {
    this.log({
      event: 'LOGIN_ATTEMPT',
      timestamp: new Date().toISOString(),
      email,
      method: 'email',
      metadata,
    })
  }

  loginSuccess(userId: string, email: string, metadata?: Record<string, any>) {
    this.log({
      event: 'LOGIN_SUCCESS',
      timestamp: new Date().toISOString(),
      userId,
      email,
      method: 'email',
      success: true,
      metadata,
    })
  }

  loginFailure(email: string, error: string, errorCode?: string, metadata?: Record<string, any>) {
    this.log({
      event: 'LOGIN_FAILURE',
      timestamp: new Date().toISOString(),
      email,
      method: 'email',
      success: false,
      error,
      errorCode,
      metadata,
    })
  }

  signupAttempt(email: string, metadata?: Record<string, any>) {
    this.log({
      event: 'SIGNUP_ATTEMPT',
      timestamp: new Date().toISOString(),
      email,
      method: 'email',
      metadata,
    })
  }

  signupSuccess(userId: string, email: string, needsConfirmation: boolean, metadata?: Record<string, any>) {
    this.log({
      event: 'SIGNUP_SUCCESS',
      timestamp: new Date().toISOString(),
      userId,
      email,
      method: 'email',
      success: true,
      metadata: {
        ...metadata,
        needsConfirmation,
      },
    })
  }

  signupFailure(email: string, error: string, errorCode?: string, metadata?: Record<string, any>) {
    this.log({
      event: 'SIGNUP_FAILURE',
      timestamp: new Date().toISOString(),
      email,
      method: 'email',
      success: false,
      error,
      errorCode,
      metadata,
    })
  }

  logout(userId: string, email: string, metadata?: Record<string, any>) {
    this.log({
      event: 'LOGOUT',
      timestamp: new Date().toISOString(),
      userId,
      email,
      metadata,
    })
  }

  sessionCreated(userId: string, method: 'email' | 'google' | 'oauth', metadata?: Record<string, any>) {
    this.log({
      event: 'SESSION_CREATED',
      timestamp: new Date().toISOString(),
      userId,
      method,
      success: true,
      metadata,
    })
  }

  sessionVerified(userId: string, metadata?: Record<string, any>) {
    this.log({
      event: 'SESSION_VERIFIED',
      timestamp: new Date().toISOString(),
      userId,
      success: true,
      metadata,
    })
  }

  sessionExpired(userId: string, reason?: string, metadata?: Record<string, any>) {
    this.log({
      event: 'SESSION_EXPIRED',
      timestamp: new Date().toISOString(),
      userId,
      reason,
      metadata,
    })
  }

  sessionRefresh(userId: string, success: boolean, error?: string, metadata?: Record<string, any>) {
    this.log({
      event: success ? 'SESSION_REFRESH' : 'SESSION_REFRESH_FAILED',
      timestamp: new Date().toISOString(),
      userId,
      success,
      error,
      metadata,
    })
  }

  oauthAttempt(provider: string, metadata?: Record<string, any>) {
    this.log({
      event: 'OAUTH_ATTEMPT',
      timestamp: new Date().toISOString(),
      method: 'oauth',
      metadata: {
        ...metadata,
        provider,
      },
    })
  }

  oauthSuccess(userId: string, email: string, provider: string, metadata?: Record<string, any>) {
    this.log({
      event: 'OAUTH_SUCCESS',
      timestamp: new Date().toISOString(),
      userId,
      email,
      method: 'oauth',
      success: true,
      metadata: {
        ...metadata,
        provider,
      },
    })
  }

  oauthFailure(provider: string, error: string, errorCode?: string, metadata?: Record<string, any>) {
    this.log({
      event: 'OAUTH_FAILURE',
      timestamp: new Date().toISOString(),
      method: 'oauth',
      success: false,
      error,
      errorCode,
      metadata: {
        ...metadata,
        provider,
      },
    })
  }

  oauthCallback(hasCode: boolean, hasError: boolean, metadata?: Record<string, any>) {
    this.log({
      event: 'OAUTH_CALLBACK',
      timestamp: new Date().toISOString(),
      method: 'oauth',
      metadata: {
        ...metadata,
        hasCode,
        hasError,
      },
    })
  }

  middlewareBlock(path: string, reason: string, userId?: string, metadata?: Record<string, any>) {
    this.log({
      event: 'MIDDLEWARE_BLOCK',
      timestamp: new Date().toISOString(),
      userId,
      path,
      reason,
      success: false,
      metadata,
    })
  }

  middlewareAllow(path: string, userId?: string, isAdmin?: boolean, metadata?: Record<string, any>) {
    this.log({
      event: 'MIDDLEWARE_ALLOW',
      timestamp: new Date().toISOString(),
      userId,
      path,
      success: true,
      metadata: {
        ...metadata,
        isAdmin,
      },
    })
  }

  passwordResetRequest(email: string, metadata?: Record<string, any>) {
    this.log({
      event: 'PASSWORD_RESET_REQUEST',
      timestamp: new Date().toISOString(),
      email,
      metadata,
    })
  }

  passwordResetSuccess(userId: string, email: string, metadata?: Record<string, any>) {
    this.log({
      event: 'PASSWORD_RESET_SUCCESS',
      timestamp: new Date().toISOString(),
      userId,
      email,
      success: true,
      metadata,
    })
  }

  emailConfirmationSent(email: string, metadata?: Record<string, any>) {
    this.log({
      event: 'EMAIL_CONFIRMATION_SENT',
      timestamp: new Date().toISOString(),
      email,
      metadata,
    })
  }

  emailConfirmationSuccess(userId: string, email: string, metadata?: Record<string, any>) {
    this.log({
      event: 'EMAIL_CONFIRMATION_SUCCESS',
      timestamp: new Date().toISOString(),
      userId,
      email,
      success: true,
      metadata,
    })
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(count = 20): AuthLogData[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = []
  }

  /**
   * Get logs by event type
   */
  getLogsByEvent(event: AuthEventType): AuthLogData[] {
    return this.logs.filter(log => log.event === event)
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: string): AuthLogData[] {
    return this.logs.filter(log => log.userId === userId)
  }

  /**
   * Get failed events
   */
  getFailedEvents(): AuthLogData[] {
    return this.logs.filter(log => log.success === false)
  }
}

// Export singleton instance
export const authLogger = new AuthLogger()

// Export for testing
export { AuthLogger }

