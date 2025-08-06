'use client'

import React, { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { Github, Loader2, Shield, UserPlus, Zap } from 'lucide-react'

import { useTranslation } from 'react-i18next'

import { useForm } from '@/shared/lib/forms'
import { cn } from '@/shared/lib/utils'
import { type RegisterInput } from '@/shared/lib/utils'
import { createRegisterSchema } from '@/shared/lib/utils/i18n-validation'
import { ROUTES } from '@/shared/routes'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'

import { useAuth } from '../model/use-auth'

interface RegisterFormProps {
  className?: string
}

export function RegisterForm({ className, ...props }: RegisterFormProps) {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [passwordStrength, setPasswordStrength] = useState(0)

  const registerSchema = React.useMemo(() => createRegisterSchema(), [])
  
  const form = useForm<RegisterInput>({
    schema: registerSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      await register(data)
      navigate(ROUTES.dashboard)
    } catch {
      // Error is handled by the auth store and displayed as notification
      form.setError('root', {
        message: t('register.error'),
      })
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">{t('register.title')}</h1>
                  <p className="text-muted-foreground text-balance">{t('register.subtitle')}</p>
                </div>

                {/* Display form-level errors */}
                {form.formState.errors.root && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.firstName')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('register.placeholders.firstName')}
                            autoComplete="given-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.lastName')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('register.placeholders.lastName')}
                            autoComplete="family-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('register.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          dir="ltr"
                          placeholder={t('register.placeholders.email')}
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('register.password')}</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder={t('register.placeholders.password')}
                          autoComplete="new-password"
                          showStrength={true}
                          showRequirements={true}
                          onStrengthChange={setPasswordStrength}
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
                      <FormLabel>{t('register.confirmPassword')}</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder={t('register.placeholders.confirmPassword')}
                          autoComplete="new-password"
                          showStrength={false}
                          showRequirements={false}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer text-sm">
                          {t('register.terms')}{' '}
                          <a
                            href="/terms"
                            className="text-primary hover:underline underline-offset-2"
                          >
                            {t('register.termsOfService')}
                          </a>{' '}
                          {t('register.and')}{' '}
                          <a
                            href="/privacy"
                            className="text-primary hover:underline underline-offset-2"
                          >
                            {t('register.privacyPolicy')}
                          </a>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || form.formState.isSubmitting || passwordStrength < 60}
                >
                  {isLoading || form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t('register.submitting')}
                    </>
                  ) : (
                    t('register.submit')
                  )}
                </Button>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">
                    {t('register.socialLogin')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" type="button" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">{t('register.socialLabels.apple')}</span>
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">{t('register.socialLabels.google')}</span>
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">{t('register.socialLabels.github')}</span>
                  </Button>
                </div>

                <div className="text-center text-sm">
                  {t('register.hasAccount')}{' '}
                  <Link
                    to={ROUTES.login}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {t('register.signIn')}
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          {/* Brand showcase side */}
          <div className="relative hidden bg-muted md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
            <div className="flex h-full flex-col justify-between p-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {t('register.features.title')}
                </h2>
                <p className="text-sm text-muted-foreground">{t('register.features.subtitle')}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('register.features.security.title')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('register.features.security.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t('register.features.performance.title')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('register.features.performance.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <blockquote className="space-y-2">
                  <p className="text-sm">"{t('register.features.testimonial.quote')}"</p>
                  <footer className="text-xs">— {t('register.features.testimonial.author')}</footer>
                </blockquote>
              </div>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>{t('register.features.stats')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-balance text-muted-foreground">
        {t('register.legalDisclaimer')}{' '}
        <a href="#" className="text-primary hover:underline underline-offset-4">
          {t('register.termsOfService')}
        </a>{' '}
        {t('register.and')} acknowledge our{' '}
        <a href="#" className="text-primary hover:underline underline-offset-4">
          {t('register.privacyPolicy')}
        </a>
        .
      </div>
    </div>
  )
}
