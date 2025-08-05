import { MemoryRouter } from 'react-router-dom'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/shared/routes'

import HomePage from '../ui/HomePage'

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>
}

describe('HomePage', () => {
  it('renders hero section with main heading', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    expect(screen.getByText(/Welcome to/)).toBeInTheDocument()
    expect(screen.getByText('Radiant UI')).toBeInTheDocument()
    expect(
      screen.getByText(
        'A modern React template with TypeScript, Vite, and shadcn/ui. Build beautiful, fast, and type-safe applications.'
      )
    ).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    const getStartedButton = screen.getByRole('link', { name: /get started/i })
    expect(getStartedButton).toBeInTheDocument()
    expect(getStartedButton).toHaveAttribute('href', ROUTES.dashboard)

    const githubButton = screen.getByRole('link', { name: /view on github/i })
    expect(githubButton).toBeInTheDocument()
    expect(githubButton).toHaveAttribute('href', 'https://github.com')
    expect(githubButton).toHaveAttribute('target', '_blank')
    expect(githubButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders features grid with all three features', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    // Modern Stack feature
    expect(screen.getByText('Modern Stack')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Built with React 19, TypeScript 5, and Vite 7 for the best developer experience.'
      )
    ).toBeInTheDocument()

    // Type Safe feature
    expect(screen.getByText('Type Safe')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Full TypeScript support with strict mode enabled and comprehensive type definitions.'
      )
    ).toBeInTheDocument()

    // Lightning Fast feature
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Optimized build configuration with code splitting and lazy loading for best performance.'
      )
    ).toBeInTheDocument()
  })

  it('renders bottom CTA section', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    expect(screen.getByText('Ready to build something amazing?')).toBeInTheDocument()
    expect(
      screen.getByText('Start building your next project with Radiant UI today.')
    ).toBeInTheDocument()

    const createAccountButton = screen.getByRole('link', { name: 'Create Account' })
    expect(createAccountButton).toBeInTheDocument()
    expect(createAccountButton).toHaveAttribute('href', ROUTES.register)
  })

  it('applies proper responsive grid layout', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    const featuresGrid = screen.getByText('Modern Stack').closest('.grid')
    expect(featuresGrid).toHaveClass('md:grid-cols-3', 'gap-8')
  })

  it('includes feature icons', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    // Check that feature sections have icon containers
    const modernStackIcon = screen
      .getByText('Modern Stack')
      .closest('div')
      ?.querySelector('.h-12.w-12')
    expect(modernStackIcon).toBeInTheDocument()
    expect(modernStackIcon).toHaveClass(
      'bg-primary/10',
      'rounded-lg',
      'flex',
      'items-center',
      'justify-center',
      'mx-auto'
    )

    const typeSafeIcon = screen.getByText('Type Safe').closest('div')?.querySelector('.h-12.w-12')
    expect(typeSafeIcon).toBeInTheDocument()

    const lightningFastIcon = screen
      .getByText('Lightning Fast')
      .closest('div')
      ?.querySelector('.h-12.w-12')
    expect(lightningFastIcon).toBeInTheDocument()
  })

  it('uses proper button variants and sizes', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    const getStartedButton = screen.getByRole('link', { name: /get started/i })
    expect(getStartedButton.closest('button')).toHaveClass('lg') // size="lg"

    const githubButton = screen.getByRole('link', { name: /view on github/i })
    expect(githubButton.closest('button')).toHaveClass('lg') // size="lg" and variant="outline"
  })

  it('has proper semantic structure', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Welcome to.*Radiant UI/)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ready to build something amazing?'
    )

    // Check for h3 headings in features
    const h3Headings = screen.getAllByRole('heading', { level: 3 })
    expect(h3Headings).toHaveLength(3)
    expect(h3Headings[0]).toHaveTextContent('Modern Stack')
    expect(h3Headings[1]).toHaveTextContent('Type Safe')
    expect(h3Headings[2]).toHaveTextContent('Lightning Fast')
  })

  it('maintains consistent spacing', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    const mainContainer = screen.getByText(/Welcome to/).closest('.space-y-12')
    expect(mainContainer).toBeInTheDocument()

    const heroSection = screen.getByText(/Welcome to/).closest('section')
    expect(heroSection).toHaveClass('text-center', 'py-12')

    const ctaSection = screen.getByText('Ready to build something amazing?').closest('section')
    expect(ctaSection).toHaveClass('text-center', 'py-12', 'bg-muted', 'rounded-lg')
  })

  it('includes arrow icon in get started button', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    const getStartedButton = screen.getByRole('link', { name: /get started/i })
    expect(getStartedButton.querySelector('svg')).toBeInTheDocument()
  })

  it('centers feature content properly', () => {
    render(<HomePage />, { wrapper: createWrapper() })

    const modernStackFeature = screen.getByText('Modern Stack').closest('.text-center.space-y-4')
    expect(modernStackFeature).toBeInTheDocument()

    const typeSafeFeature = screen.getByText('Type Safe').closest('.text-center.space-y-4')
    expect(typeSafeFeature).toBeInTheDocument()

    const lightningFastFeature = screen
      .getByText('Lightning Fast')
      .closest('.text-center.space-y-4')
    expect(lightningFastFeature).toBeInTheDocument()
  })
})
