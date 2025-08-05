import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, options)
  },
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, options)
  },
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, options)
  },
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, options)
  },
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  },
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId)
  },
  message: (message: string, options?: ToastOptions) => {
    return sonnerToast.message(message, options)
  },
}
