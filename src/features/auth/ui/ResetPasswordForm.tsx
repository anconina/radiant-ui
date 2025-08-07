'use client'

import React, { useEffect, useState } from 'react'

import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, Shield } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
// import { z } from 'zod' // Reserved for future validation

import { resetPassword } from '@/features/auth/api/auth.api'

import { toast } from '@/shared/lib/toast'
import { cn, createResetPasswordSchema } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/routes'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { PasswordInput } from '@/shared/ui/password-input'

type ResetPasswordInput = {
  password: string
  confirmPassword: string
}

interface ResetPasswordFormProps {
  className?: string
}

export function ResetPasswordForm({ className, ...props }: ResetPasswordFormProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Using toast instead of notification hook
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [_passwordStrength, setPasswordStrength] = useState(0)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const resetPasswordSchema = React.useMemo(() => createResetPasswordSchema(), [])

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
  }, [token, email])

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token || !email) {
      setError('Invalid reset link')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await resetPassword({
        token,
        email,
        password: data.password,
      })

      setIsSuccess(true)

      // Show success notification and redirect after delay
      setTimeout(() => {
        toast.success('Your password has been reset. You can now log in with your new password.')
        navigate(ROUTES.login)
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Password reset successful!</h1>
                <p className="text-muted-foreground text-balance">
                  Your password has been updated. You&apos;ll be redirected to the login page
                  automatically.
                </p>
              </div>

              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  You can now sign in with your new password
                </AlertDescription>
              </Alert>

              <Button asChild className="w-full">
                <Link to={ROUTES.login}>Continue to sign in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-muted-foreground text-balance">
            Choose a strong password to secure your account
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8 pt-4">
          {/* Token validation error */}
          {error && !token && (
            <div className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full">
                  <Link to={ROUTES.forgotPassword}>Request new reset link</Link>
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link to={ROUTES.login}>
                    <ArrowLeft className="me-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Reset form */}
          {token && email && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Form submission error */}
                {error && token && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email confirmation */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Resetting password for:</span>
                      <span className="ms-1 font-medium">{email}</span>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Enter your new password"
                          autoComplete="new-password"
                          showStrength={true}
                          showRequirements={true}
                          onStrengthChange={setPasswordStrength}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Confirm your new password"
                          autoComplete="new-password"
                          showStrength={false}
                          showRequirements={false}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      'Update password'
                    )}
                  </Button>

                  <Button asChild variant="ghost" className="w-full">
                    <Link to={ROUTES.login}>
                      <ArrowLeft className="me-2 h-4 w-4" />
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-3 w-3" />
          <span>Your password is encrypted and secure</span>
        </div>
      </div>
    </div>
  )
}
