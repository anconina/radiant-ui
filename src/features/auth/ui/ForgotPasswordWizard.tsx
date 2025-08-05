'use client'

import { useState } from 'react'

import { Link } from 'react-router-dom'

import { ArrowLeft, ArrowRight, Check, Clock, Loader2, Mail, Shield } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { forgotPassword } from '@/features/auth/api/auth.api'

import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/routes'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Progress } from '@/shared/ui/progress'

const createForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t('forgotPassword.validation.emailRequired')),
  })

type ForgotPasswordInput = {
  email: string
}

type WizardStep = 'email' | 'sent' | 'success'

interface ForgotPasswordWizardProps {
  className?: string
}

export function ForgotPasswordWizard({ className, ...props }: ForgotPasswordWizardProps) {
  const { t } = useTranslation('auth')
  const [currentStep, setCurrentStep] = useState<WizardStep>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    setError(null)

    try {
      await forgotPassword(data)
      setUserEmail(data.email)
      setCurrentStep('sent')
      // Auto progress to success step after showing email preview
      setTimeout(() => {
        setCurrentStep('success')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgotPassword.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const getStepProgress = (step: WizardStep) => {
    switch (step) {
      case 'email':
        return 33
      case 'sent':
        return 66
      case 'success':
        return 100
    }
  }

  const getStepTitle = (step: WizardStep) => {
    switch (step) {
      case 'email':
        return t('forgotPassword.wizard.steps.email.title')
      case 'sent':
        return t('forgotPassword.wizard.steps.sent.title')
      case 'success':
        return t('forgotPassword.wizard.steps.success.title')
    }
  }

  const getStepDescription = (step: WizardStep) => {
    switch (step) {
      case 'email':
        return t('forgotPassword.wizard.steps.email.description')
      case 'sent':
        return t('forgotPassword.wizard.steps.sent.description')
      case 'success':
        return t('forgotPassword.wizard.steps.success.description')
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>
                {t('forgotPassword.wizard.progress.step', {
                  current: currentStep === 'email' ? '1' : currentStep === 'sent' ? '2' : '3',
                  total: '3',
                })}
              </span>
              <span>
                {t('forgotPassword.wizard.progress.complete', {
                  percent: getStepProgress(currentStep),
                })}
              </span>
            </div>
            <Progress value={getStepProgress(currentStep)} className="h-2" animated />
          </div>

          {/* Step content */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                {currentStep === 'email' && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                )}
                {currentStep === 'sent' && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                {currentStep === 'success' && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold">{getStepTitle(currentStep)}</h1>
              <p className="text-muted-foreground text-balance">
                {getStepDescription(currentStep)}
              </p>
            </div>

            {/* Step 1: Email input */}
            {currentStep === 'email' && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forgotPassword.email')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            dir="ltr"
                            placeholder={t('forgotPassword.form.emailPlaceholder')}
                            autoComplete="email"
                            disabled={isLoading}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <Button type="submit" className="w-full h-12" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="me-2 h-4 w-4 animate-spin" />
                          {t('forgotPassword.form.sendingLink')}
                        </>
                      ) : (
                        <>
                          {t('forgotPassword.submit')}
                          <ArrowRight className="ms-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <Button asChild variant="ghost" className="w-full">
                      <Link to={ROUTES.login}>
                        <ArrowLeft className="me-2 h-4 w-4" />
                        {t('forgotPassword.form.backToSignIn')}
                      </Link>
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: Email sent confirmation */}
            {currentStep === 'sent' && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: t('forgotPassword.emailPreview.sentTo', { email: userEmail }),
                      }}
                    />
                  </AlertDescription>
                </Alert>

                {/* Email preview */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    {t('forgotPassword.emailPreview.title')}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">{t('forgotPassword.emailPreview.subject')}</div>
                    <div className="text-muted-foreground">
                      {t('forgotPassword.emailPreview.content')}
                    </div>
                    <div className="rounded bg-primary/10 px-2 py-1 text-primary text-xs font-mono">
                      {t('forgotPassword.emailPreview.button')}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    <Clock className="me-2 h-3 w-3" />
                    {t('forgotPassword.emailPreview.timing')}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success state */}
            {currentStep === 'success' && (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {t('forgotPassword.instructions.confirmationMessage')}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 text-sm">
                  <div className="space-y-2">
                    <h3 className="font-medium">{t('forgotPassword.instructions.title')}</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        {t('forgotPassword.instructions.step1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        {t('forgotPassword.instructions.step2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        {t('forgotPassword.instructions.step3')}
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>{t('forgotPassword.instructions.security')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setCurrentStep('email')
                      setError(null)
                      form.reset()
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    {t('forgotPassword.form.sendAnotherEmail')}
                  </Button>

                  <Button asChild variant="ghost" className="w-full">
                    <Link to={ROUTES.login}>
                      <ArrowLeft className="me-2 h-4 w-4" />
                      {t('forgotPassword.form.backToSignIn')}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        {t('forgotPassword.support.havingTrouble')}{' '}
        <a href="#" className="text-primary hover:underline">
          {t('forgotPassword.support.contactSupport')}
        </a>
      </div>
    </div>
  )
}
