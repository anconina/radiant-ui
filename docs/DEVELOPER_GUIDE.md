# Radiant UI Developer Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Feature-Sliced Design Architecture](#feature-sliced-design-architecture)
3. [Creating Components](#creating-components)
4. [Creating Pages](#creating-pages)
5. [Styling Guidelines](#styling-guidelines)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Internationalization & RTL](#internationalization--rtl)
9. [Testing](#testing)
10. [Security Best Practices](#security-best-practices)
11. [Performance Optimization](#performance-optimization)
12. [Examples](#examples)

## Introduction

Radiant UI is a modern React template built with Feature-Sliced Design (FSD) architecture, TypeScript, Tailwind CSS, and shadcn/ui components. This guide provides comprehensive instructions for extending and building upon the template.

### Tech Stack

- **Framework**: React 19 + TypeScript 5.8
- **Architecture**: Feature-Sliced Design (FSD)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **Routing**: React Router v7
- **State Management**: Zustand
- **Server State**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod
- **Internationalization**: i18next (8 languages)
- **Testing**: Vitest + React Testing Library + Playwright
- **Build Tool**: Vite 7
- **Security**: httpOnly cookies, CSRF protection, CSP headers

## Feature-Sliced Design Architecture

### Layer Hierarchy

FSD organizes code into standardized layers with strict dependency rules:

```
app → pages → widgets → features → entities → shared
```

**Import Rule**: Higher layers can only import from lower layers.

### Directory Structure

```
src/
├── app/                    # Application initialization
│   ├── lib/               # App-specific libraries
│   ├── providers/         # Global providers
│   └── routes/           # Route configuration
│
├── entities/              # Business entities
│   ├── session/          # Session entity
│   └── user/            # User entity
│       ├── api/         # Entity API
│       ├── model/       # Business logic & types
│       ├── ui/          # Entity UI components
│       └── index.ts     # Public API
│
├── features/             # Business features
│   ├── auth/            # Authentication feature
│   │   ├── api/        # Feature API
│   │   ├── lib/        # Feature utilities
│   │   ├── model/      # Stores & hooks
│   │   ├── ui/         # Feature components
│   │   └── index.ts    # Public API
│   └── [feature]/       # Other features
│
├── pages/               # Application pages
│   ├── home/           # Home page
│   │   ├── ui/         # Page components
│   │   └── index.ts    # Public API
│   └── [page]/         # Other pages
│
├── shared/             # Shared resources
│   ├── api/           # API utilities
│   ├── config/        # Configuration
│   ├── contracts/     # TypeScript types
│   ├── lib/           # Utilities
│   ├── providers/     # Shared providers
│   ├── stores/        # Global stores
│   ├── styles/        # Global styles
│   └── ui/            # UI components
│
└── widgets/           # Complex UI blocks
    ├── app-shell/     # Application layout
    └── dashboard/     # Dashboard widgets
```

### Layer Responsibilities

- **App**: Application bootstrap, providers, routing
- **Pages**: Route pages that compose the UI
- **Widgets**: Complex, self-contained UI blocks
- **Features**: User scenarios and business logic
- **Entities**: Business entities and domain logic
- **Shared**: Reusable code without business logic

## Creating Components

### 1. Shared UI Components

Base UI components go in `src/shared/ui/`. These are reusable across the entire application.

```tsx
// src/shared/ui/card-button.tsx
import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

// Define variants using CVA
const cardButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-card hover:bg-accent hover:text-accent-foreground',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface CardButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cardButtonVariants> {
  asChild?: boolean
}

const CardButton = React.forwardRef<HTMLButtonElement, CardButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(cardButtonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
CardButton.displayName = 'CardButton'

export { CardButton, cardButtonVariants }
```

### 2. Entity Components

Entity-specific UI components go in `src/entities/[entity]/ui/`.

```tsx
// src/entities/user/ui/UserAvatar.tsx
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

import type { User } from '../model/types'

interface UserAvatarProps {
  user: Pick<User, 'name' | 'email' | 'avatar'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{initials || 'U'}</AvatarFallback>
    </Avatar>
  )
}
```

### 3. Feature Components

Feature-specific components go in `src/features/[feature]/ui/`.

```tsx
// src/features/auth/ui/LoginForm.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'

import { useAuthStore } from '../model/auth.store'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().default(false),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { t } = useTranslation('auth')
  const { login, isLoading } = useAuthStore()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
    } catch (error) {
      // Error handling is done in the store
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  autoComplete="email"
                  {...field}
                />
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
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('signingIn') : t('signIn')}
        </Button>
      </form>
    </Form>
  )
}
```

### 4. Widget Components

Complex UI blocks go in `src/widgets/[widget]/ui/`.

```tsx
// src/widgets/app-shell/ui/AppSidebar.tsx
import { NavLink } from 'react-router-dom'

import { Home, Settings, Users } from 'lucide-react'

import { UserAvatar } from '@/entities/user'

import { useAuthStore } from '@/features/auth'

import { cn } from '@/shared/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
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

      {user && (
        <div className="flex items-center gap-3 border-t px-4 py-3">
          <UserAvatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Creating Pages

### 1. Page Structure

Pages go in `src/pages/[page]/ui/`.

```tsx
// src/pages/dashboard/ui/DashboardPage.tsx
import { ActivityChart, RecentSales, RevenueChart } from '@/widgets/dashboard'
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
        <StatsCard
          title={t('totalRevenue')}
          value="$45,231.89"
          description="+20.1% from last month"
        />
        <StatsCard title={t('subscriptions')} value="+2350" description="+180.1% from last month" />
        <StatsCard title={t('sales')} value="+12,234" description="+19% from last month" />
        <StatsCard title={t('activeNow')} value="+573" description="+201 since last hour" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart />
        <ActivityChart />
      </div>

      <RecentSales />
    </div>
  )
}
```

### 2. Adding Routes

Add pages to the routing configuration:

```tsx
// src/app/routes/index.tsx
import { Suspense, lazy } from 'react'

import { createBrowserRouter } from 'react-router-dom'

import { Layout } from '@/widgets/app-shell'

import { PageLoader } from '@/shared/ui/loading'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/home').then(m => ({ default: m.HomePage })))
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then(m => ({ default: m.DashboardPage }))
)
const LoginPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.LoginPage })))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
])
```

### 3. Page Public API

Export pages through index files:

```tsx
// src/pages/dashboard/index.ts
export { DashboardPage } from './ui/DashboardPage'
```

## Styling Guidelines

### 1. Tailwind CSS with Logical Properties

Always use logical properties for RTL support:

```tsx
// ✅ Good - logical properties
<div className="ms-4 me-6 ps-2 pe-3">
<div className="border-s-2 border-e">
<div className="start-0 end-4">

