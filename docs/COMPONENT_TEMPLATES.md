# Component Templates - Feature-Sliced Design

Copy these templates when creating new components following Feature-Sliced Design (FSD) architecture.

## 🎯 FSD Architecture Overview

Components are organized by layers:

- **shared/ui** - Reusable UI components (buttons, inputs, etc.)
- **entities/\*/ui** - Entity-specific components
- **features/\*/ui** - Feature-specific components
- **widgets/\*/ui** - Complex UI blocks
- **pages/\*/ui** - Page components

## 📦 Shared UI Components

### Basic UI Component

```tsx
// src/shared/ui/[component-name].tsx
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add custom props here
}

export function ComponentName({ className, children, ...props }: ComponentNameProps) {
  return (
    <div
      className={cn(
        // Base styles here
        '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

ComponentName.displayName = 'ComponentName'
```

### UI Component with Variants (CVA)

```tsx
// src/shared/ui/[component-name].tsx
import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const componentVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Add custom props here
}

export function ComponentName({ className, variant, size, ...props }: ComponentNameProps) {
  return <div className={cn(componentVariants({ variant, size, className }))} {...props} />
}

ComponentName.displayName = 'ComponentName'
```

### Forwardref Component

```tsx
// src/shared/ui/[component-name].tsx
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add custom props here
}

export const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />
  }
)

ComponentName.displayName = 'ComponentName'
```

### Component with Radix UI

```tsx
// src/shared/ui/switch.tsx
import * as React from 'react'

import * as SwitchPrimitives from '@radix-ui/react-switch'

import { cn } from '@/shared/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
        'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

## 🏢 Entity Components

### Entity UI Component

```tsx
// src/entities/user/ui/UserCard.tsx
import { User } from '@/entities/user'

import { Avatar } from '@/shared/ui/avatar'
import { Card, CardContent } from '@/shared/ui/card'

interface UserCardProps {
  user: User
  onClick?: () => void
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 🎨 Feature Components

### Feature Component with Store

```tsx
// src/features/auth/ui/LoginForm.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useAuthStore } from '@/features/auth'

import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login, isLoading } = useAuthStore()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    await login(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  )
}
```

### Feature Component with API Hook

```tsx
// src/features/dashboard/ui/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { useDashboardData } from '../model/use-dashboard-data'

export function StatsCard() {
  const { data, isLoading, error } = useDashboardData()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[100px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[60px]" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-destructive">Failed to load stats</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${data?.revenue.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
  )
}
```

## 🧩 Widget Components

### Complex Widget Component

```tsx
// src/widgets/app-shell/ui/AppSidebar.tsx
import { NavLink } from 'react-router-dom'

import { Home, Settings, Users } from 'lucide-react'

import { useAuthStore } from '@/features/auth'

import { cn } from '@/shared/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const { user } = useAuthStore()

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-14 items-center px-4 border-b">
        <h1 className="text-lg font-semibold">Radiant UI</h1>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map(item => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t px-4 py-3">
        <Avatar>
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  )
}
```

## 📄 Page Components

### Basic Page Component

```tsx
// src/pages/home/ui/HomePage.tsx
import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth'

import { Button } from '@/shared/ui/button'

export function HomePage() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold">Welcome to Radiant UI</h1>
        <p className="text-muted-foreground">
          A modern React application template with best practices
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/register">Sign Up</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Page with Layout

```tsx
// src/pages/dashboard/ui/DashboardPage.tsx
import { ActivityChart, RecentSales } from '@/widgets/dashboard'
import { useTranslation } from 'react-i18next'

import { StatsCard } from '@/features/dashboard'

export function DashboardPage() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard />
        <StatsCard />
        <StatsCard />
        <StatsCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityChart />
        <RecentSales />
      </div>
    </div>
  )
}
```

## 🪝 Hook Templates

### Feature Hook

```tsx
// src/features/[feature]/model/use-[feature]-data.ts
import { useQuery } from '@tanstack/react-query'

import { api } from '../api'

