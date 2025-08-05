// Auth feature public API

// UI Components
export { LoginForm } from './ui/LoginForm'
export { RegisterForm } from './ui/RegisterForm'
export { ForgotPasswordWizard } from './ui/ForgotPasswordWizard'
export { ResetPasswordForm } from './ui/ResetPasswordForm'
export { LanguageSelector } from './ui/LanguageSelector'
export { RequireAuth } from './ui/RequireAuth'
export { CanAccess, CanAccessAdmin, CanAccessModerator, useCanAccess } from './ui/CanAccess'
export { UnauthorizedPage } from './ui/UnauthorizedPage'
export { AuthErrorBoundary } from './ui/AuthErrorBoundary'

// Model (stores, hooks)
export { useAuthStore } from './model/auth.store'
export { useAuth } from './model/use-auth'

// API
export * from './api/auth.api'

// Lib
export { initializeAuth } from './lib/init-auth'
