# Radiant UI Quick Reference

## Common Commands

```bash
# Development
npm run dev                 # Start development server (Vite)
npm run build              # Build for production
npm run build:prod         # Production build with optimization
npm run build:analyze      # Build with bundle analysis
npm run preview            # Preview production build

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run typecheck          # Run TypeScript type checking
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting
npm run steiger            # Check FSD architecture compliance

# Testing
npm run test               # Run tests in watch mode
npm run test:ui            # Run tests with UI interface
npm run test:unit          # Run unit tests once
npm run test:coverage      # Run tests with coverage
npm run test:e2e           # Run Playwright E2E tests
npm run test:all           # Run all tests

# Git Helpers
npm run commit             # Commitizen for conventional commits
npm run prepare            # Setup git hooks
```

## FSD Architecture Quick Guide

### Layer Hierarchy

```
app → pages → widgets → features → entities → shared
```

### Import Rules

- ✅ Higher layers can import from lower layers
- ❌ Lower layers cannot import from higher layers
- ✅ Same layer imports only through public API (index.ts)

## File Creation Cheat Sheet

### Create a New Shared UI Component

1. Create file: `src/shared/ui/[component-name].tsx`
2. Use this template:

```tsx
import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'default-classes',
      secondary: 'secondary-classes',
    },
    size: {
      default: 'h-10 px-4',
      sm: 'h-8 px-3',
      lg: 'h-12 px-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(componentVariants({ variant, size, className }))} {...props} />
    )
  }
)
ComponentName.displayName = 'ComponentName'

export { ComponentName }
```

### Create a New Feature

1. Create feature structure:

```bash
mkdir -p src/features/my-feature/{api,lib,model,ui}
touch src/features/my-feature/index.ts
```

2. Feature component template (`src/features/my-feature/ui/MyFeatureComponent.tsx`):

```tsx
import { Button } from '@/shared/ui/button'

import { useMyFeatureStore } from '../model/my-feature.store'

export function MyFeatureComponent() {
  const { data, loading, fetchData } = useMyFeatureStore()

  if (loading) return <div>Loading...</div>

  return <div>{/* Component content */}</div>
}
```

3. Feature store template (`src/features/my-feature/model/my-feature.store.ts`):

```tsx
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface MyFeatureState {
  data: any[]
  loading: boolean
  error: string | null
}

interface MyFeatureActions {
  fetchData: () => Promise<void>
  setData: (data: any[]) => void
  clearError: () => void
}

export const useMyFeatureStore = create<MyFeatureState & MyFeatureActions>()(
  devtools(
    persist(
      set => ({
        data: [],
        loading: false,
        error: null,

        fetchData: async () => {
          set({ loading: true, error: null })
          try {
            // Fetch data
            set({ data: [], loading: false })
          } catch (error) {
            set({ error: error.message, loading: false })
          }
        },

        setData: data => set({ data }),
        clearError: () => set({ error: null }),
      }),
      { name: 'my-feature-storage' }
    )
  )
)
```

4. Public API (`src/features/my-feature/index.ts`):

```tsx
export * from './ui/MyFeatureComponent'
export { useMyFeatureStore } from './model/my-feature.store'
```

### Create a New Page

1. Create page structure:

```bash
mkdir -p src/pages/my-page/ui
touch src/pages/my-page/index.ts
```

2. Page template (`src/pages/my-page/ui/MyPage.tsx`):

```tsx
import { useTranslation } from 'react-i18next'

import { MyFeatureComponent } from '@/features/my-feature'

import { Card } from '@/shared/ui/card'

export function MyPage() {
  const { t } = useTranslation('my-page')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Card>
        <MyFeatureComponent />
      </Card>
    </div>
  )
}
```

3. Public API (`src/pages/my-page/index.ts`):

```tsx
export { MyPage } from './ui/MyPage'
```

4. Add route in `src/app/routes/index.tsx`:

```tsx
const MyPage = lazy(() => import('@/pages/my-page').then(m => ({ default: m.MyPage })))

// In router config:
{
  path: 'my-page',
  element: (
    <Suspense fallback={<PageLoader />}>
      <MyPage />
    </Suspense>
  ),
}
```

