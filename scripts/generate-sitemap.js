#!/usr/bin/env node
/**
 * Generate sitemap.xml dynamically based on routes
 */
import { writeFileSync } from 'fs'
import { join } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Define your routes here
const routes = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly',
  },
  {
    path: '/dashboard',
    priority: 0.8,
    changefreq: 'daily',
  },
  {
    path: '/login',
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/register',
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/profile',
    priority: 0.6,
    changefreq: 'weekly',
  },
  {
    path: '/settings',
    priority: 0.5,
    changefreq: 'monthly',
  },
  {
    path: '/examples/loading-states',
    priority: 0.4,
    changefreq: 'monthly',
  },
  {
    path: '/examples/responsive',
    priority: 0.4,
    changefreq: 'monthly',
  },
  {
    path: '/examples/rtl',
    priority: 0.4,
    changefreq: 'monthly',
  },
  {
    path: '/examples/url-state',
    priority: 0.4,
    changefreq: 'monthly',
  },
]

// Get base URL from environment or use default
const BASE_URL = process.env.VITE_PUBLIC_URL || 'https://example.com'

// Generate sitemap XML
function generateSitemap() {
  const lastmod = new Date().toISOString().split('T')[0]

  const urls = routes
    .map(
      route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return sitemap
}

// Generate robots.txt
function generateRobots() {
  const robots = `# Robots.txt for Radiant UI

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /.well-known/
Disallow: /private/

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay (in seconds)
Crawl-delay: 1

# Specific bot rules
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: MJ12bot
Disallow: /`

  return robots
}

// Main function
function main() {
  console.log('🗺️  Generating sitemap.xml and robots.txt...')

  try {
    // Generate and write sitemap
    const sitemap = generateSitemap()
    writeFileSync(join(rootDir, 'public', 'sitemap.xml'), sitemap)
    console.log('✅ Generated sitemap.xml')

    // Generate and write robots.txt
    const robots = generateRobots()
    writeFileSync(join(rootDir, 'public', 'robots.txt'), robots)
    console.log('✅ Generated robots.txt')

    console.log(`📍 Base URL: ${BASE_URL}`)
    console.log(`📄 ${routes.length} routes included in sitemap`)
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
    process.exit(1)
  }
}

// Run the script
main()
