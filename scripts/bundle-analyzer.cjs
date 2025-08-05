#!/usr/bin/env node

/**
 * Bundle size analyzer and optimization reporter
 * Analyzes bundle composition, identifies optimization opportunities
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class BundleAnalyzer {
  constructor() {
    this.results = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      dependencies: {},
      recommendations: [],
      baseline: null,
    }

    this.sizeLimits = {
      initialBundle: 250 * 1024, // 250KB
      totalBundle: 1024 * 1024, // 1MB
      chunkSize: 150 * 1024, // 150KB per chunk
    }
  }

  // Load baseline metrics if available
  loadBaseline() {
    const baselinePath = path.join(process.cwd(), 'bundle-baseline.json')
    if (fs.existsSync(baselinePath)) {
      this.results.baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
      console.log('📊 Loaded baseline metrics for comparison')
    }
  }

  // Build project and analyze bundle
  async buildAndAnalyze() {
    console.log('🔨 Building project for bundle analysis...')

    try {
      // Build with detailed bundle analysis
      const buildCommand = 'npm run build 2>&1'
      const buildOutput = execSync(buildCommand, { encoding: 'utf8' })

      // Check if build was successful
      if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
        throw new Error('Build failed - dist directory not found')
      }

      console.log('✅ Build completed successfully')

      // Analyze dist folder
      this.analyzeBundleSize()
      this.analyzeChunkSizes()
      this.generateRecommendations()
    } catch (error) {
      console.log('⚠️  Build failed, attempting analysis of current bundle structure...')
      console.log('Error:', error.message)

      // Fallback: analyze source structure for optimization opportunities
      this.analyzeSourceStructure()
    }
  }

  // Analyze actual bundle sizes in dist folder
  analyzeBundleSize() {
    const distPath = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distPath)) {
      console.log('❌ No dist folder found, skipping bundle analysis')
      return
    }

    console.log('📦 Analyzing bundle sizes...')

    const analyzeDirectory = (dir, basePath = '') => {
      const files = fs.readdirSync(dir)

      files.forEach(file => {
        const filePath = path.join(dir, file)
        const relativePath = path.join(basePath, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          analyzeDirectory(filePath, relativePath)
        } else if (stat.isFile()) {
          const size = stat.size
          this.results.totalSize += size

          // Categorize files
          if (file.endsWith('.js')) {
            this.results.chunks.push({
              name: relativePath,
              size: size,
              sizeFormatted: this.formatBytes(size),
              type: 'JavaScript',
              isLarge: size > this.sizeLimits.chunkSize,
            })
          } else if (file.endsWith('.css')) {
            this.results.chunks.push({
              name: relativePath,
              size: size,
              sizeFormatted: this.formatBytes(size),
              type: 'CSS',
              isLarge: size > 50 * 1024, // 50KB for CSS
            })
          } else if (
            ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].some(ext => file.endsWith(ext))
          ) {
            this.results.chunks.push({
              name: relativePath,
              size: size,
              sizeFormatted: this.formatBytes(size),
              type: 'Image',
              isLarge: size > 100 * 1024, // 100KB for images
            })
          }
        }
      })
    }

    analyzeDirectory(distPath)

    // Sort chunks by size
    this.results.chunks.sort((a, b) => b.size - a.size)

    console.log(`📊 Total bundle size: ${this.formatBytes(this.results.totalSize)}`)
  }

  // Analyze chunk sizes and identify issues
  analyzeChunkSizes() {
    console.log('🔍 Analyzing chunk composition...')

    const jsChunks = this.results.chunks.filter(chunk => chunk.type === 'JavaScript')
    const cssChunks = this.results.chunks.filter(chunk => chunk.type === 'CSS')
    const imageAssets = this.results.chunks.filter(chunk => chunk.type === 'Image')

    // Check for oversized chunks
    const largeChunks = this.results.chunks.filter(chunk => chunk.isLarge)

    if (largeChunks.length > 0) {
      console.log(`⚠️  Found ${largeChunks.length} oversized chunks:`)
      largeChunks.forEach(chunk => {
        console.log(`   - ${chunk.name}: ${chunk.sizeFormatted}`)
      })
    }

    console.log(`📈 Bundle composition:`)
    console.log(
      `   - JavaScript: ${jsChunks.length} files, ${this.formatBytes(jsChunks.reduce((sum, chunk) => sum + chunk.size, 0))}`
    )
    console.log(
      `   - CSS: ${cssChunks.length} files, ${this.formatBytes(cssChunks.reduce((sum, chunk) => sum + chunk.size, 0))}`
    )
    console.log(
      `   - Images: ${imageAssets.length} files, ${this.formatBytes(imageAssets.reduce((sum, chunk) => sum + chunk.size, 0))}`
    )
  }

  // Analyze source code structure for optimization opportunities
  analyzeSourceStructure() {
    console.log('🔍 Analyzing source structure for optimization opportunities...')

    const srcPath = path.join(process.cwd(), 'src')
    const packageJsonPath = path.join(process.cwd(), 'package.json')

    // Analyze dependencies
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      this.analyzeDependencies(packageJson)
    }

    // Analyze source code patterns
    this.analyzeSourcePatterns(srcPath)
  }

  // Analyze dependencies for size optimization
  analyzeDependencies(packageJson) {
    console.log('📦 Analyzing dependencies...')

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    const heavyDependencies = [
      'lodash',
      'moment',
      'date-fns',
      'antd',
      'material-ui',
      'rxjs',
      'axios',
      'jquery',
      'bootstrap',
    ]

    const foundHeavyDeps = Object.keys(dependencies).filter(dep =>
      heavyDependencies.some(heavy => dep.includes(heavy))
    )

    if (foundHeavyDeps.length > 0) {
      console.log(`⚠️  Heavy dependencies detected: ${foundHeavyDeps.join(', ')}`)
      this.results.recommendations.push({
        type: 'dependency',
        severity: 'medium',
        title: 'Heavy Dependencies Detected',
        description: `Consider lighter alternatives for: ${foundHeavyDeps.join(', ')}`,
        impact: 'Bundle size reduction of 50-200KB possible',
      })
    }

    // Check for duplicate functionality
    const uiLibraries = Object.keys(dependencies).filter(dep =>
      ['react-bootstrap', 'antd', 'material-ui', 'chakra-ui', 'mantine'].some(ui =>
        dep.includes(ui)
      )
    )

    if (uiLibraries.length > 1) {
      this.results.recommendations.push({
        type: 'dependency',
        severity: 'high',
        title: 'Multiple UI Libraries',
        description: `Multiple UI libraries detected: ${uiLibraries.join(', ')}. Consider consolidating.`,
        impact: 'Bundle size reduction of 100-500KB possible',
      })
    }
  }

  // Analyze source code patterns
  analyzeSourcePatterns(srcPath) {
    console.log('🔍 Analyzing code patterns...')

    let totalFiles = 0
    let largeFiles = 0
    let duplicateImports = new Set()

    const analyzeFile = filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const size = content.length

        totalFiles++

        if (size > 10000) {
          // Files larger than 10KB
          largeFiles++
        }

        // Check for potential optimizations
        if (content.includes('import * as')) {
          this.results.recommendations.push({
            type: 'import',
            severity: 'medium',
            title: 'Wildcard Imports Detected',
            description: `File ${path.relative(process.cwd(), filePath)} uses wildcard imports`,
            impact: 'Tree shaking optimization opportunity',
          })
        }

        // Check for large inline data
        if (content.length > 50000) {
          this.results.recommendations.push({
            type: 'code',
            severity: 'high',
            title: 'Large File Detected',
            description: `File ${path.relative(process.cwd(), filePath)} is ${this.formatBytes(size)}`,
            impact: 'Consider code splitting or moving data to separate file',
          })
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const scanDirectory = dir => {
      const files = fs.readdirSync(dir)

      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory() && !file.includes('node_modules')) {
          scanDirectory(filePath)
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(file)) {
          analyzeFile(filePath)
        }
      })
    }

    if (fs.existsSync(srcPath)) {
      scanDirectory(srcPath)
    }

    console.log(`📊 Source analysis: ${totalFiles} files, ${largeFiles} large files`)
  }

  // Generate optimization recommendations
  generateRecommendations() {
    console.log('💡 Generating optimization recommendations...')

    // Check bundle size against limits
    if (this.results.totalSize > this.sizeLimits.totalBundle) {
      this.results.recommendations.push({
        type: 'size',
        severity: 'high',
        title: 'Bundle Size Exceeds Limit',
        description: `Total bundle size ${this.formatBytes(this.results.totalSize)} exceeds limit of ${this.formatBytes(this.sizeLimits.totalBundle)}`,
        impact: 'Performance degradation on slow networks',
      })
    }

    // Check for oversized chunks
    const largeChunks = this.results.chunks.filter(chunk => chunk.isLarge)
    if (largeChunks.length > 0) {
      this.results.recommendations.push({
        type: 'chunking',
        severity: 'medium',
        title: 'Large Chunks Detected',
        description: `${largeChunks.length} chunks exceed recommended size`,
        impact: 'Implement code splitting and lazy loading',
      })
    }

    // General optimization recommendations
    this.results.recommendations.push({
      type: 'optimization',
      severity: 'low',
      title: 'Enable Gzip Compression',
      description: 'Configure server to enable gzip compression',
      impact: '60-80% size reduction for text assets',
    })

    this.results.recommendations.push({
      type: 'optimization',
      severity: 'low',
      title: 'Implement Tree Shaking',
      description: 'Ensure unused code is eliminated during build',
      impact: '10-30% bundle size reduction',
    })

    this.results.recommendations.push({
      type: 'optimization',
      severity: 'medium',
      title: 'Implement Code Splitting',
      description: 'Split code into smaller chunks loaded on demand',
      impact: 'Improved initial load time',
    })
  }

  // Compare with baseline if available
  compareWithBaseline() {
    if (!this.results.baseline) return

    console.log('📊 Comparing with baseline...')

    const sizeDiff = this.results.totalSize - this.results.baseline.totalSize
    const chunkDiff = this.results.chunks.length - this.results.baseline.chunks.length

    if (sizeDiff > 0) {
      console.log(
        `📈 Bundle size increased by ${this.formatBytes(sizeDiff)} (+${((sizeDiff / this.results.baseline.totalSize) * 100).toFixed(1)}%)`
      )
    } else if (sizeDiff < 0) {
      console.log(
        `📉 Bundle size decreased by ${this.formatBytes(Math.abs(sizeDiff))} (-${((Math.abs(sizeDiff) / this.results.baseline.totalSize) * 100).toFixed(1)}%)`
      )
    } else {
      console.log('📊 Bundle size unchanged')
    }

    if (chunkDiff !== 0) {
      console.log(`📦 Chunk count changed by ${chunkDiff}`)
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: this.results.totalSize,
      totalSizeFormatted: this.formatBytes(this.results.totalSize),
      chunks: this.results.chunks,
      recommendations: this.results.recommendations,
      baseline: this.results.baseline,
      performance: {
        exceedsLimits: this.results.totalSize > this.sizeLimits.totalBundle,
        largeChunks: this.results.chunks.filter(chunk => chunk.isLarge).length,
        score: this.calculatePerformanceScore(),
      },
    }

    // Write detailed report
    fs.writeFileSync(
      path.join(process.cwd(), 'bundle-analysis.json'),
      JSON.stringify(report, null, 2)
    )

    // Generate summary report
    const summaryReport = `
# Bundle Analysis Report

**Generated:** ${new Date().toLocaleString()}
**Total Size:** ${report.totalSizeFormatted}
**Performance Score:** ${report.performance.score}/100

## Bundle Composition
${
  this.results.chunks.length > 0
    ? this.results.chunks
        .slice(0, 10)
        .map(
          chunk =>
            `- **${chunk.name}** (${chunk.type}): ${chunk.sizeFormatted}${chunk.isLarge ? ' ⚠️  Large' : ''}`
        )
        .join('\n')
    : 'No bundle analysis available (build may have failed)'
}

## Optimization Recommendations
${this.results.recommendations
  .map(
    (rec, index) =>
      `### ${index + 1}. ${rec.title} (${rec.severity})
- **Description:** ${rec.description}
- **Impact:** ${rec.impact}`
  )
  .join('\n\n')}

## Performance Metrics
- **Bundle Size Limit:** ${this.formatBytes(this.sizeLimits.totalBundle)}
- **Exceeds Limits:** ${report.performance.exceedsLimits ? '❌ Yes' : '✅ No'}
- **Large Chunks:** ${report.performance.largeChunks}
- **Total Chunks:** ${this.results.chunks.length}

## Next Steps
1. Implement code splitting for large chunks
2. Enable tree shaking and dead code elimination
3. Optimize dependencies and remove unused libraries
4. Configure asset compression (gzip/brotli)
5. Implement lazy loading for non-critical components
6. Set up bundle size monitoring in CI/CD pipeline
    `

    fs.writeFileSync(path.join(process.cwd(), 'bundle-analysis.md'), summaryReport)

    return report
  }

  // Calculate performance score
  calculatePerformanceScore() {
    let score = 100

    // Penalty for large bundle size
    if (this.results.totalSize > this.sizeLimits.totalBundle) {
      score -= 30
    } else if (this.results.totalSize > this.sizeLimits.totalBundle * 0.8) {
      score -= 15
    }

    // Penalty for large chunks
    const largeChunks = this.results.chunks.filter(chunk => chunk.isLarge)
    score -= largeChunks.length * 5

    // Penalty for high severity recommendations
    const highSeverityRecs = this.results.recommendations.filter(rec => rec.severity === 'high')
    score -= highSeverityRecs.length * 10

    return Math.max(0, Math.min(100, score))
  }

  // Utility function to format bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Save current results as baseline
  saveAsBaseline() {
    const baselineData = {
      timestamp: new Date().toISOString(),
      totalSize: this.results.totalSize,
      chunks: this.results.chunks,
    }

    fs.writeFileSync(
      path.join(process.cwd(), 'bundle-baseline.json'),
      JSON.stringify(baselineData, null, 2)
    )

    console.log('💾 Saved current metrics as baseline')
  }

  // Run complete bundle analysis
  async runAnalysis() {
    console.log('🚀 Starting bundle analysis...\n')

    this.loadBaseline()
    await this.buildAndAnalyze()
    const report = this.generateReport()
    this.compareWithBaseline()

    console.log('\n📊 Bundle Analysis Complete!')
    console.log('=====================================')
    console.log(`Total Size: ${report.totalSizeFormatted}`)
    console.log(`Performance Score: ${report.performance.score}/100`)
    console.log(`Recommendations: ${report.recommendations.length}`)
    console.log('=====================================')
    console.log('📄 Reports generated:')
    console.log('  - bundle-analysis.json (detailed)')
    console.log('  - bundle-analysis.md (summary)')

    // Offer to save as baseline
    if (process.argv.includes('--save-baseline')) {
      this.saveAsBaseline()
    }

    // Exit with warning if performance score is low
    if (report.performance.score < 70) {
      console.log('\n⚠️  Bundle performance needs improvement')
      process.exit(1)
    } else {
      console.log('\n✅ Bundle performance is acceptable')
      process.exit(0)
    }
  }
}

// Run analysis if script is executed directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer()
  analyzer.runAnalysis().catch(error => {
    console.error('Bundle analysis failed:', error)
    process.exit(1)
  })
}

module.exports = BundleAnalyzer
