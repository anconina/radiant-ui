# Radiant UI Testing Guide

## Overview

Radiant UI implements a comprehensive testing strategy covering unit tests, integration tests, component tests, and end-to-end tests following Feature-Sliced Design (FSD) architecture. This guide provides detailed information about testing practices, tools, and workflows.

## 🧪 Testing Philosophy

### Testing Pyramid

```
        /\
       /  \
      / E2E \
     /______\
    /        \
   /Integration\
  /_____________\
 /              \
/  Unit Tests   \
/________________\
```

**Unit Tests (Foundation)**: 70% of tests - Fast, isolated, focused
**Integration Tests (Middle)**: 20% of tests - Feature interactions
**E2E Tests (Top)**: 10% of tests - Full user workflows

### Core Principles

1. **Test-Driven Development**: Write tests alongside features
2. **FSD Compliance**: Tests follow layer hierarchy
3. **Fast Feedback**: Optimize tests for quick execution
4. **Reliable Tests**: Ensure tests are deterministic and stable
5. **Maintainable Tests**: Write clear, well-structured test code

## 🏗️ Test Architecture (FSD)

### Test Organization by Layers

Tests are colocated with their source files following FSD structure:

```
src/
├── app/                         # App layer tests
│   └── providers/
│       └── __tests__/
│
├── pages/                       # Pages layer tests
│   └── dashboard/
│       ├── ui/
│       │   └── DashboardPage.tsx
│       └── __tests__/
│           └── DashboardPage.test.tsx
│
├── widgets/                     # Widgets layer tests
│   └── app-shell/
│       └── ui/
│           └── __tests__/
│
├── features/                    # Features layer tests
│   └── auth/
│       ├── api/
│       │   └── __tests__/
│       ├── model/
│       │   └── __tests__/
│       │       └── auth.store.test.ts
│       └── ui/
│           └── __tests__/
│               └── LoginForm.test.tsx
│
├── entities/                    # Entities layer tests
│   └── user/
│       ├── model/
│       │   └── __tests__/
│       └── ui/
│           └── __tests__/
│
└── shared/                      # Shared layer tests
    ├── lib/
    │   └── __tests__/
    └── ui/
        └── __tests__/
            └── button.test.tsx
```

### Test Infrastructure

```
├── vitest.config.ts              # Vitest configuration
├── vitest.config.integration.ts  # Integration test config
├── playwright.config.ts          # Playwright E2E config
├── playwright.visual.config.ts   # Visual testing config
├── playwright.perf.config.ts     # Performance testing config
├── src/test/                     # Test utilities
└── src/mocks/                    # MSW mock handlers
```

## 🛠️ Testing Tools

### Unit & Integration Testing

**Vitest**: Fast unit test runner with native TypeScript support

- Hot reload for test development
- Built-in code coverage
- Jest-compatible API
- Native ESM support

**React Testing Library**: Component testing utilities

- User-centric testing approach
- Accessibility-focused queries
- Integration with testing best practices

**Testing Library User Event**: User interaction simulation

- Realistic user interactions
- Async event handling
- Accessibility considerations

### Mocking & Fixtures

**MSW (Mock Service Worker)**: API mocking

- Intercepts network requests
- Works in both browser and Node.js
- Realistic API simulation
- Consistent mocking across test environments

**@faker-js/faker**: Test data generation

- Realistic test data
- Locale-specific data
- Deterministic seeding

### End-to-End Testing

**Playwright**: Cross-browser E2E testing

- Multi-browser support (Chrome, Firefox, Safari)
- Visual testing capabilities
- Performance testing
- Network interception
- Mobile device emulation

### Architecture Testing

**Steiger**: FSD compliance checking

- Validates layer dependencies
- Ensures proper imports
- Checks public API usage

## 📋 Test Scripts Reference

### Development & Unit Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run unit tests only
npm run test:unit

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Run tests in CI mode
npm run test:ci
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run integration tests with coverage
npm run test:integration:coverage
```

### End-to-End Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Visual regression tests
npm run test:visual

# Performance tests
npm run test:performance
```

### Architecture Tests

```bash
# Check FSD compliance
npm run steiger

# Fix FSD violations
npm run steiger -- --fix
```

### Test Automation

```bash
# Run all test types
npm run test:all

# Run quality checks
npm run lint && npm run typecheck && npm run test:unit && npm run steiger
```

## 🧩 Unit Testing Patterns (FSD)

### Shared UI Component Testing

```tsx
// src/shared/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Entity Component Testing

```tsx
// src/entities/user/ui/__tests__/UserAvatar.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { mockUser } from '../../model/__mocks__/user.mock'
import { UserAvatar } from '../UserAvatar'

