# Radiant UI Architecture Guide

## Overview

Radiant UI is built using **Feature-Sliced Design (FSD)**, an architectural methodology for scaffolding front-end applications. FSD provides standardized rules and conventions for organizing code to enhance understandability, scalability, and maintainability amidst changing business requirements.

## 🏗️ Feature-Sliced Design Principles

### Core Principles

1. **Layer Isolation**: Code is organized into standardized layers with strict dependency rules
2. **Public API**: Each module exposes only necessary functionality through index files
3. **Business Logic Isolation**: Business logic is separated from UI components
4. **Slice Independence**: Features and entities are independent and can be developed in isolation

### Layer Hierarchy

The application follows FSD's standard layer hierarchy (from highest to lowest):

```
app → pages → widgets → features → entities → shared
```

**Import Rule**: A module in a higher layer can only import from lower layers. Cross-imports within the same layer are forbidden (except for special cases with `@x` notation).

## 📁 Project Structure

```
src/
├── app/                    # Application initialization layer
│   ├── lib/               # App-specific libraries
│   │   └── performance/   # Performance utilities
│   ├── providers/         # Global providers
│   │   ├── i18n-provider.tsx
│   │   ├── monitoring-provider.tsx
│   │   └── query-provider.tsx
│   └── routes/           # Routing configuration
│       ├── ErrorBoundary.tsx
│       ├── ProtectedRoute.tsx
│       └── index.tsx
│
├── entities/              # Business entities layer
│   ├── session/          # Session entity
│   │   ├── api/         # API calls
│   │   ├── model/       # Business logic & types
│   │   └── index.ts     # Public API
│   └── user/            # User entity
│       ├── api/         # API calls
│       ├── model/       # Business logic & types
│       ├── ui/          # Entity-specific UI
│       └── index.ts     # Public API
│
├── features/             # Business features layer
│   ├── auth/            # Authentication feature
│   │   ├── api/        # Feature API calls
│   │   ├── lib/        # Feature utilities
│   │   ├── model/      # Business logic & stores
│   │   ├── ui/         # Feature components
│   │   └── index.ts    # Public API
│   ├── dashboard/       # Dashboard feature
│   ├── data-table/      # Data table feature
│   ├── examples/        # Examples feature
│   ├── profile/         # Profile feature
│   └── settings/        # Settings feature
│
├── pages/               # Application pages/routes
│   ├── admin/          # Admin pages
│   ├── auth/           # Auth pages
│   ├── dashboard/      # Dashboard pages
│   ├── error/          # Error pages
│   ├── examples/       # Example pages
│   ├── help/           # Help pages
│   ├── home/           # Home page
│   ├── notifications/  # Notifications pages
│   ├── profile/        # Profile pages
│   └── settings/       # Settings pages
│
├── shared/             # Shared code layer
│   ├── api/           # Shared API utilities
│   ├── config/        # App configuration
│   ├── contracts/     # TypeScript types & interfaces
│   ├── lib/           # Shared libraries
│   │   ├── auth/      # Auth utilities
│   │   ├── forms/     # Form utilities
│   │   ├── http-client/ # HTTP client
│   │   ├── i18n/      # Internationalization
│   │   ├── monitoring/ # Error tracking
│   │   ├── performance/ # Performance utils
│   │   ├── pwa/       # PWA utilities
│   │   ├── security/  # Security utilities
│   │   └── utils/     # General utilities
│   ├── providers/     # Shared providers
│   ├── routes/        # Route definitions
│   ├── stores/        # Global stores
│   ├── styles/        # Global styles
│   └── ui/            # Shared UI components
│       ├── loading/   # Loading components
│       ├── responsive/ # Responsive utilities
│       └── rtl/       # RTL support
│
└── widgets/            # Complex UI blocks layer
    ├── app-shell/     # Application shell widget
    │   └── ui/
    │       ├── AppSidebar.tsx
    │       ├── Footer.tsx
    │       ├── Header.tsx
    │       └── Layout.tsx
    └── dashboard/     # Dashboard widgets
        └── ui/
            ├── activity-chart.tsx
            ├── recent-sales.tsx
            └── revenue-chart.tsx
```

## 🎯 Layer Descriptions

### App Layer

- **Purpose**: Application initialization, providers, and global configuration
- **Contains**: Route configuration, global providers, app-wide settings
- **Can import from**: All lower layers

### Pages Layer

- **Purpose**: Route pages that compose the application screens
- **Contains**: Page components that combine widgets and features
- **Can import from**: widgets, features, entities, shared
- **Example**: `LoginPage`, `DashboardPage`, `ProfilePage`

### Widgets Layer

- **Purpose**: Complex, self-contained UI blocks composed from multiple features
- **Contains**: Large reusable UI sections like headers, sidebars, complex forms
- **Can import from**: features, entities, shared
- **Example**: `AppSidebar`, `DashboardWidget`, `UserProfileCard`

### Features Layer

- **Purpose**: User interactions and business scenarios
- **Contains**: Feature-specific logic, UI components, and API calls
- **Can import from**: entities, shared
- **Example**: `auth`, `data-table`, `profile management`

### Entities Layer

- **Purpose**: Business entities and domain objects
- **Contains**: Entity models, API calls, and entity-specific UI
- **Can import from**: shared
- **Example**: `user`, `session`, `product`

