/**
 * Application logging utility with multiple transports
 */
import { env } from '../environment/env'
import { captureMessage } from './sentry'

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log level names
const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
}

// Log colors for console
const LOG_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '#9CA3AF',
  [LogLevel.INFO]: '#3B82F6',
  [LogLevel.WARN]: '#F59E0B',
  [LogLevel.ERROR]: '#EF4444',
  [LogLevel.FATAL]: '#991B1B',
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableSentry: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  prefix?: string
}

// Log entry interface
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
  stackTrace?: string
}

// Logger class
class Logger {
  private config: LoggerConfig
  private buffer: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: env.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableSentry: env.enableSentry,
      enableRemote: false,
      ...config,
    }
  }

  // Core logging method
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    // Check minimum level
    if (level < this.config.minLevel) {
      return
    }

    // Create log entry
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      stackTrace: error?.stack || new Error().stack,
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Sentry integration
    if (this.config.enableSentry && level >= LogLevel.WARN) {
      this.logToSentry(entry)
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.bufferForRemote(entry)
    }
  }

  // Console transport
  private logToConsole(entry: LogEntry) {
    const color = LOG_COLORS[entry.level]
    const levelName = LOG_LEVEL_NAMES[entry.level]
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : ''

    const style = `color: ${color}; font-weight: bold;`
    const message = `%c${levelName}%c ${prefix} ${entry.message}`

    // Log with appropriate console method
    const consoleMethod = this.getConsoleMethod(entry.level)

    if (entry.context || entry.error) {
      console.groupCollapsed(message, style, '')

      if (entry.context) {
        console.log('Context:', entry.context)
      }

      if (entry.error) {
        console.error('Error:', entry.error)
      }

      console.groupEnd()
    } else {
      consoleMethod(message, style, '')
    }
  }

  // Get appropriate console method
  private getConsoleMethod(level: LogLevel) {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error
      default:
        return console.log
    }
  }

  // Sentry transport
  private logToSentry(entry: LogEntry) {
    const sentryLevel = this.mapToSentryLevel(entry.level)

    if (entry.error) {
      // Use captureException for errors
      import('./sentry').then(({ captureError }) => {
        captureError(entry.error!, {
          level: sentryLevel,
          message: entry.message,
          ...entry.context,
        })
      })
    } else {
      // Use captureMessage for non-error logs
      captureMessage(entry.message, sentryLevel, entry.context)
    }
  }

  // Map log level to Sentry severity
  private mapToSentryLevel(level: LogLevel): 'debug' | 'info' | 'warning' | 'error' | 'fatal' {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug'
      case LogLevel.INFO:
        return 'info'
      case LogLevel.WARN:
        return 'warning'
      case LogLevel.ERROR:
        return 'error'
      case LogLevel.FATAL:
        return 'fatal'
      default:
        return 'info'
    }
  }

  // Buffer logs for remote transport
  private bufferForRemote(entry: LogEntry) {
    this.buffer.push(entry)

    // Flush buffer if it gets too large
    if (this.buffer.length >= 50) {
      this.flushRemote()
    } else {
      // Schedule flush
      this.scheduleFlush()
    }
  }

  // Schedule buffer flush
  private scheduleFlush() {
    if (this.flushTimer) {
      return
    }

    this.flushTimer = setTimeout(() => {
      this.flushRemote()
    }, 5000) // Flush every 5 seconds
  }

  // Flush logs to remote endpoint
  private async flushRemote() {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) {
      return
    }

    const logs = [...this.buffer]
    this.buffer = []

    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = undefined
    }

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs,
          app: {
            version: env.appVersion,
            environment: env.appEnv,
            build: env.buildTimestamp,
          },
        }),
      })

      if (!response.ok) {
        console.error('Failed to send logs to remote:', response.statusText)
      }
    } catch (error) {
      console.error('Error sending logs to remote:', error)
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  error(
    message: string,
    errorOrContext?: Error | Record<string, any>,
    context?: Record<string, any>
  ) {
    if (errorOrContext instanceof Error) {
      this.log(LogLevel.ERROR, message, context, errorOrContext)
    } else {
      this.log(LogLevel.ERROR, message, errorOrContext)
    }
  }

  fatal(
    message: string,
    errorOrContext?: Error | Record<string, any>,
    context?: Record<string, any>
  ) {
    if (errorOrContext instanceof Error) {
      this.log(LogLevel.FATAL, message, context, errorOrContext)
    } else {
      this.log(LogLevel.FATAL, message, errorOrContext)
    }
  }

  // Create child logger with prefix
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    })
  }

  // Update configuration
  updateConfig(config: Partial<LoggerConfig>) {
    this.config = {
      ...this.config,
      ...config,
    }
  }

  // Force flush remote logs
  async flush() {
    await this.flushRemote()
  }
}

// Create default logger instance
export const logger = new Logger()

// Create specialized loggers
export const apiLogger = logger.child('API')
export const authLogger = logger.child('Auth')
export const perfLogger = logger.child('Performance')
export const securityLogger = logger.child('Security')

// Re-export types
export type { LogEntry, LoggerConfig }
