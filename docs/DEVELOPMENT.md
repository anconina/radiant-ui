# Radiant UI Development Guide

## Overview

This guide provides comprehensive information about the development workflow, tools, and practices used in Radiant UI. It covers everything from initial setup to deployment.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **VS Code**: Recommended IDE

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/radiant-ui.git
cd radiant-ui

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

### First-Time Configuration

```bash
# Set up Git hooks
npm run prepare

# Verify setup
npm run lint
npm run typecheck
npm run test
```

## 🛠️ Development Environment

### Required VS Code Extensions

Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "vitest.explorer",
    "ms-vscode.vscode-json"
  ]
}
```

### VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## 📋 Development Scripts

### Core Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build with optimizations and analysis
npm run build:prod
npm run build:analyze

# Preview production build
npm run preview
```

### Code Quality

```bash
# Lint code
npm run lint
npm run lint:fix

# Type checking
npm run typecheck

# Format code
npm run format
npm run format:check
```

### Testing Workflow

```bash
# Development testing
npm run test              # Watch mode
npm run test:ui           # UI interface

# Comprehensive testing
npm run test:unit         # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # E2E tests
npm run test:all          # All tests

# Coverage reporting
npm run test:coverage
npm run test:integration:coverage
```

## 🏗️ Development Workflow

### Feature Development Process (FSD)

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Set Up Feature Structure (FSD Layers)**

   ```bash
   # For a new feature
   mkdir -p src/features/new-feature/{api,lib,model,ui}
   touch src/features/new-feature/index.ts

   # For a new entity
   mkdir -p src/entities/new-entity/{api,model,ui}
   touch src/entities/new-entity/index.ts

   # For a new page
   mkdir -p src/pages/new-page/ui
   touch src/pages/new-page/index.ts
   ```

3. **Write Tests First**

   ```bash
   # Create test files following FSD structure
   touch src/features/new-feature/model/__tests__/new-feature.store.test.ts
   touch src/features/new-feature/ui/__tests__/NewFeatureForm.test.tsx
   npm run test:watch
   ```

4. **Implement Following FSD Layers**

   ```tsx
   // Follow FSD layer hierarchy
   // app → pages → widgets → features → entities → shared
   // Export through index.ts public API
   ```

5. **Verify Quality**

   ```bash
   npm run lint
   npm run typecheck
   npm run test:coverage
   npm run steiger  # FSD compliance check
   ```

6. **Commit Changes**
   ```bash
   npm run commit  # Uses Commitizen
   ```

### Daily Development Routine

```bash
# Morning setup
git pull origin main
npm install  # If package.json changed
npm run dev

# During development
npm run test:watch  # In separate terminal
npm run lint:fix    # As needed
npm run steiger    # Check FSD compliance

# Before committing
npm run test:all
npm run typecheck
npm run build
npm run commit
```

## 📁 Project Structure Deep Dive (FSD Architecture)

### Feature-Sliced Design Layers

```
src/
├── app/                    # Application initialization layer
│   ├── lib/               # App-specific libraries
│   ├── providers/         # Global providers (theme, auth, etc.)
│   └── routes/           # Route configuration
│
├── pages/                 # Route pages layer
│   ├── home/
│   │   ├── ui/           # Page components
│   │   └── index.ts      # Public API
│   ├── dashboard/
│   └── [page]/
│
├── widgets/              # Complex UI blocks layer
│   ├── app-shell/        # Application layout
│   │   ├── ui/          # Widget components
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── index.ts
│   └── dashboard/        # Dashboard widgets
│
├── features/             # Business features layer
│   ├── auth/            # Authentication feature
│   │   ├── api/        # Feature API
│   │   ├── lib/        # Feature utilities
│   │   ├── model/      # Stores & business logic
│   │   ├── ui/         # Feature components
│   │   └── index.ts    # Public API
│   └── [feature]/
│
├── entities/            # Business entities layer
│   ├── session/        # Session entity
│   └── user/          # User entity
│       ├── api/       # Entity API
│       ├── model/     # Types & logic
│       ├── ui/        # Entity UI
│       └── index.ts
│
└── shared/             # Shared resources layer
    ├── api/           # API utilities
    ├── config/        # App configuration
    ├── contracts/     # TypeScript types
    ├── lib/           # Utilities
    │   ├── auth/     # Auth utilities
    │   ├── http-client/
    │   └── utils/
    ├── providers/     # Shared providers
    ├── stores/        # Global stores
    ├── styles/        # Global styles
    └── ui/            # UI components
```

