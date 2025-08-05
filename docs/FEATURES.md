# Radiant UI Features Guide

## Overview

Radiant UI is built using Feature-Sliced Design (FSD) architecture with well-organized layers for scalability and maintainability. This guide provides detailed information about the application features, their organization, and how to extend them.

## 🏗️ FSD Architecture Layers

The application follows strict FSD layer hierarchy:

```
app → pages → widgets → features → entities → shared
```

### Layer Breakdown

```
src/
├── app/                    # Application initialization
│   ├── lib/               # App-specific libraries
│   ├── providers/         # Global providers
│   └── routes/           # Route configuration
│
├── pages/                 # Route pages
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard page
│   ├── admin/            # Admin pages
│   └── [page]/           # Other pages
│
├── widgets/              # Complex UI blocks
│   ├── app-shell/        # Application layout
│   └── dashboard/        # Dashboard widgets
│
├── features/             # Business features
│   ├── auth/            # Authentication
│   ├── dashboard/       # Dashboard logic
│   └── [feature]/       # Other features
│
├── entities/            # Business entities
│   ├── session/        # Session entity
│   └── user/          # User entity
│
└── shared/             # Shared resources
    ├── ui/            # UI components
    ├── lib/           # Utilities
    └── config/        # Configuration
```

## 📋 Core Features

### 🔐 Authentication System

**Location**: `src/features/auth`

**Components**:

- `LoginForm` - Modern login form with validation
- `RegisterForm` - Registration form with Zod validation
- `ForgotPasswordWizard` - Multi-step password reset wizard
- `ResetPasswordForm` - Password reset form
- `LanguageSelector` - Multi-language selector (8 languages)
- `RequireAuth` - Route protection component
- `CanAccess` - Role-based access control
- `AuthErrorBoundary` - Error handling for auth flows

**Store**: `useAuthStore` - Zustand store with:

- JWT token management (httpOnly cookies in production)
- Automatic token refresh
- Session persistence
- Error handling with notifications

**Security Features**:

- Dual token storage strategies (localStorage for dev, httpOnly cookies for prod)
- CSRF protection with token rotation
- Secure password requirements
- Session timeout management
- XSS protection

**Pages**:

- `LoginPage` - `/login`
- `RegisterPage` - `/register`
- `ForgotPasswordPage` - `/forgot-password`
- `ResetPasswordPage` - `/reset-password`

---

### 📊 Dashboard & Analytics

**Features**: `src/features/dashboard`  
**Widgets**: `src/widgets/dashboard`  
**Pages**: `src/pages/dashboard`

**Dashboard Widgets**:

- `RevenueChart` - Revenue trends visualization
- `ActivityChart` - User activity metrics
- `RecentSales` - Recent transactions display
- `TopProducts` - Best-performing products
- `StatCard` - Metric display cards

**Features**:

- Real-time data updates with React Query
- Interactive charts using Recharts
- Responsive grid layout
- Data export capabilities
- Performance optimized with memoization

---

### 👤 User Management

**Pages**: `src/pages/profile`, `src/pages/admin`  
**Entities**: `src/entities/user`

**User Entity Components**:

- `UserAvatar` - Avatar display with fallback
- `UserCard` - User information card
- `UserProfile` - Profile display component

**Profile Features**:

- Profile viewing and editing
- Avatar upload with preview
- Personal information management
- Account settings

**Admin Features**:

- `UserManagementPage` - User administration
- Role and permission management
- User activity monitoring
- Bulk operations support

---

### ⚙️ Settings & Preferences

**Feature**: `src/features/settings`  
**Page**: `src/pages/settings`

**Components**:

- `NotificationSettingsForm` - Notification preferences
- Theme selection (light/dark/system)
- Language preferences (8 languages)
- Accessibility options

**Features**:

- Persistent settings with Zustand
- Real-time theme switching
- RTL support for Arabic and Hebrew
- Keyboard navigation support

---

### 🎨 Component Examples

**Feature**: `src/features/examples`  
**Pages**: `src/pages/examples`

**Demo Pages**:

- `UIComponentsPage` - shadcn/ui component showcase
- `FormsPage` - Form patterns and validation
- `DataTablePage` - Advanced data table features
- `DataDisplayPage` - Data visualization examples
- `ResponsiveDemoPage` - Responsive design patterns
- `RTLDemoPage` - RTL layout demonstrations
- `LoadingStatesDemo` - Loading UI patterns
- `UrlStateDemoPage` - URL state management

---

### 🏠 Application Shell

