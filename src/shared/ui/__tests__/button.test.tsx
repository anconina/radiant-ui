import { render, screen } from '@/test/utils'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary', 'text-primary-foreground')

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive', 'text-white')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border', 'bg-background')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary', 'text-secondary-foreground')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')

    rerender(<Button variant="link">Link</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-primary', 'underline-offset-4')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="default">Default</Button>)
    // Default size includes responsive variants
    const defaultButton = screen.getByRole('button')
    expect(defaultButton).toHaveClass('px-4', 'py-2')
    expect(defaultButton.className).toMatch(/h-11.*sm:h-9|h-9/)

    rerender(<Button size="sm">Small</Button>)
    const smallButton = screen.getByRole('button')
    expect(smallButton).toHaveClass('px-3')
    expect(smallButton.className).toMatch(/h-8/)

    rerender(<Button size="lg">Large</Button>)
    const largeButton = screen.getByRole('button')
    expect(largeButton).toHaveClass('px-6')
    expect(largeButton.className).toMatch(/h-10|h-11.*sm:h-10/)

    rerender(<Button size="icon">Icon</Button>)
    const iconButton = screen.getByRole('button')
    expect(iconButton.className).toMatch(/size-9|size-11.*sm:size-9/)
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const { user } = render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: /disabled/i })

    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('renders as a child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )

    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    // Should have button classes
    expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('accepts additional className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>Ref Button</Button>)
    expect(ref).toHaveBeenCalled()
  })
})
