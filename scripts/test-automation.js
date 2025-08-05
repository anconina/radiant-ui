#!/usr/bin/env node
/**
 * Test automation script for local development
 * Provides interactive test running and monitoring
 */
import { spawn } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: msg => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`),
}

const testCommands = {
  1: { name: 'Run all unit tests', command: 'npm run test' },
  2: { name: 'Run tests with coverage', command: 'npm run test:coverage' },
  3: { name: 'Run integration tests', command: 'npm run test:integration' },
  4: { name: 'Run E2E tests', command: 'npm run test:e2e' },
  5: { name: 'Run visual tests', command: 'npm run test:visual' },
  6: { name: 'Run performance tests', command: 'npm run test:performance' },
  7: { name: 'Run cross-browser E2E', command: 'npm run test:e2e:browsers' },
  8: { name: 'Run all tests (comprehensive)', command: 'npm run test:all' },
  9: { name: 'Watch mode (unit tests)', command: 'npm run test:watch' },
  10: { name: 'Test UI (interactive)', command: 'npm run test:ui' },
  11: { name: 'E2E UI (debug mode)', command: 'npm run test:e2e:ui' },
  12: { name: 'Custom test pattern', command: 'custom' },
}

function displayMenu() {
  log.header('🧪 Test Automation Menu')

  Object.entries(testCommands).forEach(([key, { name }]) => {
    console.log(`${colors.yellow}${key.padStart(2)}${colors.reset}. ${name}`)
  })

  console.log(`${colors.yellow}${' 0'.padStart(2)}${colors.reset}. Exit`)
  console.log()
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    log.info(`Running: ${command}`)

    const [cmd, ...args] = command.split(' ')
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
    })

    child.on('close', code => {
      if (code === 0) {
        log.success('Command completed successfully')
        resolve(code)
      } else {
        log.error(`Command failed with exit code ${code}`)
        reject(code)
      }
    })

    child.on('error', error => {
      log.error(`Failed to run command: ${error.message}`)
      reject(error)
    })
  })
}

async function getCustomTestPattern() {
  return new Promise(resolve => {
    rl.question('Enter test file pattern (e.g., Button.test.tsx): ', pattern => {
      resolve(`npm run test -- ${pattern}`)
    })
  })
}

async function checkTestSetup() {
  try {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))

    const requiredDeps = [
      '@testing-library/react',
      '@testing-library/user-event',
      '@playwright/test',
      'vitest',
      'msw',
    ]

    const missing = requiredDeps.filter(
      dep => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    )

    if (missing.length > 0) {
      log.warning(`Missing test dependencies: ${missing.join(', ')}`)
      return false
    }

    log.success('Test setup verified')
    return true
  } catch {
    log.error('Failed to verify test setup')
    return false
  }
}

async function showTestCoverage() {
  try {
    const coveragePath = join(process.cwd(), 'coverage', 'coverage-summary.json')
    const coverage = JSON.parse(readFileSync(coveragePath, 'utf-8'))

    log.header('📊 Test Coverage Summary')

    const { total } = coverage
    console.log(`Lines: ${total.lines.pct}%`)
    console.log(`Functions: ${total.functions.pct}%`)
    console.log(`Branches: ${total.branches.pct}%`)
    console.log(`Statements: ${total.statements.pct}%`)

    if (total.lines.pct < 80) {
      log.warning('Line coverage is below 80%')
    } else {
      log.success('Coverage targets met!')
    }
  } catch {
    log.info('No coverage data available. Run tests with coverage first.')
  }
}

async function runPreCommitTests() {
  log.header('🚀 Running Pre-commit Test Suite')

  const commands = ['npm run lint', 'npm run typecheck', 'npm run test:coverage', 'npm run build']

  for (const command of commands) {
    try {
      await runCommand(command)
    } catch {
      log.error('Pre-commit tests failed')
      return false
    }
  }

  log.success('All pre-commit tests passed!')
  return true
}

async function main() {
  console.clear()
  log.header('🧪 Radiant UI Test Automation')

  // Check test setup
  const setupOk = await checkTestSetup()
  if (!setupOk) {
    log.error('Test setup verification failed. Please check your dependencies.')
    process.exit(1)
  }

  while (true) {
    displayMenu()

    const choice = await new Promise(resolve => {
      rl.question('Select an option: ', resolve)
    })

    if (choice === '0') {
      log.info('Goodbye!')
      break
    }

    if (choice === 'c' || choice === 'coverage') {
      await showTestCoverage()
      continue
    }

    if (choice === 'p' || choice === 'precommit') {
      await runPreCommitTests()
      continue
    }

    const testCommand = testCommands[choice]

    if (!testCommand) {
      if (choice === '12') {
        const customCommand = await getCustomTestPattern()
        try {
          await runCommand(customCommand)
        } catch {
          // Error already logged
        }
      } else {
        log.error('Invalid option. Please try again.')
      }
      continue
    }

    try {
      await runCommand(testCommand.command)
    } catch {
      // Error already logged
    }

    console.log()
    const continueChoice = await new Promise(resolve => {
      rl.question('Press Enter to continue or "q" to quit: ', resolve)
    })

    if (continueChoice.toLowerCase() === 'q') {
      break
    }
  }

  rl.close()
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log.info('\nExiting...')
  rl.close()
  process.exit(0)
})

// Run the script
main().catch(error => {
  log.error(`Script failed: ${error.message}`)
  process.exit(1)
})