**Widget**: `src/widgets/app-shell`

**Components**:

- `Layout` - Main application layout
- `AppSidebar` - Navigation sidebar with:
  - Collapsible navigation
  - Search functionality
  - User menu
  - Project switcher
- `Header` - Application header with:
  - Mobile menu toggle
  - User dropdown
  - Notifications
- `Footer` - Application footer

**Features**:

- Responsive layout system
- Mobile-first design
- Keyboard navigation
- Screen reader support

## 🌍 Internationalization

**Supported Languages** (8 total):

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- Chinese (zh)
- Arabic (ar) - RTL
- Hebrew (he) - RTL

**Features**:

- Automatic language detection
- RTL support with CSS logical properties
- Number and date formatting
- Pluralization support
- Lazy-loaded translations

## 🎨 UI Components Library

**Location**: `src/shared/ui`

**Component Categories**:

- **Forms**: Input, Select, Checkbox, Radio, Switch, Textarea
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Navigation**: Tabs, Breadcrumb, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip
- **Display**: Card, Badge, Avatar, Separator
- **Layout**: Container, Grid, Stack

**All components feature**:

- Full TypeScript support
- Accessibility compliance (WCAG 2.1 AA)
- Dark mode support
- RTL compatibility
- Tailwind CSS styling
- CVA for variants

## 🔒 Security Features

### Authentication Security

- JWT with httpOnly cookies in production
- Automatic token refresh before expiry
- CSRF protection on state-changing operations
- Secure password requirements (Zod validation)
- Session timeout management
- XSS protection via React's built-in escaping

### API Security

- Automatic token injection in requests
- Request/response interceptors
- Rate limiting preparation
- Error sanitization

### Content Security

- CSP headers configuration
- HTTPS enforcement
- Secure headers (HSTS, X-Frame-Options)
- Input validation with Zod schemas

## ⚡ Performance Features

### Build Optimizations

- Code splitting by routes
- Vendor chunk optimization
- Tree shaking
- Minification and compression
- Asset optimization

### Runtime Optimizations

- React Query for server state caching
- Component memoization
- Virtual scrolling ready
- Lazy loading for routes
- Service worker for PWA

### Bundle Size

- ~450KB gzipped total
- Chunk size warnings at 500KB
- Aggressive code splitting
- Dynamic imports for features

## 🧪 Testing Infrastructure

### Test Coverage

- Unit tests with Vitest (80% line coverage)
- Component tests with React Testing Library
- Integration tests for features
- E2E tests with Playwright
- Visual regression testing ready

### Testing Utilities

- MSW for API mocking
- Test data factories
- Custom render utilities
- Accessibility testing

## 📱 Progressive Web App

**Features**:

- Offline capability with service workers
- App manifest for installation
- Push notification ready
- Background sync preparation
- Cache strategies implementation

## ♿ Accessibility

**WCAG 2.1 AA Compliance**:

- Semantic HTML throughout
- ARIA labels and landmarks
- Keyboard navigation support
- Focus management
- Screen reader optimization
- Color contrast compliance
- Reduced motion support

## 🚀 Getting Started with Features

### Creating a New Feature (FSD)

```bash
# Create feature structure
mkdir -p src/features/my-feature/{api,lib,model,ui}
touch src/features/my-feature/index.ts
```

### Feature Structure Example

```typescript
// src/features/my-feature/model/my-feature.store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface MyFeatureState {
  // State
}

interface MyFeatureActions {
  // Actions
}

export const useMyFeatureStore = create<MyFeatureState & MyFeatureActions>()(
  devtools(
    persist(
      set => ({
        // Implementation
      }),
      { name: 'my-feature-storage' }
    )
  )
)
```

### Adding a New Page

```typescript
// src/pages/my-page/ui/MyPage.tsx
export function MyPage() {
  return (
    <div>
      {/* Page content */}
    </div>
  )
}

// src/pages/my-page/index.ts
export { MyPage } from './ui/MyPage'
```

## 🔄 Feature Roadmap

### Planned Features

- Advanced search with filters
- Real-time collaboration
- File upload system
- Advanced notifications
- Data export/import
- Audit logging
- Two-factor authentication
- Social authentication

### Enhancement Plans

- GraphQL API support
- WebSocket integration
- Advanced caching strategies
- Micro-frontend architecture
- A/B testing framework
- Analytics dashboard
- Performance monitoring

---

This guide provides a comprehensive overview of Radiant UI's features and architecture. Each feature follows FSD principles for maintainability, scalability, and developer experience.
