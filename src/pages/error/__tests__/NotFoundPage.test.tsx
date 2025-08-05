import { MemoryRouter } from 'react-router-dom'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/shared/routes'

import NotFoundPage from '../ui/NotFoundPage'

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>
}

describe('NotFoundPage', () => {
  it('renders 404 error message', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() })

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(
      screen.getByText("The page you're looking for doesn't exist or has been moved.")
    ).toBeInTheDocument()
  })

  it('renders go to homepage button', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() })

    const homeButton = screen.getByRole('link', { name: /go to homepage/i })
    expect(homeButton).toBeInTheDocument()
    expect(homeButton).toHaveAttribute('href', ROUTES.home)
  })

  it('applies correct layout and styling classes', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() })

    const container = screen.getByText('404').closest('div')
    expect(container?.parentElement).toHaveClass(
      'min-h-screen',
      'bg-background',
      'flex',
      'items-center',
      'justify-center',
      'px-4'
    )

    const contentContainer = screen.getByText('404').closest('div')
    expect(contentContainer).toHaveClass('max-w-md', 'w-full', 'text-center')
  })

  it('uses proper typography hierarchy', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() })

    const errorCode = screen.getByText('404')
    expect(errorCode).toHaveClass('text-9xl', 'font-bold', 'text-primary')

    const heading = screen.getByText('Page Not Found')
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mt-4', 'mb-2')

    const description = screen.getByText(/doesn't exist or has been moved/)
    expect(description).toHaveClass('text-muted-foreground', 'mb-8')
  })

  it('includes home icon in the button', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() })

    const homeButton = screen.getByRole('link', { name: /go to homepage/i })
    // Check that the button contains an icon (lucide-react Home icon)
    expect(homeButton.querySelector('svg')).toBeInTheDocument()
  })

  it('is accessible', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() })

    // Check that the main error code is properly marked up
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Page Not Found')

    // Check that the call-to-action link is properly labeled
    const homeLink = screen.getByRole('link', { name: /go to homepage/i })
    expect(homeLink).toBeInTheDocument()
  })

  it('maintains responsive design', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() })

    const outerContainer = screen.getByText('404').closest('.min-h-screen')
    expect(outerContainer).toHaveClass('px-4') // Ensures padding on mobile

    const innerContainer = screen.getByText('404').closest('.max-w-md')
    expect(innerContainer).toHaveClass('w-full') // Ensures full width within max constraint
  })
})
