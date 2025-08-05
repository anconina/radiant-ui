import { Loader2 } from 'lucide-react'

import { useForm } from '@/shared/lib/forms'
import { toast } from '@/shared/lib/toast'
import {
  type NotificationPreferencesInput,
  notificationPreferencesSchema,
} from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/ui/form'

interface NotificationSettingsFormProps {
  defaultValues?: NotificationPreferencesInput
  onSubmit?: (data: NotificationPreferencesInput) => Promise<void>
}

export function NotificationSettingsForm({
  defaultValues,
  onSubmit: onSubmitProp,
}: NotificationSettingsFormProps) {
  // Using toast instead of notification hook

  const form = useForm<NotificationPreferencesInput>({
    schema: notificationPreferencesSchema,
    defaultValues: defaultValues || {
      email: {
        marketing: true,
        updates: true,
        security: true,
        newsletter: false,
      },
      push: {
        enabled: true,
        sound: true,
        vibrate: true,
      },
      sms: {
        enabled: false,
        marketing: false,
        security: true,
      },
    },
  })

  const onSubmit = async (data: NotificationPreferencesInput) => {
    try {
      if (onSubmitProp) {
        await onSubmitProp(data)
      } else {
        // Default behavior - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      toast.success('Your notification preferences have been updated.')
    } catch {
      form.setError('root', {
        message: 'Failed to update settings. Please try again.',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Choose what emails you want to receive</p>
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="email.marketing"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Marketing emails</FormLabel>
                    <FormDescription>
                      Receive emails about new features and products
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email.updates"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Product updates</FormLabel>
                    <FormDescription>Get notified about important product updates</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email.security"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Security alerts</FormLabel>
                    <FormDescription>
                      Important notifications about your account security
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email.newsletter"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Weekly newsletter</FormLabel>
                    <FormDescription>Our weekly digest of news and updates</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Notifications sent to your device</p>
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="push.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Enable push notifications</FormLabel>
                    <FormDescription>Receive push notifications on your device</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="push.sound"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Notification sound</FormLabel>
                    <FormDescription>Play a sound when you receive a notification</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={!form.watch('push.enabled')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="push.vibrate"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Vibration</FormLabel>
                    <FormDescription>Vibrate when you receive a notification</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={!form.watch('push.enabled')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">SMS Notifications</h3>
            <p className="text-sm text-muted-foreground">Text messages sent to your phone</p>
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="sms.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Enable SMS notifications</FormLabel>
                    <FormDescription>Receive text messages for important updates</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sms.marketing"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Marketing SMS</FormLabel>
                    <FormDescription>Promotional offers and announcements</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={!form.watch('sms.enabled')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sms.security"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Security SMS</FormLabel>
                    <FormDescription>Two-factor authentication and security alerts</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={!form.watch('sms.enabled')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save preferences'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={!form.formState.isDirty || form.formState.isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