// ❌ Bad - physical properties
<div className="ml-4 mr-6 pl-2 pr-3">
<div className="border-l-2 border-r">
<div className="left-0 right-4">
```

### 2. Dark Mode Support

```tsx
// ✅ Good - dark mode support
<div className="bg-white dark:bg-gray-900">
<div className="text-gray-900 dark:text-gray-100">

// Use CSS variables for consistency
<div className="bg-background text-foreground">
```

### 3. Responsive Design

```tsx
// Mobile-first approach
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
<div className="text-sm md:text-base lg:text-lg">
```

## State Management

### 1. Feature Stores (Zustand)

```tsx
// src/features/tasks/model/tasks.store.ts
import type { Task } from '@/entities/task'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { tasksApi } from '../api/tasks.api'

interface TasksState {
  tasks: Task[]
  selectedTask: Task | null
  isLoading: boolean

  // Actions
  fetchTasks: () => Promise<void>
  selectTask: (task: Task | null) => void
  addTask: (task: Omit<Task, 'id'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

export const useTasksStore = create<TasksState>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],
        selectedTask: null,
        isLoading: false,

        fetchTasks: async () => {
          set({ isLoading: true })
          try {
            const tasks = await tasksApi.getAll()
            set({ tasks, isLoading: false })
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        selectTask: task => set({ selectedTask: task }),

        addTask: async taskData => {
          const newTask = await tasksApi.create(taskData)
          set(state => ({
            tasks: [...state.tasks, newTask],
          }))
        },

        updateTask: async (id, updates) => {
          const updatedTask = await tasksApi.update(id, updates)
          set(state => ({
            tasks: state.tasks.map(t => (t.id === id ? updatedTask : t)),
          }))
        },

        deleteTask: async id => {
          await tasksApi.delete(id)
          set(state => ({
            tasks: state.tasks.filter(t => t.id !== id),
          }))
        },
      }),
      {
        name: 'tasks-storage',
        partialize: state => ({ tasks: state.tasks }),
      }
    ),
    {
      name: 'TasksStore',
    }
  )
)
```

### 2. Server State (React Query)

```tsx
// src/features/dashboard/model/use-dashboard-data.ts
import { useQuery } from '@tanstack/react-query'

import { dashboardApi } from '../api/dashboard.api'

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  })
}
```

## API Integration

### 1. API Service with Type Safety

```tsx
// src/features/tasks/api/tasks.api.ts
import { TaskSchema } from '@/entities/task'
import { z } from 'zod'

import { httpClient } from '@/shared/lib/http-client'

const TasksResponseSchema = z.object({
  data: z.array(TaskSchema),
  total: z.number(),
})

