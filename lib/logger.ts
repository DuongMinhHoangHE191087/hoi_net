import { supabase } from '@/lib/supabase'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogEntry {
  level: LogLevel
  message: string
  path?: string
  user_id?: string
  metadata?: Record<string, any>
  error?: any
  timestamp?: string
}

// ============================================
// Log Buffer for Batch Database Writes
// ============================================

const LOG_BUFFER_SIZE = 50
const LOG_FLUSH_INTERVAL = 30000 // 30 seconds
let logBuffer: LogEntry[] = []
let flushTimeout: NodeJS.Timeout | null = null

/**
 * Flush log buffer to database
 */
async function flushLogBuffer(): Promise<void> {
  if (logBuffer.length === 0) return

  const logsToFlush = [...logBuffer]
  logBuffer = []

  // Only write to DB in production
  if (process.env.NODE_ENV === 'production') {
    try {
      const { error } = await supabase.from('system_logs').insert(
        logsToFlush.map(log => ({
          level: log.level,
          message: log.message,
          path: log.path || null,
          user_id: log.user_id || null,
          metadata: log.metadata || {},
          error: log.error ? (typeof log.error === 'string' ? log.error : JSON.stringify(log.error)) : null,
          created_at: log.timestamp || new Date().toISOString()
        }))
      )

      if (error) {
        console.error('[Logger] Failed to flush logs to database:', error.message)
      }
    } catch (err) {
      console.error('[Logger] Database flush error:', err)
    }
  }
}

/**
 * Schedule buffer flush
 */
function scheduleFlush(): void {
  if (flushTimeout) return

  flushTimeout = setTimeout(() => {
    flushTimeout = null
    flushLogBuffer()
  }, LOG_FLUSH_INTERVAL)
}

/**
 * Add log to buffer
 */
function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry)

  if (logBuffer.length >= LOG_BUFFER_SIZE) {
    flushLogBuffer()
  } else {
    scheduleFlush()
  }
}

// ============================================
// Console Logging with Colors
// ============================================

const LOG_COLORS = {
  info: '\x1b[36m',   // Cyan
  warn: '\x1b[33m',   // Yellow
  error: '\x1b[31m',  // Red
  debug: '\x1b[90m',  // Gray
  reset: '\x1b[0m'
}

function formatLogMessage(level: LogLevel, message: string, timestamp: string): string {
  const color = LOG_COLORS[level]
  return `${color}[${level.toUpperCase()}] ${timestamp}: ${message}${LOG_COLORS.reset}`
}

// ============================================
// Core Log Function
// ============================================

function log(level: LogLevel, message: string, context?: Omit<LogEntry, 'level' | 'message'>): void {
  const timestamp = new Date().toISOString()

  // Always log to console
  console.log(formatLogMessage(level, message, timestamp))

  if (context?.metadata && Object.keys(context.metadata).length > 0) {
    console.log(JSON.stringify(context.metadata, null, 2))
  }

  if (context?.error) {
    console.error(context.error)
  }

  // Add to buffer for database (errors and warnings only in production)
  if (level === 'error' || level === 'warn') {
    addToBuffer({
      level,
      message,
      timestamp,
      ...context
    })
  }
}

// ============================================
// Logger API
// ============================================

/**
 * Structured System Logger
 * - Console logging with colors
 * - Async batch writes to database for errors/warnings
 * - Debug logging only in development
 */
export const logger = {
  info(message: string, context?: Omit<LogEntry, 'level' | 'message'>): void {
    log('info', message, context)
  },

  warn(message: string, context?: Omit<LogEntry, 'level' | 'message'>): void {
    log('warn', message, context)
  },

  error(message: string, context?: Omit<LogEntry, 'level' | 'message'>): void {
    log('error', message, context)
  },

  debug(message: string, context?: Omit<LogEntry, 'level' | 'message'>): void {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, context)
    }
  },

  /**
   * Force flush all pending logs to database
   */
  async flush(): Promise<void> {
    await flushLogBuffer()
  },

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: Partial<LogEntry>) {
    return {
      info: (message: string, context?: Omit<LogEntry, 'level' | 'message'>) =>
        logger.info(message, { ...defaultContext, ...context }),
      warn: (message: string, context?: Omit<LogEntry, 'level' | 'message'>) =>
        logger.warn(message, { ...defaultContext, ...context }),
      error: (message: string, context?: Omit<LogEntry, 'level' | 'message'>) =>
        logger.error(message, { ...defaultContext, ...context }),
      debug: (message: string, context?: Omit<LogEntry, 'level' | 'message'>) =>
        logger.debug(message, { ...defaultContext, ...context }),
    }
  },

  /**
   * Time a function execution
   */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      logger.debug(`${label} completed in ${Date.now() - start}ms`)
      return result
    } catch (error) {
      logger.error(`${label} failed after ${Date.now() - start}ms`, { error })
      throw error
    }
  }
}

// Flush on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    flushLogBuffer()
  })
}
