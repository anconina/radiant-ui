# File Organization Structure

## Overview
This document describes the organized file structure implemented to reduce root directory clutter and improve project maintainability.

## Directory Structure

```
radiant-ui/
├── .artifacts/           # Generated outputs (gitignored)
│   ├── coverage/        # Test coverage reports
│   ├── test-results/    # Test execution results
│   ├── playwright-report/ # Playwright test reports
│   └── screenshots/     # Test screenshots
├── .config/             # Configuration files
│   ├── testing/         # Test-related configs
│   │   ├── playwright.config.mobile.ts
│   │   ├── playwright.performance.config.ts
│   │   ├── vitest.config.integration.ts
│   │   └── sonar-project.properties
│   └── build/           # Build-related configs
│       ├── vite.config.production.ts
│       ├── tsconfig.app.json
│       ├── tsconfig.node.json
│       └── steiger.config.js
├── .deploy/             # Deployment configurations
│   ├── deploy.config.js
│   ├── vercel.json
│   ├── netlify.toml
│   ├── railway.json
│   └── render.yaml
├── .docker/             # Docker configurations
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── Dockerfile.e2e
│   ├── Dockerfile.test
│   ├── docker-compose.yml
│   └── nginx.conf
└── [Essential root files]
```

## Migration Summary

### Before
- **Root files**: 40+ files
- **Organization**: Flat structure with all configs at root
- **Visibility**: Cluttered, difficult to navigate

### After
- **Root files**: 25 files (38% reduction)
- **Organization**: Logical grouping by purpose
- **Visibility**: Clean, intuitive structure

## Files Remaining at Root

Essential files that must remain at root due to tool requirements:
- `package.json`, `package-lock.json` - NPM requirements
- `tsconfig.json` - TypeScript IDE integration
- `vite.config.ts` - Primary Vite configuration
- `vitest.config.ts` - Primary Vitest configuration
- `playwright.config.ts` - Primary Playwright configuration
- `eslint.config.js` - ESLint expects at root
- `tailwind.config.js` - Referenced by PostCSS
- `postcss.config.js` - Build tool requirement
- `index.html` - Vite entry point
- `components.json` - shadcn/ui requirement
- `README.md` - Repository documentation
- `CONTRIBUTING.md` - Contribution guidelines

## Updated References

All configuration references have been updated:
- Package.json scripts point to new config locations
- Docker scripts reference files in `.docker/`
- Deployment scripts reference `.deploy/` configs
- TypeScript references updated in `tsconfig.json`
- `.gitignore` updated for new artifact locations

## Benefits

1. **Improved Developer Experience**
   - Cleaner root directory
   - Easier to find configurations
   - Better onboarding for new developers

2. **Better Organization**
   - Logical grouping of related files
   - Clear separation of concerns
   - Reduced cognitive load

3. **Maintainability**
   - Easier to manage configurations
   - Clear ownership of config files
   - Simplified CI/CD pipeline management

## Rollback Instructions

If needed, to rollback these changes:
```bash
git checkout main
git branch -D file-organization-migration
```

All changes are isolated in the `file-organization-migration` branch for safe testing before merging.