### Shared Layer

- **Purpose**: Reusable utilities, UI kit, and common functionality
- **Contains**: UI components, utilities, configurations, types
- **Cannot import from**: Any other layer
- **Example**: `Button`, `Input`, `http-client`, `validation`

## 🔄 Data Flow Architecture

### State Management Layers

```
┌─────────────────────────────────────┐
│            Pages                    │
├─────────────────────────────────────┤
│           Widgets                   │
├─────────────────────────────────────┤
│          Features                   │
│     (Zustand stores + hooks)        │
├─────────────────────────────────────┤
│          Entities                   │
│    (Domain models + API)            │
├─────────────────────────────────────┤
│           Shared                    │
│  (Global stores + utilities)        │
└─────────────────────────────────────┘
```

### State Management Strategy

1. **Component State**: React `useState` for local UI state
2. **Feature Stores**: Zustand stores in feature layer for feature-specific state
3. **Entity Models**: Business logic and data models in entities layer
4. **Shared Stores**: Global app state (theme, preferences) in shared layer
5. **Server State**: React Query for API data fetching and caching

## 🎨 UI Architecture

### Component Organization

```
shared/ui/              # Base UI components (shadcn/ui)
├── button.tsx         # Atomic components
├── input.tsx
├── dialog.tsx
└── form.tsx

features/*/ui/         # Feature-specific components
├── LoginForm.tsx
└── RegisterForm.tsx

widgets/*/ui/          # Complex UI blocks
├── AppSidebar.tsx
└── DashboardChart.tsx

pages/*/ui/           # Page components
├── HomePage.tsx
└── DashboardPage.tsx
```

### Design System Integration

- **shadcn/ui**: Base component library providing 40+ accessible components
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **CVA**: Component variants for consistent styling patterns
- **Radix UI**: Headless UI primitives for accessibility

## 🌐 Internationalization Architecture

### i18n Structure

```
public/locales/
├── en/                 # English translations
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   └── ...
├── es/                 # Spanish
├── fr/                 # French
├── de/                 # German
├── ja/                 # Japanese
├── zh/                 # Chinese
├── ar/                 # Arabic (RTL)
└── he/                 # Hebrew (RTL)
```

### RTL Support

- Automatic layout switching for RTL languages
- CSS logical properties for direction-agnostic styling
- DirectionProvider for RTL context
- Directional UI components with RTL awareness

## 🔒 Security Architecture

### Security Layers

1. **Authentication**:
   - JWT-based with secure token management
   - Token rotation and CSRF protection
   - Secure storage strategies

2. **Route Protection**:
   - ProtectedRoute component for access control
   - Role-based permissions
   - Automatic redirects for unauthorized access

3. **API Security**:
   - HTTP client with automatic token injection
   - Request/response interceptors
   - Error handling for auth failures

## 🧪 Testing Architecture

### Test Organization (Co-located)

```
features/auth/
├── model/
│   ├── auth.store.ts
│   └── __tests__/
│       └── auth.store.test.ts
├── ui/
│   ├── LoginForm.tsx
│   └── __tests__/
│       └── LoginForm.test.tsx
```

### Testing Strategy

1. **Unit Tests**: Vitest for component and utility testing
2. **Integration Tests**: Testing feature interactions
3. **E2E Tests**: Playwright for user workflows
4. **Visual Tests**: Playwright for visual regression
5. **Performance Tests**: Core Web Vitals monitoring

## 📱 Progressive Web App (PWA)

### PWA Features

- Service worker for offline functionality
- Web app manifest for installability
- Push notifications support
- Background sync capabilities
- App-like experience on mobile

## 🚀 Build & Deployment

### Build Configuration

- **Vite**: Lightning-fast build tool with HMR
- **TypeScript**: Strict mode for type safety
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Optimal bundle sizes
- **Compression**: Gzip/Brotli compression

### Deployment Platforms

- **Vercel**: Optimized for React applications
- **Netlify**: Static site hosting with functions
- **AWS**: S3 + CloudFront for global CDN
- **Cloudflare**: Edge network deployment

## 📊 Performance Optimization

### Optimization Strategies

1. **Lazy Loading**: Dynamic imports for routes and features
2. **Image Optimization**: Next-gen formats and lazy loading
3. **Bundle Analysis**: Regular size monitoring
4. **Caching**: React Query for data caching
5. **Web Vitals**: Continuous performance monitoring

### Performance Budgets

- Initial Bundle: < 200KB
- Route Chunks: < 50KB
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

## 🔄 Migration Path

### From Traditional Architecture to FSD

1. **Identify Layers**: Map existing code to FSD layers
2. **Create Public APIs**: Add index.ts files for each module
3. **Resolve Dependencies**: Fix layer violations
4. **Refactor Features**: Extract features from pages
5. **Standardize Structure**: Apply consistent patterns

### FSD Compliance

The project uses Steiger for FSD validation:

```bash
npm run fsd:check  # Check FSD compliance
npm run fsd:fix    # Auto-fix violations
```

---

This architecture guide provides the foundation for understanding and contributing to the Radiant UI project following Feature-Sliced Design principles. For more details on FSD, visit [feature-sliced.design](https://feature-sliced.design).
