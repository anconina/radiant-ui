import { Suspense, lazy } from 'react'

import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { Layout } from '@/widgets/app-shell'

// import { ROUTES } from '@/shared/routes' // Will be used for navigation

import { ErrorBoundary } from './ErrorBoundary'
import { ProtectedRoute } from './ProtectedRoute'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/home').then(module => ({ default: module.HomePage })))
const LoginPage = lazy(() => import('@/pages/auth').then(module => ({ default: module.LoginPage })))
const RegisterPage = lazy(() =>
  import('@/pages/auth').then(module => ({ default: module.RegisterPage }))
)
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then(module => ({
    default: module.DashboardPage,
  }))
)
const DataTablePage = lazy(() =>
  import('@/pages/examples').then(module => ({
    default: module.DataTablePage,
  }))
)
const ProfilePage = lazy(() =>
  import('@/pages/profile').then(module => ({ default: module.ProfilePage }))
)
const SettingsPage = lazy(() =>
  import('@/pages/settings').then(module => ({
    default: module.SettingsPage,
  }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/error').then(module => ({ default: module.NotFoundPage }))
)
const UrlStateDemoPage = lazy(() =>
  import('@/pages/examples').then(module => ({ default: module.UrlStateDemoPage }))
)
const ResponsiveDemoPage = lazy(() =>
  import('@/pages/examples').then(module => ({ default: module.ResponsiveDemoPage }))
)
const LoadingStatesDemo = lazy(() =>
  import('@/pages/examples').then(module => ({ default: module.LoadingStatesDemo }))
)
const RTLDemoPage = lazy(() =>
  import('@/pages/examples').then(module => ({ default: module.RTLDemoPage }))
)
const AdminDashboard = lazy(() =>
  import('@/pages/admin').then(module => ({ default: module.AdminDashboard }))
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth').then(module => ({ default: module.ForgotPasswordPage }))
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth').then(module => ({ default: module.ResetPasswordPage }))
)

// Additional pages for sidebar links
const UserManagementPage = lazy(() =>
  import('@/pages/admin').then(module => ({
    default: module.UserManagementPage,
  }))
)
const NotificationsPage = lazy(() =>
  import('@/pages/notifications').then(module => ({
    default: module.NotificationsPage,
  }))
)
const HelpPage = lazy(() => import('@/pages/help').then(module => ({ default: module.HelpPage })))
const UIComponentsPage = lazy(() =>
  import('@/pages/examples').then(module => ({
    default: module.UIComponentsPage,
  }))
)
const FormsPage = lazy(() =>
  import('@/pages/examples').then(module => ({ default: module.FormsPage }))
)
const DataDisplayPage = lazy(() =>
  import('@/pages/examples').then(module => ({
    default: module.DataDisplayPage,
  }))
)

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

// Root layout component
function RootLayout() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  )
}

// Auth layout component (no sidebar)
function AuthLayout() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6 md:p-10">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  )
}

// Create router with type-safe routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requireRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'components',
        children: [
          {
            path: 'ui',
            element: <UIComponentsPage />,
          },
          {
            path: 'forms',
            element: <FormsPage />,
          },
          {
            path: 'data',
            element: <DataDisplayPage />,
          },
        ],
      },
      {
        path: 'examples',
        children: [
          {
            index: true,
            element: <UIComponentsPage />,
          },
          {
            path: 'url-state',
            element: <UrlStateDemoPage />,
          },
          {
            path: 'responsive',
            element: <ResponsiveDemoPage />,
          },
          {
            path: 'loading-states',
            element: <LoadingStatesDemo />,
          },
          {
            path: 'rtl',
            element: <RTLDemoPage />,
          },
          {
            path: 'data-table',
            element: <DataTablePage />,
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

// Router component
export function AppRouter() {
  return <RouterProvider router={router} />
}

// Type-safe navigation hook
export { useNavigate, useLocation, useParams, Link, NavLink } from 'react-router-dom'
