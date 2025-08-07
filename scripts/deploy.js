#!/usr/bin/env node
/**
 * Universal deployment script
 * Supports multiple deployment platforms
 */
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import deployConfig from '../.deploy/deploy.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Get deployment platform from command line
const platform = process.argv[2] || 'vercel'
const environment = process.argv[3] || 'production'

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: msg => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`),
}

// Pre-deployment checks
function preDeploymentChecks() {
  log.header('🔍 Pre-deployment Checks')

  // Check if build exists
  if (!existsSync(join(rootDir, 'dist'))) {
    log.error('Build directory not found. Run npm run build first.')
    process.exit(1)
  }

  // Check environment variables
  const requiredEnvVars = {
    vercel: ['VERCEL_TOKEN'],
    netlify: ['NETLIFY_AUTH_TOKEN', 'NETLIFY_SITE_ID'],
    aws: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    cloudflare: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'],
  }

  const missingVars = (requiredEnvVars[platform] || []).filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    log.error(`Missing environment variables: ${missingVars.join(', ')}`)
    process.exit(1)
  }

  log.success('Pre-deployment checks passed')
}

// Deploy to Vercel
async function deployToVercel() {
  log.header('🚀 Deploying to Vercel')

  try {
    // Create vercel.json if it doesn't exist
    const vercelConfig = {
      ...deployConfig.vercel,
      env: deployConfig.environments[environment],
    }

    writeFileSync(join(rootDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2))

    // Deploy
    const isProd = environment === 'production'
    const deployCommand = isProd ? 'vercel --prod --yes' : 'vercel --yes'

    execSync(deployCommand, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        VERCEL_TOKEN: process.env.VERCEL_TOKEN,
      },
    })

    log.success('Deployed to Vercel successfully')
  } catch (error) {
    log.error(`Vercel deployment failed: ${error.message}`)
    process.exit(1)
  }
}

// Deploy to Netlify
async function deployToNetlify() {
  log.header('🚀 Deploying to Netlify')

  try {
    // Create netlify.toml
    const netlifyConfig = `
[build]
  command = "${deployConfig.netlify.buildCommand}"
  publish = "${deployConfig.netlify.publishDirectory}"

[build.environment]
  NODE_VERSION = "${deployConfig.netlify.environment.NODE_VERSION}"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

${Object.entries(deployConfig.netlify.headers)
  .map(
    ([path, headers]) => `
[[headers]]
  for = "${path}"
  [headers.values]
${Object.entries(headers)
  .map(([key, value]) => `    ${key} = "${value}"`)
  .join('\n')}`
  )
  .join('\n')}
`

    writeFileSync(join(rootDir, 'netlify.toml'), netlifyConfig)

    // Deploy
    const isProd = environment === 'production'
    const deployCommand = `netlify deploy ${isProd ? '--prod' : ''} --dir=dist`

    execSync(deployCommand, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NETLIFY_AUTH_TOKEN: process.env.NETLIFY_AUTH_TOKEN,
        NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID,
      },
    })

    log.success('Deployed to Netlify successfully')
  } catch (error) {
    log.error(`Netlify deployment failed: ${error.message}`)
    process.exit(1)
  }
}

// Deploy to AWS S3 + CloudFront
async function deployToAWS() {
  log.header('🚀 Deploying to AWS S3 + CloudFront')

  try {
    const { s3, cloudfront } = deployConfig.aws

    // Sync to S3
    log.info('Syncing files to S3...')
    execSync(
      `aws s3 sync dist/ s3://${s3.bucketName}/ --delete --cache-control "public, max-age=31536000" --exclude "index.html"`,
      { cwd: rootDir, stdio: 'inherit' }
    )

    // Upload index.html with no-cache
    execSync(
      `aws s3 cp dist/index.html s3://${s3.bucketName}/index.html --cache-control "no-cache"`,
      { cwd: rootDir, stdio: 'inherit' }
    )

    // Invalidate CloudFront
    if (cloudfront.distributionId) {
      log.info('Invalidating CloudFront cache...')
      execSync(
        `aws cloudfront create-invalidation --distribution-id ${cloudfront.distributionId} --paths "/*"`,
        { cwd: rootDir, stdio: 'inherit' }
      )
    }

    log.success('Deployed to AWS successfully')
  } catch (error) {
    log.error(`AWS deployment failed: ${error.message}`)
    process.exit(1)
  }
}

// Deploy to Cloudflare Pages
async function deployToCloudflare() {
  log.header('🚀 Deploying to Cloudflare Pages')

  try {
    const config = deployConfig.cloudflare

    // Deploy using Wrangler
    execSync(
      `npx wrangler pages deploy dist --project-name=${config.projectName} --branch=${
        environment === 'production' ? 'main' : environment
      }`,
      {
        cwd: rootDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
          CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
        },
      }
    )

    log.success('Deployed to Cloudflare Pages successfully')
  } catch (error) {
    log.error(`Cloudflare deployment failed: ${error.message}`)
    process.exit(1)
  }
}

// Post-deployment tasks
async function postDeployment() {
  log.header('📋 Post-deployment Tasks')

  try {
    // Create deployment record
    const deploymentRecord = {
      platform,
      environment,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.0.0',
      commit: process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim(),
      branch: process.env.GITHUB_REF || execSync('git branch --show-current').toString().trim(),
    }

    const recordPath = join(rootDir, '.deployments.json')
    const deployments = existsSync(recordPath) ? JSON.parse(readFileSync(recordPath, 'utf-8')) : []

    deployments.push(deploymentRecord)
    writeFileSync(recordPath, JSON.stringify(deployments, null, 2))

    log.success('Deployment record saved')

    // Send deployment notification
    if (process.env.SLACK_WEBHOOK_URL) {
      log.info('Sending deployment notification...')
      // Slack notification would go here
    }
  } catch {
    log.warning('Post-deployment tasks failed')
  }
}

// Main deployment function
async function deploy() {
  log.header(`🚀 Deployment Script - ${platform} (${environment})`)

  preDeploymentChecks()

  switch (platform) {
    case 'vercel':
      await deployToVercel()
      break
    case 'netlify':
      await deployToNetlify()
      break
    case 'aws':
      await deployToAWS()
      break
    case 'cloudflare':
      await deployToCloudflare()
      break
    default:
      log.error(`Unknown platform: ${platform}`)
      log.info('Available platforms: vercel, netlify, aws, cloudflare')
      process.exit(1)
  }

  await postDeployment()

  log.header('✅ Deployment Complete!')
}

// Show usage
if (process.argv.includes('--help')) {
  console.log(`
Usage: node scripts/deploy.js [platform] [environment]

Platforms:
  - vercel (default)
  - netlify
  - aws
  - cloudflare

Environments:
  - production (default)
  - staging
  - development

Examples:
  node scripts/deploy.js vercel production
  node scripts/deploy.js netlify staging
  node scripts/deploy.js aws production
`)
  process.exit(0)
}

// Run deployment
deploy().catch(error => {
  log.error(`Deployment failed: ${error.message}`)
  process.exit(1)
})
