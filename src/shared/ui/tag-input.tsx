'use client'

import * as React from 'react'

import { X } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import { Badge } from './badge'
import { Button } from './button'
import { Input } from './input'

export interface TagInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  allowDuplicates?: boolean
  validate?: (tag: string) => boolean | string
  delimiter?: string | RegExp
  className?: string
  tagClassName?: string
  inputClassName?: string
  onTagAdd?: (tag: string) => void
  onTagRemove?: (tag: string, index: number) => void
  disabled?: boolean
  readOnly?: boolean
  ref?: React.Ref<HTMLInputElement>
}

function TagInput({
  value = [],
  onChange,
  placeholder = 'Add a tag...',
  maxTags,
  allowDuplicates = false,
  validate,
  delimiter = /[,\n]/,
  className,
  tagClassName,
  inputClassName,
  onTagAdd,
  onTagRemove,
  disabled,
  readOnly,
  onKeyDown,
  onPaste,
  ref,
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [focusedTagIndex, setFocusedTagIndex] = React.useState<number | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Merge refs
  React.useImperativeHandle(ref, () => inputRef.current!)

  const addTag = React.useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim()

      if (!trimmedTag) {
        return false
      }

      // Check max tags
      if (maxTags && value.length >= maxTags) {
        setError(`Maximum ${maxTags} tags allowed`)
        return false
      }

      // Check duplicates
      if (!allowDuplicates && value.includes(trimmedTag)) {
        setError('Tag already exists')
        return false
      }

      // Validate tag
      if (validate) {
        const validationResult = validate(trimmedTag)
        if (validationResult !== true) {
          setError(typeof validationResult === 'string' ? validationResult : 'Invalid tag')
          return false
        }
      }

      const newTags = [...value, trimmedTag]
      onChange?.(newTags)
      onTagAdd?.(trimmedTag)
      setInputValue('')
      setError(null)
      return true
    },
    [value, onChange, maxTags, allowDuplicates, validate, onTagAdd]
  )

  const removeTag = React.useCallback(
    (index: number) => {
      const removedTag = value[index]
      const newTags = value.filter((_, i) => i !== index)
      onChange?.(newTags)
      onTagRemove?.(removedTag, index)
      setFocusedTagIndex(null)
    },
    [value, onChange, onTagRemove]
  )

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      setError(null)

      // Check for delimiter
      if (delimiter && delimiter.test(input)) {
        const parts = input.split(delimiter)
        let success = true

        parts.forEach(part => {
          if (part.trim()) {
            success = addTag(part) && success
          }
        })

        if (success) {
          setInputValue('')
        } else {
          setInputValue(input)
        }
      } else {
        setInputValue(input)
      }
    },
    [delimiter, addTag]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag(inputValue)
      } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        if (focusedTagIndex !== null) {
          removeTag(focusedTagIndex)
        } else {
          setFocusedTagIndex(value.length - 1)
        }
      } else if (e.key === 'ArrowLeft' && !inputValue) {
        if (focusedTagIndex === null) {
          setFocusedTagIndex(value.length - 1)
        } else if (focusedTagIndex > 0) {
          setFocusedTagIndex(focusedTagIndex - 1)
        }
      } else if (e.key === 'ArrowRight' && !inputValue) {
        if (focusedTagIndex !== null) {
          if (focusedTagIndex < value.length - 1) {
            setFocusedTagIndex(focusedTagIndex + 1)
          } else {
            setFocusedTagIndex(null)
            inputRef.current?.focus()
          }
        }
      } else if (e.key === 'Delete' && focusedTagIndex !== null) {
        removeTag(focusedTagIndex)
      } else {
        setFocusedTagIndex(null)
      }

      onKeyDown?.(e)
    },
    [inputValue, value, focusedTagIndex, addTag, removeTag, onKeyDown]
  )

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedText = e.clipboardData.getData('text')

      if (delimiter) {
        const parts = pastedText.split(delimiter)
        parts.forEach(part => {
          if (part.trim()) {
            addTag(part)
          }
        })
      } else {
        addTag(pastedText)
      }

      onPaste?.(e)
    },
    [delimiter, addTag, onPaste]
  )

  const handleContainerClick = React.useCallback(() => {
    inputRef.current?.focus()
    setFocusedTagIndex(null)
  }, [])

  const handleTagClick = React.useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setFocusedTagIndex(index)
  }, [])

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex min-h-[2.5rem] w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        onClick={handleContainerClick}
      >
        {value.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`}
            variant="secondary"
            className={cn(
              'gap-1 pr-1.5',
              focusedTagIndex === index && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
              tagClassName
            )}
            onClick={e => handleTagClick(index, e)}
          >
            <span className="text-xs">{tag}</span>
            {!readOnly && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ms-1 h-3 w-3 p-0 hover:bg-transparent"
                onClick={e => {
                  e.stopPropagation()
                  removeTag(index)
                }}
                disabled={disabled}
              >
                <X className="h-2.5 w-2.5" />
                <span className="sr-only">Remove tag</span>
              </Button>
            )}
          </Badge>
        ))}
        {!readOnly && !disabled && (!maxTags || value.length < maxTags) && (
          <Input
            {...props}
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={value.length === 0 ? placeholder : ''}
            className={cn(
              'h-auto flex-1 border-0 bg-transparent p-0 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'min-w-[80px]',
              inputClassName
            )}
            disabled={disabled}
          />
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
TagInput.displayName = 'TagInput'

export { TagInput }
