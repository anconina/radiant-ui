'use client'

import React, { useState } from 'react'

import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Eye, EyeOff, Github, Loader2 } from 'lucide-react'

import { useForm } from '@/shared/lib/forms'
import { useTranslation } from '@/shared/lib/i18n'
import { type LoginInput, cn, createLoginSchema } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/routes'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'

import { useAuth } from '../model/use-auth'
import { LanguageSelector } from './LanguageSelector'

interface LoginFormProps {
  className?: string
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')

  const from = location.state?.from?.pathname || ROUTES.dashboard

  const loginSchema = React.useMemo(() => createLoginSchema(), [])

  const form = useForm<LoginInput>({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data)
      // Navigation is handled by the useAuth hook
    } catch (error) {
      // Error is handled by the auth store and displayed as notification
      form.setError('root', {
        message: t('login.error'),
      })
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Language Selector */}
      <div className="flex justify-end">
        <LanguageSelector />
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8" noValidate>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">{t('login.welcomeBack')}</h1>
                  <p className="text-muted-foreground text-balance">{t('login.signInToAccount')}</p>
                </div>

                {/* Display form-level errors */}
                {form.formState.errors.root && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('login.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          dir="ltr"
                          placeholder={t('login.emailPlaceholder')}
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
                      <div className="flex items-center justify-between">
                        <FormLabel>{t('login.password')}</FormLabel>
                        <Link
                          to={ROUTES.forgotPassword}
                          className="text-sm text-primary hover:underline underline-offset-2"
                        >
                          {t('login.forgotPassword')}
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('login.passwordPlaceholder')}
                            autoComplete="current-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            aria-label={
                              showPassword ? t('login.hidePassword') : t('login.showPassword')
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          {t('login.rememberMeDays')}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || form.formState.isSubmitting}
                >
                  {isLoading || form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t('login.signingIn')}
                    </>
                  ) : (
                    t('login.submit')
                  )}
                </Button>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">
                    {t('login.orContinueWith')}
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
                    <span className="sr-only">{t('login.continueWithApple')}</span>
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">{t('login.continueWithGoogle')}</span>
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">{t('login.continueWithGithub')}</span>
                  </Button>
                </div>

                <div className="text-center text-sm">
                  {t('login.dontHaveAccount')}{' '}
                  <Link
                    to={ROUTES.register}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {t('login.signUp')}
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
                <h2 className="text-2xl font-bold text-foreground">{tCommon('app.name')}</h2>
                <p className="text-sm text-muted-foreground">{tCommon('app.description')}</p>
              </div>

              <div className="space-y-4">
                <blockquote className="space-y-2">
                  <p className="text-lg">"{t('login.testimonial.quote')}"</p>
                  <footer className="text-sm">— {t('login.testimonial.author')}</footer>
                </blockquote>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>{tCommon('status.online')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo credentials notice */}
      <div className="text-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
        <p className="font-medium mb-1">{t('login.demoCredentials')}</p>
        <p>Email: demo@example.com | Password: password</p>
      </div>

      <div className="text-center text-xs text-balance text-muted-foreground">
        {t('login.byContinuing')}{' '}
        <a href="#" className="text-primary hover:underline underline-offset-4">
          {t('login.termsOfService')}
        </a>{' '}
        {tCommon('messages.and')}{' '}
        <a href="#" className="text-primary hover:underline underline-offset-4">
          {t('login.privacyPolicy')}
        </a>
        .
      </div>
    </div>
  )
}
