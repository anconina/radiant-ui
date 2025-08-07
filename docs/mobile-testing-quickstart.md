# Mobile Testing Quick Start Guide

## Prerequisites

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install --with-deps
```

3. Install axe-playwright for accessibility testing:

```bash
npm install --save-dev axe-playwright
```

## Running Tests Locally

### Quick Test Run

```bash
# Run all mobile tests
npm run test:mobile

# Run with UI mode (recommended for debugging)
npm run test:mobile:ui
```

### Test Specific Features

```bash
# Test responsive layouts
npm run test:mobile:responsive

# Test performance metrics
npm run test:mobile:performance

# Test visual consistency
npm run test:mobile:visual

# Test accessibility
npm run test:mobile:a11y
```

## Common Commands

### Update Visual Snapshots

When UI changes are intentional:

```bash
npm run test:mobile:visual:update
```

### Debug Failed Tests

```bash
# Interactive debugging
npm run test:mobile:debug

# View test report
npx playwright show-report
```

### Run on Specific Device

```bash
# iPhone only
npx playwright test --config playwright.config.mobile.ts --project="Mobile Safari"

# Android only
npx playwright test --config playwright.config.mobile.ts --project="Mobile Chrome"
```

## Test Structure

```
tests/mobile/
├── responsive.spec.ts    # Layout and responsiveness
├── performance.spec.ts   # Core Web Vitals and bundle size
├── visual.spec.ts        # Visual regression testing
├── accessibility.spec.ts # WCAG compliance
└── README.md            # Detailed documentation
```

## Tips for Writing Tests

1. **Use data-testid attributes**:

```tsx
<button data-testid="submit-button">Submit</button>
```

2. **Wait for content**:

```typescript
await page.waitForSelector('[data-testid="content-loaded"]')
```

3. **Test multiple viewports**:

```typescript
await page.setViewportSize({ width: 375, height: 667 })
```

4. **Check touch targets**:

```typescript
const box = await element.boundingBox()
expect(box.width).toBeGreaterThanOrEqual(44)
```

## Troubleshooting

### Tests failing locally but not in CI

- Check Node.js version matches CI
- Clear Playwright cache: `rm -rf ~/.cache/ms-playwright`
- Reinstall browsers: `npx playwright install --force`

### Visual tests have differences

- Update snapshots if changes are intentional
- Check for OS-specific font rendering differences
- Use `--update-snapshots` flag

### Performance tests timing out

- Increase timeout in test configuration
- Check if dev server is running
- Verify network throttling settings

## CI/CD Integration

Tests run automatically on:

- Push to main/develop branches
- Pull requests
- Nightly scheduled runs

View results in GitHub Actions tab or download artifacts for detailed reports.