### Create a New Widget

1. Create widget structure:

```bash
mkdir -p src/widgets/my-widget/ui
touch src/widgets/my-widget/index.ts
```

2. Widget template (`src/widgets/my-widget/ui/MyWidget.tsx`):

```tsx
import { FeatureA } from '@/features/feature-a'
import { FeatureB } from '@/features/feature-b'

import { Card } from '@/shared/ui/card'

export function MyWidget() {
  return (
    <Card className="p-6">
      <div className="grid gap-4">
        <FeatureA />
        <FeatureB />
      </div>
    </Card>
  )
}
```

## Import Aliases

```typescript
@/app          → src/app          # App layer
@/pages        → src/pages        # Pages layer
@/widgets      → src/widgets      # Widgets layer
@/features     → src/features     # Features layer
@/entities     → src/entities     # Entities layer
@/shared       → src/shared       # Shared layer
```

## Styling Quick Reference

### Logical Properties (RTL-Safe)

```tsx
// ✅ Use logical properties for RTL support
ms-*  → margin-inline-start   (instead of ml-*)
me-*  → margin-inline-end     (instead of mr-*)
ps-*  → padding-inline-start  (instead of pl-*)
pe-*  → padding-inline-end    (instead of pr-*)
start-*  → inset-inline-start (instead of left-*)
end-*    → inset-inline-end   (instead of right-*)
border-s-*  → border-inline-start  (instead of border-l-*)
border-e-*  → border-inline-end    (instead of border-r-*)
rounded-s-*  → start radius  (instead of rounded-l-*)
rounded-e-*  → end radius    (instead of rounded-r-*)

// ❌ Avoid physical properties
ml-*, mr-*, pl-*, pr-*, left-*, right-*, border-l-*, border-r-*
```

### Common Utility Classes

```tsx
// Spacing
space-y-*     → Vertical spacing between children
space-x-*     → Horizontal spacing (use with RTL consideration)
gap-*         → Grid/flex gap

// Typography
text-xs       → 12px
text-sm       → 14px
text-base     → 16px
text-lg       → 18px
text-xl       → 20px
text-2xl      → 24px
text-3xl      → 30px

// Semantic Colors
text-muted-foreground    → Muted text
bg-muted                 → Muted background
border                   → Default border
bg-destructive          → Error/danger background
text-primary            → Primary color text
bg-primary              → Primary color background
```

## Component Patterns

