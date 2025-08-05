import { zodResolver } from '@hookform/resolvers/zod'
import { useForm as useHookForm } from 'react-hook-form'
import type { FieldValues, UseFormProps } from 'react-hook-form'
import type { ZodSchema } from 'zod'

interface UseFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema?: ZodSchema<T>
}

export function useForm<T extends FieldValues>({ schema, ...options }: UseFormOptions<T> = {}) {
  return useHookForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...options,
  })
}
