import * as React from 'react'

import { cn } from '@/shared/lib/utils'

// Mobile-optimized table component that uses CSS-based responsive design
interface ResponsiveTableProps extends React.HTMLAttributes<HTMLTableElement> {
  mobileLayout?: 'cards' | 'scroll' | 'stack'
}

export function ResponsiveTable({
  className,
  mobileLayout = 'cards',
  children,
  ...props
}: ResponsiveTableProps) {
  if (mobileLayout === 'scroll') {
    return (
      <div className="overflow-x-auto -mx-4 px-4">
        <table
          className={cn('w-full min-w-full', className)}
          data-testid="responsive-table"
          {...props}
        >
          {children}
        </table>
      </div>
    )
  }

  // Always render proper table structure for valid HTML and no hydration issues
  return (
    <div className={mobileLayout === 'cards' ? 'responsive-table-cards' : ''}>
      <table className={cn('w-full', className)} data-testid="responsive-table" {...props}>
        {children}
      </table>
      {mobileLayout === 'cards' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @media (max-width: 640px) {
              .responsive-table-cards table {
                display: block;
                width: 100%;
              }
              .responsive-table-cards thead {
                display: none;
              }
              .responsive-table-cards tbody {
                display: block;
              }
              .responsive-table-cards tr {
                display: block;
                border: 1px solid hsl(var(--border));
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
                background: hsl(var(--card));
                box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
              }
              .responsive-table-cards td {
                display: block;
                padding: 8px 0;
                border: none;
                text-align: start;
              }
              .responsive-table-cards td[data-label]:before {
                content: attr(data-label) ": ";
                font-weight: 500;
                color: hsl(var(--muted-foreground));
                display: inline-block;
                min-width: 80px;
                margin-inline-end: 12px;
              }
            }
          `,
          }}
        />
      )}
    </div>
  )
}

// Table header - always renders proper thead element
export function ResponsiveTableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b', className)} {...props} />
}

// Table body wrapper - always renders proper tbody element
export function ResponsiveTableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />
}

// Table row - always renders proper tr element
export function ResponsiveTableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b transition-colors hover:bg-muted/50', className)} {...props} />
}

// Table header cell
export function ResponsiveTableHead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-10 px-2 text-left align-middle font-medium text-muted-foreground',
        '[&:has([role=checkbox])]:pr-0',
        '[&>[role=checkbox]]:translate-y-[2px]',
        // Mobile-first padding
        'px-2 sm:px-4',
        className
      )}
      {...props}
    />
  )
}

// Table cell that shows labels on mobile card layout using data attributes
interface ResponsiveTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  mobileLabel?: string
}

export function ResponsiveTableCell({
  className,
  mobileLabel,
  children,
  ...props
}: ResponsiveTableCellProps) {
  return (
    <td
      className={cn(
        'p-2 align-middle',
        '[&:has([role=checkbox])]:pr-0',
        '[&>[role=checkbox]]:translate-y-[2px]',
        'p-2 sm:p-4',
        className
      )}
      data-label={mobileLabel}
      {...props}
    >
      {children}
    </td>
  )
}

// Example usage component
export function ResponsiveTableExample() {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  ]

  return (
    <ResponsiveTable mobileLayout="cards">
      <ResponsiveTableHeader>
        <ResponsiveTableRow>
          <ResponsiveTableHead>Name</ResponsiveTableHead>
          <ResponsiveTableHead>Email</ResponsiveTableHead>
          <ResponsiveTableHead>Role</ResponsiveTableHead>
        </ResponsiveTableRow>
      </ResponsiveTableHeader>
      <ResponsiveTableBody>
        {data.map(row => (
          <ResponsiveTableRow key={row.id}>
            <ResponsiveTableCell mobileLabel="Name">{row.name}</ResponsiveTableCell>
            <ResponsiveTableCell mobileLabel="Email">{row.email}</ResponsiveTableCell>
            <ResponsiveTableCell mobileLabel="Role">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {row.role}
              </span>
            </ResponsiveTableCell>
          </ResponsiveTableRow>
        ))}
      </ResponsiveTableBody>
    </ResponsiveTable>
  )
}
