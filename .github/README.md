# GitHub Actions CI/CD Pipeline

This directory contains the GitHub Actions workflows for automated testing, quality checks, and deployment.

## Workflows

### 🔄 CI Pipeline (`ci.yml`)

**Triggers:** Push to main/develop, Pull Requests

**Jobs:**

- **Code Quality**: ESLint, TypeScript, Prettier checks
- **Unit Tests**: Vitest with coverage reporting
- **E2E Tests**: Playwright browser testing
- **Build Check**: Multi-node version build verification
- **Security Scan**: npm audit and vulnerability checks
- **Dependency Analysis**: Package validation and outdated checks

### 🚀 CD Pipeline (`cd.yml`)

**Triggers:** Push to main, Tags, Manual dispatch

**Jobs:**

- **Vercel Deployment**: Automated deployment to Vercel
- **Docker Build**: Container image creation and registry push
- **Health Check**: Post-deployment verification
- **Release Creation**: Automated GitHub releases for tags
- **Notifications**: Deployment status updates

### 🔄 Dependencies (`dependencies.yml`)

**Triggers:** Weekly schedule (Mondays), Manual dispatch

**Jobs:**

- **Auto Updates**: Patch/minor dependency updates
- **Security Audit**: Vulnerability scanning and fixes
- **License Check**: License compliance verification

### 📊 Quality & Performance (`quality.yml`)

**Triggers:** Push to main, PRs, Weekly schedule

**Jobs:**

- **Code Quality**: SonarCloud analysis, CodeClimate coverage
- **Bundle Analysis**: Size monitoring and optimization
- **Performance**: Lighthouse CI and regression testing
- **Accessibility**: a11y compliance testing
- **Security Scanning**: Advanced security analysis

## Required Secrets

### Deployment

- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `DEPLOYMENT_URL` - URL for health checks

### Docker (Optional)

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token

### Quality Tools (Optional)

- `SONAR_TOKEN` - SonarCloud authentication token
- `CC_TEST_REPORTER_ID` - CodeClimate test reporter ID
- `SNYK_TOKEN` - Snyk security scanning token

### Alternative Deployment (Optional)

- `NETLIFY_SITE_ID` - Netlify site identifier
- `NETLIFY_AUTH_TOKEN` - Netlify authentication token

## Features

### ✅ Quality Gates

- Comprehensive linting and type checking
- Automated test execution with coverage
- Security vulnerability scanning
- Code quality metrics and analysis

### 🔄 Automated Processes

- Dependency updates with testing
- Security patch automation
- Performance regression detection
- Accessibility compliance monitoring

### 🚀 Deployment Automation

- Multi-environment deployment support
- Automated rollback capabilities
- Health check verification
- Release management with changelogs

### 📊 Monitoring & Reporting

- Coverage reports with PR comments
- Bundle size tracking
- Performance metrics collection
- Security scan results

## Usage

### Manual Deployment

```bash
# Trigger manual deployment
gh workflow run cd.yml -f environment=staging
```

### Local Testing

```bash
# Run the same checks locally
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e
npm run build
```

### Workflow Status

Check workflow status and logs in the GitHub Actions tab of your repository.
