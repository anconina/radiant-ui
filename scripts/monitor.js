#!/usr/bin/env node
/**
 * Production monitoring script
 * Monitors application health and performance metrics
 */
import chalk from 'chalk'
import { exec } from 'child_process'
import fetch from 'node-fetch'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Configuration
const CONFIG = {
  healthEndpoint: process.env.HEALTH_ENDPOINT || 'https://api.example.com/health',
  metricsEndpoint: process.env.METRICS_ENDPOINT || 'https://api.example.com/metrics',
  statusPageUrl: process.env.STATUS_PAGE_URL || 'https://status.example.com',
  alertWebhook: process.env.ALERT_WEBHOOK,
  checkInterval: 60000, // 1 minute
  timeout: 30000, // 30 seconds
}

// Logging utilities
const log = {
  info: msg => console.log(chalk.blue('ℹ'), msg),
  success: msg => console.log(chalk.green('✓'), msg),
  warning: msg => console.log(chalk.yellow('⚠'), msg),
  error: msg => console.error(chalk.red('✗'), msg),
  metric: (name, value, unit = '') =>
    console.log(chalk.cyan('📊'), `${name}: ${chalk.bold(value)}${unit}`),
}

// Health check
async function checkHealth() {
  try {
    const response = await fetch(CONFIG.healthEndpoint, {
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Radiant-UI-Monitor/1.0',
      },
    })

    const data = await response.json()

    if (response.ok && data.status === 'healthy') {
      log.success(`Health check passed: ${data.version || 'unknown version'}`)
      return { healthy: true, data }
    } else {
      log.error(`Health check failed: ${response.status} ${response.statusText}`)
      return { healthy: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    log.error(`Health check error: ${error.message}`)
    return { healthy: false, error: error.message }
  }
}

// Metrics collection
async function collectMetrics() {
  try {
    const response = await fetch(CONFIG.metricsEndpoint, {
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Radiant-UI-Monitor/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const metrics = await response.json()

    // Display key metrics
    log.info('Performance Metrics:')
    if (metrics.responseTime) {
      log.metric('Response Time', metrics.responseTime, 'ms')
    }
    if (metrics.errorRate) {
      log.metric('Error Rate', (metrics.errorRate * 100).toFixed(2), '%')
    }
    if (metrics.activeUsers) {
      log.metric('Active Users', metrics.activeUsers)
    }
    if (metrics.cpuUsage) {
      log.metric('CPU Usage', (metrics.cpuUsage * 100).toFixed(1), '%')
    }
    if (metrics.memoryUsage) {
      log.metric('Memory Usage', (metrics.memoryUsage * 100).toFixed(1), '%')
    }

    return metrics
  } catch (error) {
    log.error(`Metrics collection error: ${error.message}`)
    return null
  }
}

// Send alert
async function sendAlert(message, level = 'warning') {
  if (!CONFIG.alertWebhook) {
    return
  }

  try {
    await fetch(CONFIG.alertWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        source: 'radiant-ui-monitor',
      }),
    })
  } catch (error) {
    log.error(`Failed to send alert: ${error.message}`)
  }
}

// Check deployment status
async function checkDeploymentStatus() {
  try {
    const { stdout } = await execAsync('git rev-parse HEAD')
    const currentCommit = stdout.trim().substring(0, 7)

    log.info(`Current deployment: ${currentCommit}`)

    // Check if deployment is recent (within last hour)
    const { stdout: deployTime } = await execAsync('git log -1 --format=%ct')
    const deploymentAge = Date.now() - parseInt(deployTime) * 1000
    const ageInHours = Math.floor(deploymentAge / (1000 * 60 * 60))

    if (ageInHours < 1) {
      log.warning(`Recent deployment detected (${ageInHours}h ago)`)
    }
  } catch {
    log.warning('Could not check deployment status')
  }
}

// Main monitoring loop
async function monitor() {
  log.info('🔍 Starting production monitoring...')
  log.info(`Health endpoint: ${CONFIG.healthEndpoint}`)
  log.info(`Check interval: ${CONFIG.checkInterval / 1000}s`)

  let consecutiveFailures = 0

  async function runCheck() {
    console.log('\n' + '─'.repeat(50))
    console.log(chalk.gray(new Date().toISOString()))

    // Check health
    const health = await checkHealth()

    if (!health.healthy) {
      consecutiveFailures++

      if (consecutiveFailures >= 3) {
        log.error(`Service unhealthy for ${consecutiveFailures} consecutive checks`)
        await sendAlert(
          `Health check failed ${consecutiveFailures} times: ${health.error}`,
          'critical'
        )
      }
    } else {
      if (consecutiveFailures > 0) {
        log.success('Service recovered')
        await sendAlert('Service recovered after health check failures', 'info')
      }
      consecutiveFailures = 0
    }

    // Collect metrics
    const metrics = await collectMetrics()

    // Check thresholds
    if (metrics) {
      if (metrics.responseTime > 1000) {
        log.warning('Response time exceeds threshold (>1000ms)')
        await sendAlert(`High response time: ${metrics.responseTime}ms`, 'warning')
      }

      if (metrics.errorRate > 0.05) {
        log.warning('Error rate exceeds threshold (>5%)')
        await sendAlert(`High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`, 'warning')
      }

      if (metrics.cpuUsage > 0.8) {
        log.warning('CPU usage exceeds threshold (>80%)')
        await sendAlert(`High CPU usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`, 'warning')
      }
    }

    // Check deployment status periodically
    if (Date.now() % 10 === 0) {
      await checkDeploymentStatus()
    }
  }

  // Run initial check
  await runCheck()

  // Schedule periodic checks
  setInterval(runCheck, CONFIG.checkInterval)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.info('\n👋 Stopping monitor...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  log.info('\n👋 Stopping monitor...')
  process.exit(0)
})

// Start monitoring
monitor().catch(error => {
  log.error(`Monitor failed to start: ${error.message}`)
  process.exit(1)
})
