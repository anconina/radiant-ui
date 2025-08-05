import { z } from 'zod'

// Common validation patterns
export const emailSchema = z.string().min(1, 'Email is required').email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: nameSchema,
    lastName: nameSchema,
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms and conditions'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  })

// Profile schemas
export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    )
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
})

export const addressSchema = z.object({
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code'),
  country: z.string().min(1, 'Country is required'),
})

// Settings schemas
export const notificationPreferencesSchema = z.object({
  email: z.object({
    marketing: z.boolean(),
    updates: z.boolean(),
    security: z.boolean(),
    newsletter: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    sound: z.boolean(),
    vibrate: z.boolean(),
  }),
  sms: z.object({
    enabled: z.boolean(),
    marketing: z.boolean(),
    security: z.boolean(),
  }),
})

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'friends']),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowDataCollection: z.boolean(),
  allowAnalytics: z.boolean(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>