### FSD Import Rules

```typescript
// ✅ Correct: Higher layers import from lower layers
// In src/pages/dashboard/ui/DashboardPage.tsx
import { UserAvatar } from '@/entities/user'

// ❌ Wrong: Lower layers importing from higher layers
// In src/shared/ui/button.tsx
import { AuthForm } from '@/features/auth'
// ❌ Shared can't import from features

// ✅ Correct: Same layer imports through public API
// In src/features/tasks/ui/TaskList.tsx
import { useAuthStore } from '@/features/auth'
import { StatsCard } from '@/features/dashboard'

import { Button } from '@/shared/ui/button'

// ✅ Via index.ts public API
```

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices

```tsx
// Use utility classes
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">

// Use logical properties for RTL support
<div className="ms-4 me-2 ps-6 pe-3">  // ✅ Good
<div className="ml-4 mr-2 pl-6 pr-3">  // ❌ Avoid

// Use cn() utility for conditional classes
import { cn } from '@/shared/lib/utils/cn'

<button className={cn(
  'px-4 py-2 rounded-md font-medium',
  variant === 'primary' && 'bg-blue-600 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

### Component Variant Patterns

```tsx
// Use CVA for component variants
import { type VariantProps, cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

## 🔧 TypeScript Guidelines

### Type Organization (FSD Layers)

```typescript
// Feature types (src/features/auth/model/types.ts)
import type { User } from '@/entities/user'

// Entity types (src/entities/user/model/types.ts)
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// Shared contracts (src/shared/contracts/api.ts)
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Shared contracts (src/shared/contracts/common.ts)
export type Theme = 'light' | 'dark' | 'system'
export type Direction = 'ltr' | 'rtl'
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ar' | 'he'
```

### Component Props Patterns (FSD Layers)

```typescript
// Shared UI component props (src/shared/ui/)
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Entity UI component props (src/entities/user/ui/)
interface UserAvatarProps {
  user: Pick<User, 'name' | 'email' | 'avatar'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Feature UI component props (src/features/auth/ui/)
interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

// Widget UI component props (src/widgets/app-shell/ui/)
interface AppSidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

// Page component props (src/pages/dashboard/ui/)
interface DashboardPageProps {
  // Pages typically don't have props, they compose other layers
}
```

### Hook Type Patterns

```typescript
// Custom hook with generic return type
export function useApi<T>(url: string): {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
} {
  // Implementation
}

// Hook with configuration options
interface UseAuthOptions {
  redirectTo?: string
  required?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
  // Implementation
}
```

## 🗃️ State Management Patterns

### Zustand Store Patterns (FSD Layers)

```typescript
// Feature store (src/features/auth/model/auth.store.ts)
import type { User } from '@/entities/user'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { tokenManager } from '@/shared/lib/auth/token-manager'

import { authApi } from '../api/auth.api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer(set => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async credentials => {
          set(state => {
            state.isLoading = true
            state.error = null
          })

          try {
            const { user, accessToken, refreshToken } = await authApi.login(credentials)

            // Store tokens securely
            await tokenManager.setTokens({ accessToken, refreshToken })

            set(state => {
              state.user = user
              state.isAuthenticated = true
              state.isLoading = false
            })
          } catch (error) {
            set(state => {
              state.error = error instanceof Error ? error.message : 'Login failed'
              state.isLoading = false
            })
            throw error
          }
        },

        logout: async () => {
          try {
            await authApi.logout()
          } finally {
            await tokenManager.clearTokens()
            set(state => {
              state.user = null
              state.isAuthenticated = false
            })
          }
        },

        checkAuth: async () => {
          const token = await tokenManager.getAccessToken()
          if (!token) {
            set(state => {
              state.isAuthenticated = false
            })
            return
          }

          try {
            const user = await authApi.getCurrentUser()
            set(state => {
              state.user = user
              state.isAuthenticated = true
            })
          } catch {
            set(state => {
              state.isAuthenticated = false
            })
          }
        },

        clearError: () =>
          set(state => {
            state.error = null
          }),
      })),
      {
        name: 'auth-storage',
        partialize: state => ({ user: state.user }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
)

// Global store (src/shared/stores/theme.store.ts)
export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      theme: 'system',
      setTheme: theme => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
```

### React Query Patterns (FSD Layers)

```typescript
// Feature query hooks (src/features/users/model/queries.ts)
import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { userApi } from '@/entities/user'

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Feature mutation hooks (src/features/profile/model/mutations.ts)
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profile.api'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['user', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Update auth store if current user
      const { user, setUser } = useAuthStore.getState()
      if (user?.id === data.id) {
        setUser(data)
      }
    },
  })
}

// Widget query hooks (src/widgets/user-list/model/queries.ts)
export function useUsersList(filters?: UserFilters) {
  return useInfiniteQuery({
    queryKey: ['users', filters],
    queryFn: ({ pageParam = 1 }) => userApi.getList({
      page: pageParam,
      ...filters
    }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  })
}
```

## 🧪 Testing Patterns (FSD Layers)

### Test Organization by Layer

```typescript
// Shared UI component test (src/shared/ui/__tests__/button.test.tsx)
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })
})

// Entity component test (src/entities/user/ui/__tests__/UserAvatar.test.tsx)
import { render, screen } from '@testing-library/react'
import { UserAvatar } from '../UserAvatar'
import { mockUser } from '../../model/__mocks__/user.mock'

describe('UserAvatar', () => {
  it('displays user initials when no avatar', () => {
    render(<UserAvatar user={{ ...mockUser, avatar: undefined }} />)
    expect(screen.getByText('TU')).toBeInTheDocument()
  })
})

// Feature component test (src/features/auth/ui/__tests__/LoginForm.test.tsx)
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { useAuthStore } from '../../model/auth.store'

vi.mock('../../model/auth.store')

describe('LoginForm', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    })
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })
    })
  })
})
```

### Mock Patterns (FSD Layers)

```typescript
// Mock feature store (src/features/auth/model/__tests__/auth.store.test.ts)
import { act, renderHook } from '@testing-library/react'

import { useAuthStore } from '../auth.store'

// Mock entity data (src/entities/user/model/__mocks__/user.mock.ts)
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockLogin = vi.fn()
vi.mock('../api/auth.api', () => ({
  authApi: {
    login: mockLogin,
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

// Mock shared utilities
vi.mock('@/shared/lib/auth/token-manager', () => ({
  tokenManager: {
    setTokens: vi.fn(),
    getAccessToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}))
```

## 🚀 Performance Optimization

### Code Splitting Patterns

```typescript
// Route-based code splitting (FSD pages)
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then(m => ({ default: m.DashboardPage }))
)
const ProfilePage = lazy(() => import('@/pages/profile').then(m => ({ default: m.ProfilePage })))

// Widget-based code splitting
const DashboardWidget = lazy(() =>
  import('@/widgets/dashboard').then(m => ({ default: m.DashboardWidget }))
)

// Feature component code splitting
const ComplexFeatureModal = lazy(() =>
  import('@/features/reports').then(m => ({ default: m.ReportsModal }))
)
```

### Memoization Patterns

```typescript
// Component memoization
export const ExpensiveComponent = memo(({ data, onSelect }: Props) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id
})

// Hook memoization
export function useProcessedData(rawData: RawData[]) {
  return useMemo(() => {
    return rawData.map(item => ({
      ...item,
      processed: expensiveProcessing(item),
    }))
  }, [rawData])
}

// Callback memoization
export function ParentComponent({ items }: Props) {
  const handleItemSelect = useCallback((item: Item) => {
    // Handle selection
  }, [])

  return (
    <ItemList items={items} onItemSelect={handleItemSelect} />
  )
}
```

## 🔄 Git Workflow

### Branch Naming Convention

```bash
feature/auth-improvements      # New features
bugfix/login-validation       # Bug fixes
hotfix/security-patch         # Critical fixes
refactor/component-structure  # Code refactoring
docs/api-documentation        # Documentation updates
```

### Commit Message Convention

```bash
# Use Commitizen for consistent commits
npm run commit

# Commit message format
feat: add user authentication
fix: resolve login validation issue
docs: update API documentation
refactor: improve component structure
test: add integration tests
chore: update dependencies
```

### Pull Request Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes with Tests**

   ```bash
   # Implement feature
   # Write tests
   # Update documentation
   ```

3. **Quality Checks**

   ```bash
   npm run lint
   npm run typecheck
   npm run test:all
   npm run build
   ```

4. **Create Pull Request**
   - Descriptive title and description
   - Link related issues
   - Include screenshots for UI changes
   - Request appropriate reviewers

5. **Code Review Process**
   - Address feedback
   - Update tests as needed
   - Ensure CI passes

## 🚀 Deployment Process

### Environment Setup

```bash
# Development
npm run dev

# Staging build
npm run build
npm run preview

# Production build
npm run build:prod

# FSD compliance check
npm run steiger
```

### Platform Deployment

```bash
# Vercel
npm run deploy:vercel

# Netlify
npm run deploy:netlify

# AWS
npm run deploy:aws

# Cloudflare
npm run deploy:cloudflare
```

### Environment Variables

```env
# .env.local (development)
VITE_API_URL=http://localhost:3000
VITE_ENABLE_MSW=true
VITE_ENABLE_ANALYTICS=false

# .env.production
VITE_API_URL=https://api.production.com
VITE_ENABLE_MSW=false
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

## 🛡️ Security Guidelines

### Environment Security

```typescript
// Validate environment variables
const requiredEnvVars = ['VITE_API_URL'] as const

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Type-safe environment access
export const env = {
  API_URL: import.meta.env.VITE_API_URL!,
  ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW === 'true',
} as const
```

### Input Validation

```typescript
// Use Zod for schema validation
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// API request validation
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
})

