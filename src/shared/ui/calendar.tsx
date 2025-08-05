'use client'

import * as React from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'
// Import necessary dependencies for DatePicker
import { CalendarIcon } from 'lucide-react'

import { format } from 'date-fns'
import {
  DayPicker,
  DayPickerMultipleProps,
  DayPickerRangeProps,
  DayPickerSingleProps,
} from 'react-day-picker'

import { cn } from '@/shared/lib/utils'

import { Button, buttonVariants } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
          props.mode === 'range'
            ? '[&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-none [&:has([aria-selected]):first-child]:rounded-s-md [&:has([aria-selected]):last-child]:rounded-e-md'
            : '[&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100'
        ),
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }

// Helper component for date range picker
interface DateRangePickerProps {
  from?: Date
  to?: Date
  onSelect?: (range: { from?: Date; to?: Date }) => void
  numberOfMonths?: number
  className?: string
  disabled?: boolean
}

export function DateRangePicker({
  from,
  to,
  onSelect,
  numberOfMonths = 2,
  className,
  disabled,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<{ from?: Date; to?: Date }>({
    from,
    to,
  })

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    const newRange = range || { from: undefined, to: undefined }
    setDate(newRange)
    onSelect?.(newRange)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Calendar
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={handleSelect}
        numberOfMonths={numberOfMonths}
        disabled={disabled}
      />
    </div>
  )
}

// Helper component for single date picker with input
interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onSelect,
  placeholder = 'Pick a date',
  className,
  disabled,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="me-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={newDate => {
            onSelect?.(newDate)
            setIsOpen(false)
          }}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}
