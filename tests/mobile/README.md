# Mobile Testing Suite

This directory contains comprehensive mobile testing for the RadiantUI application.

## Test Categories

### 1. Responsive Layout Testing (`responsive.spec.ts`)

- Viewport breakpoint validation
- Touch target size verification
- Responsive component behavior
- Orientation handling
- Safe area support

### 2. Performance Testing (`performance.spec.ts`)

- Core Web Vitals measurement
- Bundle size validation
- Network performance testing
- Memory usage monitoring
- JavaScript execution time analysis

### 3. Visual Testing (`visual.spec.ts`)

- Cross-device screenshot comparison
- Component state visual testing
- Dark mode visual consistency
- Landscape orientation layouts
- Loading state screenshots

### 4. Accessibility Testing (`accessibility.spec.ts`)

- WCAG compliance validation
- Screen reader support testing
- Touch target accessibility
- Focus management verification
- Reduced motion support

## Running Tests

### All Mobile Tests

```bash
npm run test:mobile
```

### Individual Test Suites

```bash
# Responsive tests only
npm run test:mobile:responsive

# Performance tests only
npm run test:mobile:performance

# Visual tests only
npm run test:mobile:visual

# Accessibility tests only
npm run test:mobile:a11y
```

### Interactive Mode

```bash
# Open Playwright UI
npm run test:mobile:ui

# Debug mode
npm run test:mobile:debug
```

### Update Visual Snapshots

```bash
npm run test:mobile:visual:update
```

## Configuration

Tests are configured in `playwright.config.mobile.ts` with:

- Multiple device presets (iPhone, Android, iPad)
- Network throttling for performance testing
- Screenshot and video capture on failure
- Parallel test execution

## CI/CD Integration

The `.github/workflows/mobile-tests.yml` workflow runs:

1. All mobile tests on push/PR
2. Performance analysis with Lighthouse
3. Visual regression testing
4. Accessibility compliance checks
5. Bundle size analysis

## Test Data Attributes

Components should include these data attributes for reliable testing:

- `data-testid` - For element selection
- `data-active` - For state indication
- `data-loaded` - For content ready state

## Writing New Tests

1. Create test file in appropriate category
2. Use device presets for consistency
3. Include accessibility checks
4. Add visual snapshots where appropriate
5. Document any special setup requirements

## Debugging Failed Tests

1. Check test artifacts in `test-results/`
2. Review screenshots in `screenshots/`
3. Use `--debug` flag for step-by-step execution
4. Check trace files for detailed execution logs

## Performance Budgets

- **JavaScript**: < 500KB (gzipped)
- **CSS**: < 100KB (gzipped)
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## Known Issues

- Some gestures may not work perfectly in emulation
- Real device testing recommended for final validation
- Visual tests may have minor pixel differences across platforms
