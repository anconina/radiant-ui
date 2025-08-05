# Testing Strategy & Documentation

This directory contains comprehensive testing setup for the Radiant UI project, including unit tests, integration tests, E2E tests, and performance testing.

## Testing Philosophy

Our testing approach follows the **Testing Pyramid** principle:

- **Unit Tests (70%)**: Fast, isolated tests for individual functions and components
- **Integration Tests (20%)**: Tests for feature flows and component interactions
- **E2E Tests (10%)**: Full user journey tests across the entire application

## Test Types & Structure

### 📦 Unit Tests (`src/**/*.test.{ts,tsx}`)

- **Location**: Co-located with source files
- **Purpose**: Test individual components, hooks, and utilities in isolation
- **Tools**: Vitest, React Testing Library, MSW
- **Coverage Target**: 80%+

### 🔗 Integration Tests (`tests/integration/`)

- **Purpose**: Test feature flows and component interactions
- **Examples**: Authentication flow, form submissions, API integrations
- **Tools**: Vitest, React Testing Library, MSW
- **Coverage Target**: 70%+

### 🌐 E2E Tests (`tests/e2e/`)

- **Purpose**: Test complete user journeys across the application
- **Tools**: Playwright (Chromium, Firefox, WebKit)
- **Coverage**: Critical user paths and business flows

### 👁️ Visual Tests (`tests/visual/`)

- **Purpose**: Prevent visual regressions and ensure UI consistency
- **Tools**: Playwright visual comparisons
- **Coverage**: Key pages and components

### ⚡ Performance Tests (`tests/performance/`)

- **Purpose**: Monitor application performance and bundle size
- **Tools**: Playwright, Lighthouse CI
- **Metrics**: Load times, bundle size, Core Web Vitals

## Available Test Commands

### Basic Testing

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run unit tests with coverage
npm run test:coverage
```

### Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Component tests only
npm run test:components

# Integration tests
npm run test:integration
npm run test:integration:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug

# Cross-browser E2E tests
npm run test:e2e:browsers

# Visual regression tests
npm run test:visual

# Performance tests
npm run test:performance
```

### Comprehensive Testing

```bash
# Run all test types
npm run test:all

# CI testing suite
npm run test:ci
```

## Test Configuration Files

- `vitest.config.ts` - Main unit test configuration
- `vitest.config.integration.ts` - Integration test configuration
- `playwright.config.ts` - E2E test configuration
- `playwright.visual.config.ts` - Visual test configuration
- `playwright.perf.config.ts` - Performance test configuration

## Test Helpers & Utilities

### `tests/helpers/test-helpers.ts`

Common utilities for consistent testing:

- `renderWithProviders()` - Render components with React Query and Router
- `mockAuthenticatedUser()` - Mock authenticated state
- `mockApiResponse()` / `mockApiError()` - Mock API calls
- `waitForLoadingToFinish()` - Wait for async operations
- Responsive testing helpers
- Accessibility testing utilities

### `tests/setup/test-environment.ts`

Global test environment setup:

- MSW server configuration
- Browser API mocks (matchMedia, IntersectionObserver, etc.)
- localStorage/sessionStorage mocks
- Global cleanup and reset functions

## Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
```

### Integration Test Example

```typescript
import { renderWithProviders } from '../helpers/test-helpers'
import { AuthFlow } from './AuthFlow'

describe('Authentication Flow', () => {
  it('should complete login flow', async () => {
    const { user } = renderWithProviders(<AuthFlow />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/dashboard/i)).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { expect, test } from '@playwright/test'

test('user can complete checkout flow', async ({ page }) => {
  await page.goto('/products')
  await page.click('[data-testid="add-to-cart"]')
  await page.click('[data-testid="checkout"]')

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

## Best Practices

### Test Organization

- Keep tests close to the code they test
- Use descriptive test names that explain the behavior
- Group related tests using `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### Test Data

- Use factories for complex test data
- Mock external dependencies
- Keep test data minimal and focused
- Use realistic but anonymized data

### Assertions

- Test behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Assert on user-visible content
- Test accessibility attributes

### Performance

- Use `screen.getBy*` instead of `container.querySelector`
- Clean up after tests (handled automatically)
- Use `findBy*` for async operations
- Avoid testing implementation details

## Test Coverage

### Coverage Targets

- **Unit Tests**: 80% minimum
- **Integration Tests**: 70% minimum
- **E2E Tests**: Critical paths covered
- **Overall**: 75% minimum

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Continuous Integration

Tests run automatically on:

- Every push to main/develop branches
- All pull requests
- Daily scheduled runs
- Manual workflow dispatch

### GitHub Actions Workflows

- **CI Pipeline**: Unit and integration tests
- **Test Automation**: Matrix testing across browsers and Node versions
- **Quality**: Performance and accessibility testing
- **Visual**: Visual regression testing

## Debugging Tests

### Local Debugging

```bash
# Debug specific test
npm run test -- --reporter=verbose MyComponent.test.tsx

# Debug E2E tests
npm run test:e2e:debug

# Run E2E tests with UI
npm run test:e2e:ui
```

### VS Code Integration

- Install recommended extensions
- Use built-in test runner
- Set breakpoints in test files
- Use debug configurations

## Mock Service Worker (MSW)

### API Mocking

- Handlers in `src/mocks/handlers/`
- Automatic server setup in tests
- Network-level interception
- Realistic API responses

### Custom Mocks

```typescript
// Override default handler
server.use(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json({ users: mockUsers }))
  })
)
```

## Accessibility Testing

### Automated a11y Testing

- axe-core integration
- Keyboard navigation tests
- Screen reader compatibility
- WCAG compliance checks

### Manual Testing

- Test with keyboard only
- Test with screen reader
- Verify color contrast
- Check focus management

## Performance Testing

### Metrics Monitored

- Page load times
- Bundle size
- Memory usage
- Core Web Vitals (LCP, FID, CLS)

### Performance Budget

- Initial bundle: < 500KB
- Page load: < 3s on 3G
- Memory usage: < 50MB
- First Contentful Paint: < 2s

## Troubleshooting

### Common Issues

- **Tests timing out**: Increase timeout or use proper async/await
- **Elements not found**: Use `findBy*` for async elements
- **MSW not working**: Check server setup and handlers
- **E2E tests flaky**: Add proper waits and selectors

### Getting Help

- Check test documentation
- Review existing test examples
- Ask in team Slack channel
- Create GitHub issue for bugs

## Contributing

### Adding New Tests

1. Follow existing patterns
2. Add tests for new features
3. Maintain coverage targets
4. Update documentation

### Test Reviews

- Ensure tests are readable
- Verify correct assertions
- Check test isolation
- Validate performance impact