### Form with Validation (FSD)

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof formSchema>

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const onSubmit = async (values: FormData) => {
    try {
      // Handle form submission
      console.log(values)
    } catch (error) {
      // Handle error
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Using React Query (Feature Layer)

```tsx
// src/features/users/model/queries.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { userApi } from '@/entities/user'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

### Data Table Pattern

```tsx
import type { User } from '@/entities/user'

import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

interface DataTableProps {
  data: User[]
  onEdit: (user: User) => void
}

export function DataTable({ data, onEdit }: DataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-end">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell className="text-end">
              <Button size="sm" onClick={() => onEdit(item)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

## API Integration

### Using HTTP Client (FSD)

```tsx
// Entity API (src/entities/user/api/user.api.ts)
import { z } from 'zod'

import { httpClient } from '@/shared/lib/http-client'

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>

export const userApi = {
  async getAll() {
    const response = await httpClient.get('/users')
    return z.array(UserSchema).parse(response.data)
  },

  async getById(id: string) {
    const response = await httpClient.get(`/users/${id}`)
    return UserSchema.parse(response.data)
  },

  async create(data: Omit<User, 'id'>) {
    const response = await httpClient.post('/users', data)
    return UserSchema.parse(response.data)
  },

  async update(id: string, data: Partial<User>) {
    const response = await httpClient.patch(`/users/${id}`, data)
    return UserSchema.parse(response.data)
  },

  async delete(id: string) {
    await httpClient.delete(`/users/${id}`)
  },
}
```

## Common Hooks (FSD Locations)

```tsx
// Authentication (feature)
import { useAuthStore } from '@/features/auth'

// Media queries (shared)
import { useMediaQuery } from '@/shared/lib/hooks/use-media-query'
// Theme (shared)
import { useTheme } from '@/shared/lib/hooks/use-theme'

// Examples:
const { user, isAuthenticated, login, logout } = useAuthStore()
const { theme, setTheme } = useTheme()
const isMobile = useMediaQuery('(max-width: 768px)')
```

## Testing Patterns (FSD)

### Component Test

```tsx
// src/shared/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '../button'

describe('Button', () => {
  it('renders correctly', () => {
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
})
```

### Store Test

```tsx
// src/features/auth/model/__tests__/auth.store.test.ts
import { act, renderHook } from '@testing-library/react'

import { useAuthStore } from '../auth.store'

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

## Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Radiant UI
VITE_ENABLE_MSW=true
VITE_ENABLE_ANALYTICS=false
```

Access in code:

```tsx
const apiUrl = import.meta.env.VITE_API_URL
const appName = import.meta.env.VITE_APP_NAME
const enableMSW = import.meta.env.VITE_ENABLE_MSW === 'true'
```

## VS Code Snippets

Add to `.vscode/radiant-ui.code-snippets`:

```json
{
  "FSD Component": {
    "prefix": "fsd-component",
    "body": [
      "import * as React from 'react'",
      "",
      "import { cn } from '@/shared/lib/utils'",
      "",
      "interface ${1:ComponentName}Props {",
      "  className?: string",
      "  $2",
      "}",
      "",
      "export function ${1:ComponentName}({ className, ...props }: ${1:ComponentName}Props) {",
      "  return (",
      "    <div className={cn('', className)} {...props}>",
      "      $0",
      "    </div>",
      "  )",
      "}"
    ]
  },
  "FSD Store": {
    "prefix": "fsd-store",
    "body": [
      "import { create } from 'zustand'",
      "import { devtools, persist } from 'zustand/middleware'",
      "",
      "interface ${1:StoreName}State {",
      "  $2",
      "}",
      "",
      "interface ${1:StoreName}Actions {",
      "  $3",
      "}",
      "",
      "export const use${1:StoreName}Store = create<${1:StoreName}State & ${1:StoreName}Actions>()(",
      "  devtools(",
      "    persist(",
      "      (set) => ({",
      "        $0",
      "      }),",
      "      { name: '${1/([A-Z])/-$1/g}-storage' }",
      "    )",
      "  )",
      ")"
    ]
  }
}
```

## Useful Commands

```bash
# Check FSD compliance
npm run steiger

# Find FSD violations
npm run steiger -- --fix

# Generate bundle analysis
npm run build:analyze

# Check types without emitting
npm run typecheck

# Format and lint in one command
npm run format && npm run lint:fix

# Run all quality checks
npm run lint && npm run typecheck && npm run test:unit && npm run steiger
```

## Debugging Tips

```tsx
// React Query DevTools (already configured)
// Open with floating button in development
// Zustand DevTools
// Open Redux DevTools to see Zustand stores
// Component re-render tracking
import { useEffect, useRef } from 'react'
// Performance profiling
import { Profiler } from 'react'

function useRenderCount() {
  const renderCount = useRef(0)
  useEffect(() => {
    renderCount.current += 1
    console.log(`Render count: ${renderCount.current}`)
  })
}

;<Profiler
  id="MyComponent"
  onRender={(id, phase, actualDuration) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`)
  }}
>
  <MyComponent />
</Profiler>
```

## FSD Best Practices

1. **Always export through index.ts** - Never import internal files directly
2. **Respect layer hierarchy** - Only import from lower layers
3. **Keep layers focused** - Each layer has a specific responsibility
4. **Use public APIs** - Define clear interfaces between layers
5. **Run steiger regularly** - Check FSD compliance before commits

---

This quick reference guide provides the most commonly used patterns and commands for Radiant UI development with Feature-Sliced Design architecture.
