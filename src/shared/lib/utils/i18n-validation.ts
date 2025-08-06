import { z } from 'zod'
import { i18n } from '@/shared/lib/i18n'

// Helper function to get translated error message
const t = (key: string, options?: any) => {
  return i18n.t(key, options)
}

// Common validation patterns with i18n
export const createEmailSchema = () => 
  z.string()
    .min(1, t('auth:register.validation.emailRequired', 'כתובת אימייל היא שדה חובה'))
    .email(t('auth:register.validation.emailInvalid', 'כתובת אימייל לא תקינה'))

export const createPasswordSchema = () =>
  z.string()
    .min(1, t('auth:register.validation.passwordRequired', 'סיסמה היא שדה חובה'))
    .min(8, t('auth:register.validation.passwordTooShort', 'הסיסמה חייבת להכיל לפחות 8 תווים'))
    .regex(/[A-Z]/, t('auth:register.passwordValidation.hasUppercase', 'הסיסמה חייבת להכיל אות גדולה אחת'))
    .regex(/[a-z]/, t('auth:register.passwordValidation.hasLowercase', 'הסיסמה חייבת להכיל אות קטנה אחת'))
    .regex(/[0-9]/, t('auth:register.passwordValidation.hasNumber', 'הסיסמה חייבת להכיל מספר אחד'))
    .regex(/[^A-Za-z0-9]/, t('auth:register.passwordValidation.hasSpecial', 'הסיסמה חייבת להכיל תו מיוחד אחד'))

export const createNameSchema = () =>
  z.string()
    .min(1, t('validation:required', 'This field is required'))
    .min(2, t('validation:minLength', { count: 2 }, 'Must be at least 2 characters'))
    .max(50, t('validation:maxLength', { count: 50 }, 'Must be less than 50 characters'))
    .regex(/^[a-zA-Z\s'-\u0590-\u05FF]+$/, 
      t('validation:nameFormat', 'Name can only contain letters, spaces, hyphens, and apostrophes')
    )

// Auth schemas with i18n
export const createLoginSchema = () => 
  z.object({
    email: createEmailSchema(),
    password: z.string().min(1, t('auth:login.passwordRequired', 'נדרשת סיסמה')),
    rememberMe: z.boolean().default(false),
  })

export const createRegisterSchema = () =>
  z.object({
    email: createEmailSchema(),
    password: createPasswordSchema(),
    confirmPassword: z.string().min(1, t('auth:register.validation.confirmPasswordRequired', 'Please confirm your password')),
    firstName: z.string()
      .min(1, t('auth:register.validation.firstNameRequired', 'First name is required'))
      .min(2, t('validation:minLength', { count: 2 }, 'Must be at least 2 characters')),
    lastName: z.string()
      .min(1, t('auth:register.validation.lastNameRequired', 'Last name is required'))
      .min(2, t('validation:minLength', { count: 2 }, 'Must be at least 2 characters')),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: t('auth:register.validation.termsRequired', 'You must accept the terms and conditions')
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: t('auth:register.validation.passwordsDoNotMatch', "Passwords don't match"),
    path: ['confirmPassword'],
  })

export const createForgotPasswordSchema = () =>
  z.object({
    email: createEmailSchema(),
  })

export const createResetPasswordSchema = () =>
  z.object({
    password: createPasswordSchema(),
    confirmPassword: z.string().min(1, t('auth:resetPassword.confirmPasswordRequired', 'Please confirm your password')),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: t('auth:register.validation.passwordsDoNotMatch', "Passwords don't match"),
    path: ['confirmPassword'],
  })

export const createChangePasswordSchema = () =>
  z.object({
    currentPassword: z.string().min(1, t('auth:changePassword.currentPasswordRequired', 'Current password is required')),
    newPassword: createPasswordSchema(),
    confirmPassword: z.string().min(1, t('auth:changePassword.confirmPasswordRequired', 'Please confirm your new password')),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: t('auth:changePassword.validation.passwordsDoNotMatch', "Passwords don't match"),
    path: ['confirmPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: t('auth:changePassword.validation.samePassword', 'New password must be different from current password'),
    path: ['newPassword'],
  })