describe('UserAvatar', () => {
  it('displays user avatar image', () => {
    render(<UserAvatar user={mockUser} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', mockUser.avatar)
    expect(img).toHaveAttribute('alt', mockUser.name)
  })

  it('displays initials when no avatar', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined }
    render(<UserAvatar user={userWithoutAvatar} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    const { rerender } = render(<UserAvatar user={mockUser} size="sm" />)
    expect(screen.getByTestId('avatar')).toHaveClass('h-8 w-8')

    rerender(<UserAvatar user={mockUser} size="lg" />)
    expect(screen.getByTestId('avatar')).toHaveClass('h-12 w-12')
  })
})
```

### Feature Store Testing

```tsx
// src/features/auth/model/__tests__/auth.store.test.ts
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../auth.store'

// Mock dependencies
vi.mock('@/shared/lib/auth/token-manager', () => ({
  tokenManager: {
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(),
  },
}))

vi.mock('../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  it('has initial state', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handles successful login', async () => {
    const { authApi } = await import('../api/auth.api')
    const mockResponse = {
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
    }

    vi.mocked(authApi.login).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(result.current.user).toEqual(mockResponse.user)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('handles login error', async () => {
    const { authApi } = await import('../api/auth.api')
    const error = new Error('Invalid credentials')

    vi.mocked(authApi.login).mockRejectedValue(error)

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      try {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
        })
      } catch {
        // Expected error
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Invalid credentials')
  })
})
```

### Feature Component Testing

```tsx
// src/features/auth/ui/__tests__/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../../model/auth.store'
import { LoginForm } from '../LoginForm'

vi.mock('../../model/auth.store')

describe('LoginForm', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      // ... other store properties
    } as any)
  })

  it('renders form fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: false,
      })
    })
  })

  it('shows loading state', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    } as any)

    render(<LoginForm />)

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})
```

## 🔗 Integration Testing

### API Integration Tests

```tsx
// src/entities/user/api/__tests__/user.api.test.ts
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { userApi } from '../user.api'

const server = setupServer(
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('userApi', () => {
  it('fetches user by id', async () => {
    const user = await userApi.getById('1')

    expect(user).toMatchObject({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    })
  })

  it('validates response with Zod schema', async () => {
    server.use(
      http.get('/api/users/:id', () => {
        return HttpResponse.json({
          id: '1',
          // Missing required fields
        })
      })
    )

    await expect(userApi.getById('1')).rejects.toThrow()
  })
})
```

### Feature Integration Tests

```tsx
// src/pages/auth/__tests__/LoginPage.integration.test.tsx
import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { LoginPage } from '../ui/LoginPage'

describe('LoginPage Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
      </BrowserRouter>
    )
  }

  it('completes login flow', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Wait for navigation
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard')
    })
  })
})
```

## 🔐 Testing Secure Token Management

### Token Storage Strategy Testing

```tsx
// src/shared/lib/auth/__tests__/token-manager.test.ts
import { beforeEach, describe, expect, it } from 'vitest'

import { CookieStorageStrategy } from '../strategies/cookie-storage.strategy'
import { LocalStorageStrategy } from '../strategies/local-storage.strategy'
import { SecureTokenManager } from '../token-manager'

describe('SecureTokenManager', () => {
  describe('Development Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('uses localStorage strategy', () => {
      const manager = new SecureTokenManager(new LocalStorageStrategy())
      expect(manager.isUsingSecureCookies()).toBe(false)
    })

    it('stores tokens in localStorage', async () => {
      const manager = new SecureTokenManager(new LocalStorageStrategy())

      await manager.setTokens({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
      })

      const token = await manager.getAccessToken()
      expect(token).toBe('test-token')
    })
  })

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('uses cookie strategy', () => {
      const manager = new SecureTokenManager(new CookieStorageStrategy())
      expect(manager.isUsingSecureCookies()).toBe(true)
    })

    it('returns cookie-auth for production tokens', async () => {
      const manager = new SecureTokenManager(new CookieStorageStrategy())

      const token = await manager.getAccessToken()
      expect(token).toBe('cookie-auth')
    })
  })
})
```

### CSRF Protection Testing

```tsx
// src/shared/lib/auth/csrf/__tests__/csrf-manager.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { csrfManager } from '../csrf-manager'

