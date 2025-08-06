import { MemoryRouter } from 'react-router-dom'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DataDisplayPage } from '../ui/DataDisplayPage'

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>
}

describe('DataDisplayPage', () => {
  it('renders page header with title and description', () => {
    render(<DataDisplayPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Data Display Components')).toBeInTheDocument()
    expect(
      screen.getByText('Components for displaying structured data, tables, and information.')
    ).toBeInTheDocument()
  })

  it('renders data table section', () => {
    render(<DataDisplayPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Data Table')).toBeInTheDocument()
    expect(screen.getByText('Displaying tabular data with headers and rows')).toBeInTheDocument()
  })

  it('displays sample user data', () => {
    render(<DataDisplayPage />, { wrapper: createWrapper() })

    // Sample data from the component
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('shows user roles and statuses', () => {
    render(<DataDisplayPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getAllByText('User')).toHaveLength(2)
    expect(screen.getAllByText('Active')).toHaveLength(2)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('applies responsive layout classes', () => {
    const { container } = render(<DataDisplayPage />, { wrapper: createWrapper() })

    const mainContainer = screen.getByText('Data Display Components').closest('.container')
    expect(mainContainer).toHaveClass('mx-auto', 'py-6', 'space-y-8')

    // The grid is not a direct ancestor of "Data Table" text, so we need to find it differently
    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('gap-6', 'md:grid-cols-2')
  })

  it('renders various UI components for demonstration', () => {
    render(<DataDisplayPage />, { wrapper: createWrapper() })

    // This page showcases various UI components
    // We can verify that cards, tables, and other components are rendered
    const cards = document.querySelectorAll('[class*="card"]')
    expect(cards.length).toBeGreaterThan(0)

    // Tables should be present
    const tables = document.querySelectorAll('table')
    expect(tables.length).toBeGreaterThan(0)
  })
})
