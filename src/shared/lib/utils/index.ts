/**
 * Shared utilities public API
 * Provides access to common utility functions and validation schemas
 */

// Class name utility
export { cn } from './cn'

// Validation schemas and types
export {
  emailSchema,
  passwordSchema,
  nameSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileSchema,
  addressSchema,
  notificationPreferencesSchema,
  privacySettingsSchema,
} from './validation'

// Type exports
export type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  ProfileInput,
  AddressInput,
  NotificationPreferencesInput,
  PrivacySettingsInput,
} from './validation'