describe('CsrfManager', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production'
    csrfManager.clearCsrfToken()
  })

  afterEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('requires CSRF token for state-changing requests', () => {
    expect(csrfManager.requiresCsrfToken('POST')).toBe(true)
    expect(csrfManager.requiresCsrfToken('PUT')).toBe(true)
    expect(csrfManager.requiresCsrfToken('PATCH')).toBe(true)
    expect(csrfManager.requiresCsrfToken('DELETE')).toBe(true)
    expect(csrfManager.requiresCsrfToken('GET')).toBe(false)
  })

  it('caches CSRF token for 23 hours', async () => {
    const mockToken = 'test-csrf-token'

    // Mock API response
    vi.spyOn(csrfManager, 'fetchCsrfToken').mockResolvedValue(mockToken)

    // First call fetches from API
    const token1 = await csrfManager.getCsrfToken()
    expect(token1).toBe(mockToken)

    // Second call uses cache
    const token2 = await csrfManager.getCsrfToken()
    expect(token2).toBe(mockToken)
    expect(csrfManager.fetchCsrfToken).toHaveBeenCalledTimes(1)
  })

  it('returns null in development', async () => {
    process.env.NODE_ENV = 'development'

    const token = await csrfManager.getCsrfToken()
    expect(token).toBeNull()
  })
})
```

## 🎭 End-to-End Testing

### E2E Test Structure

```typescript
// tests/e2e/auth/login.spec.ts
import { expect, test } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('successful login', async ({ page }) => {
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'user@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')

    // Submit form
    await page.click('[data-testid="login-button"]')

    // Verify navigation to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('handles token refresh', async ({ page, context }) => {
    // Login first
    await page.fill('[data-testid="email-input"]', 'user@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // Wait for auth
    await page.waitForURL('/dashboard')

    // Check cookies in production mode
    if (process.env.NODE_ENV === 'production') {
      const cookies = await context.cookies()
      const authCookie = cookies.find(c => c.name === 'access_token')
      expect(authCookie?.httpOnly).toBe(true)
      expect(authCookie?.secure).toBe(true)
      expect(authCookie?.sameSite).toBe('Strict')
    }
  })
})
```

### Visual Testing

```typescript
// tests/visual/components.spec.ts
import { expect, test } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('login form appearance', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveScreenshot('login-form.png')
  })

  test('dark mode support', async ({ page }) => {
    await page.goto('/login')

    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    await expect(page).toHaveScreenshot('login-form-dark.png')
  })

  test('RTL layout', async ({ page }) => {
    await page.goto('/login')

    // Switch to Arabic
    await page.click('[data-testid="language-selector"]')
    await page.click('[data-value="ar"]')

    await expect(page).toHaveScreenshot('login-form-rtl.png')
  })
})
```

## 🔧 Test Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/__mocks__/**',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 80,
          statements: 80,
        },
      },
    },
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from '../mocks/server'

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

// Global test utilities
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null
  rootMargin = ''
  thresholds = []
  takeRecords = () => []
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

### MSW Handlers (FSD Structure)

```typescript
// src/mocks/handlers/auth.handlers.ts
import { HttpResponse, http } from 'msw'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as any
    const { email, password } = body

    if (email === 'user@example.com' && password === 'password123') {
      return HttpResponse.json({
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
        },
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      })
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (authHeader === 'Bearer mock-jwt-token') {
      return HttpResponse.json({
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      })
    }

    return new HttpResponse(null, { status: 401 })
  }),

  // CSRF token endpoint for production testing
  http.get('/api/auth/csrf-token', () => {
    return HttpResponse.json({
      token: 'mock-csrf-token',
    })
  }),
]
```

## 📊 Coverage & Quality Metrics

### Coverage Thresholds

Current thresholds from `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    global: {
      branches: 75,    // 75% branch coverage
      functions: 75,   // 75% function coverage
      lines: 80,       // 80% line coverage
      statements: 80,  // 80% statement coverage
    },
  },
}
```

### Quality Gates

1. **Unit Tests**: ≥80% line coverage
2. **FSD Compliance**: Zero violations from Steiger
3. **Type Safety**: Zero TypeScript errors
4. **Linting**: Zero ESLint errors
5. **E2E Tests**: Critical user paths covered

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Check coverage in CI
npm run test:ci
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run steiger
      - run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
```

## 🎯 Best Practices

### FSD Testing Guidelines

1. **Layer Isolation**: Test each layer independently
2. **Public API Testing**: Only test through index.ts exports
3. **Mock Lower Layers**: Mock dependencies from lower layers
4. **No Cross-Layer Imports**: Follow FSD import rules in tests
5. **Colocate Tests**: Keep tests next to source files

### Component Testing Best Practices

1. **User-Centric**: Test from user perspective
2. **Accessibility**: Use accessible queries
3. **Realistic Data**: Use mock factories
4. **Error States**: Test error conditions
5. **Loading States**: Test async behavior

### Store Testing Best Practices

1. **Reset State**: Clear store before each test
2. **Test Actions**: Verify state changes
3. **Test Selectors**: Verify computed values
4. **Mock External Deps**: Mock API calls
5. **Test Side Effects**: Verify async operations

### Security Testing

1. **Token Storage**: Verify correct storage strategy
2. **CSRF Protection**: Test token inclusion
3. **XSS Prevention**: Test input sanitization
4. **Error Messages**: Verify no sensitive data leaks
5. **Authentication Flow**: Test complete auth cycle

---

This comprehensive testing guide ensures high-quality, reliable code across all layers of Radiant UI's Feature-Sliced Design architecture. The testing strategy provides confidence in deployments and enables rapid feature development while maintaining architectural integrity.