export type CreateUserRequest = z.infer<typeof createUserSchema>
```

## 📊 Monitoring & Analytics

### Error Monitoring

```typescript
// Sentry configuration
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})

// Error boundary integration
export const SentryErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: ErrorFallback,
})
```

### Performance Monitoring

```typescript
// Core Web Vitals tracking
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals'

// Performance tracking
export function trackPerformance(metricName: string, value: number) {
  // Send to analytics service
  analytics.track('performance', {
    metric: metricName,
    value,
    timestamp: Date.now(),
  })
}

getCLS(trackPerformance)
getFID(trackPerformance)
getFCP(trackPerformance)
getLCP(trackPerformance)
getTTFB(trackPerformance)
```

## 🎯 Best Practices Summary

### FSD Architecture

1. **Follow layer hierarchy** - app → pages → widgets → features → entities → shared
2. **Use public APIs** - Export through index.ts files only
3. **No cross-imports** - Never import across same layer except through public API
4. **Check with Steiger** - Run `npm run steiger` to verify FSD compliance
5. **Colocate tests** - Keep tests next to the code they test

### Code Quality

1. **Use TypeScript strictly** - Enable strict mode and fix all type errors
2. **Write tests first** - TDD approach for new features
3. **Follow ESLint rules** - Maintain consistent code style
4. **Document complex logic** - Add comments for non-obvious code
5. **Use meaningful names** - Clear, descriptive variable and function names

### Performance

1. **Lazy load components** - Use React.lazy for route-based splitting
2. **Memoize expensive operations** - Use useMemo and useCallback appropriately
3. **Optimize bundle size** - Monitor and optimize JavaScript bundles
4. **Use React Query** - Efficient server state management
5. **Implement proper loading states** - Better user experience

### Accessibility

1. **Use semantic HTML** - Proper HTML elements for screen readers
2. **Include ARIA labels** - Accessibility attributes where needed
3. **Test with keyboard navigation** - Ensure full keyboard accessibility
4. **Maintain color contrast** - Meet WCAG guidelines
5. **Test with screen readers** - Verify compatibility

### Security

1. **Validate all inputs** - Use Zod schemas for validation
2. **Sanitize user content** - Prevent XSS attacks
3. **Use HTTPS everywhere** - Secure all communications
4. **Implement CSP headers** - Content Security Policy protection
5. **Regular security audits** - Monitor dependencies for vulnerabilities

---

This development guide provides a comprehensive foundation for building features in Radiant UI while maintaining high quality, performance, and security standards.