export const tasksApi = {
  async getAll(params?: { page?: number; search?: string }) {
    const response = await httpClient.get('/tasks', { params })
    const parsed = TasksResponseSchema.parse(response.data)
    return parsed.data
  },

  async getById(id: string) {
    const response = await httpClient.get(`/tasks/${id}`)
    return TaskSchema.parse(response.data)
  },

  async create(data: Omit<Task, 'id'>) {
    const response = await httpClient.post('/tasks', data)
    return TaskSchema.parse(response.data)
  },

  async update(id: string, data: Partial<Task>) {
    const response = await httpClient.patch(`/tasks/${id}`, data)
    return TaskSchema.parse(response.data)
  },

  async delete(id: string) {
    await httpClient.delete(`/tasks/${id}`)
  },
}
```

### 2. HTTP Client Configuration

The HTTP client is pre-configured with:

- Automatic token injection
- CSRF protection
- Request/response interceptors
- Error handling

## Internationalization & RTL

### 1. Using Translations

```tsx
import { useTranslation } from 'react-i18next'

export function MyComponent() {
  const { t } = useTranslation('common')

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('description', { name: 'John' })}</p>
    </div>
  )
}
```

### 2. RTL Support

All components automatically support RTL through:

- Logical CSS properties
- DirectionProvider
- Automatic text alignment

```tsx
// Use DirectionalIcon for direction-aware icons
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { DirectionalIcon } from '@/shared/ui/rtl'

;<DirectionalIcon ltrIcon={ChevronRight} rtlIcon={ChevronLeft} />
```

## Testing

### 1. Component Tests

```tsx
// src/shared/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 2. Store Tests

```tsx
// src/features/auth/model/__tests__/auth.store.test.ts
import { act, renderHook } from '@testing-library/react'

import { useAuthStore } from '../auth.store'

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeDefined()
  })
})
```

## Security Best Practices

### 1. Token Management

The app uses secure token storage with different strategies:

- **Development**: localStorage for convenience
- **Production**: httpOnly cookies for security

### 2. Input Validation

Always validate user input with Zod:

```tsx
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().min(0).max(150),
})
```

### 3. XSS Prevention

- Use React's built-in XSS protection
- Avoid `dangerouslySetInnerHTML`
- Sanitize user content when necessary

### 4. CSRF Protection

The app automatically includes CSRF tokens in state-changing requests when using httpOnly cookies in production.

## Performance Optimization

### 1. Code Splitting

Pages are automatically code-split using dynamic imports:

```tsx
const DashboardPage = lazy(() => import('@/pages/dashboard'))
```

### 2. Component Memoization

```tsx
import { memo } from 'react'

export const ExpensiveComponent = memo(
  ({ data }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id
  }
)
```

### 3. Query Optimization

```tsx
// Use React Query for intelligent caching
const { data } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => fetchUsers(filters),
  staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
})
```

### 4. Bundle Optimization

The build is optimized with:

- Vendor chunk splitting
- Tree shaking
- Minification
- Compression (gzip/brotli)

## Examples

### Complete Feature Example

Here's a complete example of a "Tasks" feature following FSD:

```tsx
// src/entities/task/model/types.ts
import type { Task } from '@/entities/task'
import { z } from 'zod'

import { cn } from '@/shared/lib/utils'
// src/features/tasks/ui/TaskItem.tsx
import { Checkbox } from '@/shared/ui/checkbox'

import { useTasksStore } from '../model/tasks.store'

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Task = z.infer<typeof TaskSchema>

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask } = useTasksStore()

  const handleToggle = () => {
    updateTask(task.id, { completed: !task.completed })
  }

  return (
    <div className="flex items-center space-x-3 p-4 hover:bg-accent rounded-lg">
      <Checkbox checked={task.completed} onCheckedChange={handleToggle} />
      <div className="flex-1">
        <h3 className={cn('font-medium', task.completed && 'line-through text-muted-foreground')}>
          {task.title}
        </h3>
        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
      </div>
    </div>
  )
}

// src/features/tasks/index.ts
export { TaskItem } from './ui/TaskItem'
export { TaskList } from './ui/TaskList'
export { useTasksStore } from './model/tasks.store'
```

## Conclusion

This guide covers the essential aspects of developing with Radiant UI using Feature-Sliced Design. Key takeaways:

1. **Follow FSD layers**: Respect the import hierarchy
2. **Use TypeScript**: Leverage type safety throughout
3. **Support RTL**: Use logical properties consistently
4. **Write tests**: Maintain high code quality
5. **Optimize performance**: Use lazy loading and memoization
6. **Ensure security**: Validate inputs and use secure token storage

For more examples, explore the existing code in the repository. Happy coding!
