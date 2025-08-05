#!/usr/bin/env node

/**
 * Comprehensive security audit script
 * Performs multiple security checks on the codebase
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class SecurityAuditor {
  constructor() {
    this.results = {
      vulnerabilities: [],
      codeIssues: [],
      dependencies: [],
      summary: {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        info: 0,
      },
    }
  }

  // Run npm audit for dependency vulnerabilities
  auditDependencies() {
    console.log('🔍 Auditing dependencies for vulnerabilities...')

    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditResult)

      if (audit.vulnerabilities) {
        Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]) => {
          this.results.dependencies.push({
            package: pkg,
            severity: vuln.severity,
            title: vuln.title || 'Unknown vulnerability',
            url: vuln.url,
            range: vuln.range,
          })

          this.results.summary[vuln.severity]++
        })
      }

      console.log(
        `✅ Found ${Object.keys(audit.vulnerabilities || {}).length} dependency vulnerabilities`
      )
    } catch (error) {
      console.log('⚠️  Dependency audit completed with issues')
      // npm audit returns exit code 1 when vulnerabilities are found
      try {
        const auditResult = error.stdout || error.output?.[1]
        if (auditResult) {
          const audit = JSON.parse(auditResult.toString())
          if (audit.vulnerabilities) {
            Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]) => {
              this.results.dependencies.push({
                package: pkg,
                severity: vuln.severity,
                title: vuln.title || 'Unknown vulnerability',
                url: vuln.url,
                range: vuln.range,
              })

              this.results.summary[vuln.severity]++
            })
          }
        }
      } catch (parseError) {
        console.error('Failed to parse audit results:', parseError.message)
      }
    }
  }

  // Scan for hardcoded secrets and sensitive information
  scanForSecrets() {
    console.log('🔍 Scanning for hardcoded secrets...')

    const secretPatterns = [
      { name: 'API Keys', pattern: /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9]{16,}['"]?/gi },
      { name: 'AWS Keys', pattern: /AKIA[0-9A-Z]{16}/gi },
      { name: 'Private Keys', pattern: /-----BEGIN (RSA )?PRIVATE KEY-----/gi },
      { name: 'JWT Tokens', pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gi },
      { name: 'Database URLs', pattern: /(mongodb|mysql|postgres):\/\/[^\s]+/gi },
      { name: 'Generic Secrets', pattern: /(secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi },
    ]

    const excludePatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.lock$/,
      /\.log$/,
    ]

    const scanDirectory = dir => {
      const files = fs.readdirSync(dir)

      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory() && !excludePatterns.some(pattern => pattern.test(filePath))) {
          scanDirectory(filePath)
        } else if (stat.isFile() && !excludePatterns.some(pattern => pattern.test(filePath))) {
          try {
            const content = fs.readFileSync(filePath, 'utf8')

            secretPatterns.forEach(({ name, pattern }) => {
              let match
              while ((match = pattern.exec(content)) !== null) {
                this.results.codeIssues.push({
                  type: 'Potential Secret',
                  category: name,
                  file: filePath,
                  line: content.substring(0, match.index).split('\n').length,
                  match: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : ''),
                  severity: 'high',
                })

                this.results.summary.high++
              }
            })
          } catch (error) {
            // Skip binary files or files that can't be read
          }
        }
      })
    }

    scanDirectory(process.cwd())
    console.log(`✅ Secret scan completed`)
  }

  // Check for insecure code patterns
  scanCodePatterns() {
    console.log('🔍 Scanning for insecure code patterns...')

    const insecurePatterns = [
      {
        name: 'Dangerous innerHTML',
        pattern: /\.innerHTML\s*=\s*[^;]+/gi,
        severity: 'high',
        description: 'Using innerHTML with user data can lead to XSS attacks',
      },
      {
        name: 'eval() usage',
        pattern: /\beval\s*\(/gi,
        severity: 'critical',
        description: 'eval() can execute arbitrary code and should be avoided',
      },
      {
        name: 'document.write()',
        pattern: /document\.write\s*\(/gi,
        severity: 'moderate',
        description: 'document.write() can be exploited for XSS attacks',
      },
      {
        name: 'Unsafe regex',
        pattern: /new RegExp\([^)]*\+[^)]*\)/gi,
        severity: 'moderate',
        description: 'Dynamic regex construction can lead to ReDoS attacks',
      },
      {
        name: 'HTTP URLs',
        pattern: /http:\/\/[^\s'"]+/gi,
        severity: 'low',
        description: 'HTTP URLs should be replaced with HTTPS for security',
      },
    ]

    const scanCodeInDirectory = dir => {
      const files = fs.readdirSync(dir)

      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
          scanCodeInDirectory(filePath)
        } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8')

            insecurePatterns.forEach(({ name, pattern, severity, description }) => {
              let match
              while ((match = pattern.exec(content)) !== null) {
                this.results.codeIssues.push({
                  type: 'Insecure Code Pattern',
                  category: name,
                  file: filePath,
                  line: content.substring(0, match.index).split('\n').length,
                  match: match[0],
                  severity,
                  description,
                })

                this.results.summary[severity]++
              }
            })
          } catch (error) {
            // Skip files that can't be read
          }
        }
      })
    }

    scanCodeInDirectory(path.join(process.cwd(), 'src'))
    console.log(`✅ Code pattern scan completed`)
  }

  // Generate security report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      total: Object.values(this.results.summary).reduce((a, b) => a + b, 0),
      dependencies: this.results.dependencies,
      codeIssues: this.results.codeIssues,
    }

    // Write detailed report
    fs.writeFileSync(
      path.join(process.cwd(), 'security-report.json'),
      JSON.stringify(report, null, 2)
    )

    // Generate summary report
    const summaryReport = `
# Security Audit Report

**Generated:** ${new Date().toLocaleString()}

## Summary
- **Critical:** ${report.summary.critical}
- **High:** ${report.summary.high}
- **Moderate:** ${report.summary.moderate}
- **Low:** ${report.summary.low}
- **Info:** ${report.summary.info}

**Total Issues:** ${report.total}

## Dependency Vulnerabilities
${
  report.dependencies.length > 0
    ? report.dependencies
        .map(
          dep =>
            `- **${dep.package}** (${dep.severity}): ${dep.title}\n  - Range: ${dep.range}\n  - More info: ${dep.url || 'N/A'}`
        )
        .join('\n\n')
    : 'No dependency vulnerabilities found.'
}

## Code Issues
${
  report.codeIssues.length > 0
    ? report.codeIssues
        .map(
          issue =>
            `- **${issue.category}** in ${issue.file}:${issue.line}\n  - Severity: ${issue.severity}\n  - Pattern: \`${issue.match}\`\n  - Description: ${issue.description || 'N/A'}`
        )
        .join('\n\n')
    : 'No code issues found.'
}

## Recommendations
1. Fix all critical and high severity issues immediately
2. Review and address moderate severity issues
3. Consider addressing low severity issues for defense in depth
4. Run security audits regularly as part of CI/CD pipeline
5. Keep dependencies updated to latest secure versions
    `

    fs.writeFileSync(path.join(process.cwd(), 'security-report.md'), summaryReport)

    return report
  }

  // Run complete security audit
  async runAudit() {
    console.log('🚀 Starting comprehensive security audit...\n')

    this.auditDependencies()
    this.scanForSecrets()
    this.scanCodePatterns()

    const report = this.generateReport()

    console.log('\n📊 Security Audit Complete!')
    console.log('=====================================')
    console.log(`Critical: ${report.summary.critical}`)
    console.log(`High: ${report.summary.high}`)
    console.log(`Moderate: ${report.summary.moderate}`)
    console.log(`Low: ${report.summary.low}`)
    console.log(`Info: ${report.summary.info}`)
    console.log(`Total: ${report.total}`)
    console.log('=====================================')
    console.log('📄 Reports generated:')
    console.log('  - security-report.json (detailed)')
    console.log('  - security-report.md (summary)')

    // Exit with error code if critical or high severity issues found
    if (report.summary.critical > 0 || report.summary.high > 0) {
      console.log('\n❌ Security audit failed due to critical/high severity issues')
      process.exit(1)
    } else {
      console.log('\n✅ Security audit passed')
      process.exit(0)
    }
  }
}

// Run audit if script is executed directly
if (require.main === module) {
  const auditor = new SecurityAuditor()
  auditor.runAudit().catch(error => {
    console.error('Security audit failed:', error)
    process.exit(1)
  })
}

module.exports = SecurityAuditor