export function useFeatureData(params?: { filter?: string }) {
  return useQuery({
    queryKey: ['feature-data', params],
    queryFn: () => api.getData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Shared Hook

```tsx
// src/shared/lib/hooks/use-debounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

## 🏪 Store Templates

### Feature Store (Zustand)

```tsx
// src/features/auth/model/auth.store.ts
import type { User } from '@/entities/user'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { authApi } from '../api/auth.api'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        login: async credentials => {
          set(state => {
            state.isLoading = true
          })

          try {
            const { user, token } = await authApi.login(credentials)

            set(state => {
              state.user = user
              state.isAuthenticated = true
              state.isLoading = false
            })

            // Store token
            localStorage.setItem('auth_token', token)
          } catch (error) {
            set(state => {
              state.isLoading = false
            })
            throw error
          }
        },

        logout: async () => {
          await authApi.logout()

          set(state => {
            state.user = null
            state.isAuthenticated = false
          })

          localStorage.removeItem('auth_token')
        },

        checkAuth: async () => {
          const token = localStorage.getItem('auth_token')
          if (!token) return

          try {
            const user = await authApi.me()
            set(state => {
              state.user = user
              state.isAuthenticated = true
            })
          } catch {
            get().logout()
          }
        },
      })),
      {
        name: 'auth-storage',
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
)
```

## 🌐 API Templates

### Feature API Service

```tsx
// src/features/auth/api/auth.api.ts
import { UserSchema } from '@/entities/user'
import { z } from 'zod'

import { httpClient } from '@/shared/lib/http-client'

// Schemas
const LoginResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
})

// Types
export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponse = z.infer<typeof LoginResponseSchema>

// API service
export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await httpClient.post('/auth/login', credentials)
    return LoginResponseSchema.parse(response.data)
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  },

  async me() {
    const response = await httpClient.get('/auth/me')
    return UserSchema.parse(response.data)
  },

  async register(data: RegisterData) {
    const response = await httpClient.post('/auth/register', data)
    return LoginResponseSchema.parse(response.data)
  },
}
```

### Entity API Service

```tsx
// src/entities/user/api/user.api.ts
import { z } from 'zod'

import { httpClient } from '@/shared/lib/http-client'

import { UserSchema } from '../model/types'

// Response schemas
const UsersResponseSchema = z.object({
  data: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

// API service
export const userApi = {
  async getAll(params?: { page?: number; search?: string }) {
    const response = await httpClient.get('/users', { params })
    return UsersResponseSchema.parse(response.data)
  },

  async getById(id: string) {
    const response = await httpClient.get(`/users/${id}`)
    return UserSchema.parse(response.data)
  },

  async update(id: string, data: Partial<User>) {
    const response = await httpClient.patch(`/users/${id}`, data)
    return UserSchema.parse(response.data)
  },
}
```

## 🧪 Test Templates

### Component Test

```tsx
// src/shared/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '../button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="default">Button</Button>)

    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<Button variant="destructive">Button</Button>)

    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })
})
```

### Store Test

```tsx
// src/features/auth/model/__tests__/auth.store.test.ts
import { act, renderHook } from '@testing-library/react'

import { useAuthStore } from '../auth.store'

// Mock API
vi.mock('../../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}))

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('logs in user successfully', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' }
    const mockToken = 'mock-token'

    vi.mocked(authApi.login).mockResolvedValue({
      user: mockUser,
      token: mockToken,
    })

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.login({
        email: 'john@example.com',
        password: 'password',
      })
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(localStorage.getItem('auth_token')).toBe(mockToken)
  })
})
```

## 📝 Index File Templates

### Feature Public API

```tsx
// src/features/auth/index.ts
// UI components
export { LoginForm } from './ui/LoginForm'
export { RegisterForm } from './ui/RegisterForm'
export { RequireAuth } from './ui/RequireAuth'

// Model
export { useAuthStore } from './model/auth.store'
export { useAuth } from './model/use-auth'

// Types
export type { AuthState } from './model/auth.store'
```

### Entity Public API

```tsx
// src/entities/user/index.ts
// UI components
export { UserAvatar } from './ui/UserAvatar'
export { UserCard } from './ui/UserCard'

// API
export { userApi } from './api/user.api'

// Types
export type { User } from './model/types'
export { UserSchema } from './model/types'
```

## 🎯 Best Practices

1. **Layer Isolation**: Components can only import from lower layers
2. **Public API**: Always export through index.ts files
3. **Type Safety**: Use TypeScript and Zod for runtime validation
4. **Consistent Naming**: Follow FSD naming conventions
5. **Co-location**: Keep tests next to the code they test
6. **Reusability**: Shared components should be generic and configurable

## 📚 Resources

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Project Architecture Guide](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
