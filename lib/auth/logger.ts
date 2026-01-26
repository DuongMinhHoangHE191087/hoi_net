/**
 * 🔐 Auth Logger - Structured Logging for Authentication
 * 
 * Production-ready logging with different levels and structured output.
 */

import { AuthConfig, DEFAULT_AUTH_CONFIG } from './types'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

class AuthLogger {
  private config: AuthConfig
  private prefix = '[Auth]'

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_AUTH_CONFIG, ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableLogging) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.logLevel]
  }

  private formatMessage(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const formattedMessage = `${this.prefix} ${message}`

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data ?? '')
        break
      case 'info':
        console.log(formattedMessage, data ?? '')
        break
      case 'warn':
        console.warn(formattedMessage, data ?? '')
        break
      case 'error':
        console.error(formattedMessage, data ?? '')
        break
    }
  }

  debug(message: string, data?: any): void {
    this.formatMessage('debug', message, data)
  }

  info(message: string, data?: any): void {
    this.formatMessage('info', message, data)
  }

  warn(message: string, data?: any): void {
    this.formatMessage('warn', message, data)
  }

  error(message: string, data?: any): void {
    this.formatMessage('error', message, data)
  }

  // Specific auth events
  initStart(): void {
    this.info('Initializing...')
  }

  initComplete(duration: number): void {
    this.info(`✅ Initialized in ${duration}ms`)
  }

  sessionFound(email: string): void {
    this.info(`Session found: ${email}`)
  }

  noSession(): void {
    this.info('No active session')
  }

  adminCheck(isAdmin: boolean): void {
    this.debug(`Admin status: ${isAdmin}`)
  }

  signInStart(method: 'email' | 'google' | 'oauth'): void {
    this.info(`Sign in started: ${method}`)
  }

  signInSuccess(email: string): void {
    this.info(`✅ Signed in: ${email}`)
  }

  signInError(error: string): void {
    this.error(`❌ Sign in failed: ${error}`)
  }

  signOutStart(): void {
    this.info('Signing out...')
  }

  signOutComplete(): void {
    this.info('✅ Signed out')
  }

  stateChange(event: string, email?: string): void {
    this.info(`State changed: ${event}`, email ? { email } : undefined)
  }
}

// Singleton instance
export const authLog = new AuthLogger()

