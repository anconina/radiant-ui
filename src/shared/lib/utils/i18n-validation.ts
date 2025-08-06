import { z } from 'zod'
import i18n from '@/shared/lib/i18n/i18n'

// Helper function to get translated error message
const t = (key: string, options?: any) => {
  return i18n.t(key, options)
}

// Common validation patterns with i18n
export const createEmailSchema = () => 
  z.string()
    .min(1, t('auth:register.validation.emailRequired', 'Email is required'))
    .email(t('auth:register.validation.emailInvalid', 'Invalid email address'))

export const createPasswordSchema = () =>
  z.string()
    .min(1, t('auth:register.validation.passwordRequired', 'Password is required'))
    .min(8, t('auth:register.validation.passwordTooShort', 'Password must be at least 8 characters'))
    .regex(/[A-Z]/, t('auth:register.passwordValidation.hasUppercase', 'Password must contain at least one uppercase letter'))
    .regex(/[a-z]/, t('auth:register.passwordValidation.hasLowercase', 'Password must contain at least one lowercase letter'))
    .regex(/[0-9]/, t('auth:register.passwordValidation.hasNumber', 'Password must contain at least one number'))
    .regex(/[^A-Za-z0-9]/, t('auth:register.passwordValidation.hasSpecial', 'Password must contain at least one special character'))

export const createNameSchema = () =>
  z.string()
    .min(1, t('validation.required', 'This field is required'))
    .min(2, t('validation.minLength', 'Must be at least 2 characters'))
    .max(50, t('validation.maxLength', 'Must be less than 50 characters'))
    .regex(/^[a-zA-Z\s'-\u0590-\u05FF]+$/, 
      t('validation.nameFormat', 'Name can only contain letters, spaces, hyphens, and apostrophes')
    )

// Auth schemas with i18n
export const createLoginSchema = () => 
  z.object({
    email: createEmailSchema(),
    password: z.string().min(1, t('auth:login.passwordRequired', 'Password is required')),
    rememberMe: z.boolean().default(false),
  })

export const createRegisterSchema = () =>
  z.object({
    email: createEmailSchema(),
    password: createPasswordSchema(),
    confirmPassword: z.string().min(1, t('auth:register.validation.confirmPasswordRequired', 'Please confirm your password')),
    firstName: z.string()
      .min(1, t('auth:register.validation.firstNameRequired', 'First name is required'))
      .min(2, t('validation.minLength', 'Must be at least 2 characters')),
    lastName: z.string()
      .min(1, t('auth:register.validation.lastNameRequired', 'Last name is required'))
      .min(2, t('validation.minLength', 'Must be at least 2 characters')),
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