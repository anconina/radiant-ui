# Contributing to Radiant UI

Thank you for your interest in contributing to Radiant UI! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- Git

### Setting Up Your Development Environment

1. **Fork the repository**

   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/radiant-ui.git
   cd radiant-ui
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/radiant-ui.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 💻 Development Process

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

Examples:

- `feature/add-date-picker`
- `fix/button-hover-state`
- `docs/update-readme`

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(button): add loading state
fix(modal): prevent body scroll when open
docs(readme): update installation instructions
```

### Development Workflow

1. **Keep your fork updated**

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the style guidelines
   - Add tests for new features
   - Update documentation as needed

3. **Run tests**

   ```bash
   npm run test
   npm run typecheck
   npm run lint
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure all tests pass**

   ```bash
   npm run test
   npm run e2e
   ```

2. **Check code quality**

   ```bash
   npm run lint
   npm run typecheck
   npm run format
   ```

3. **Update documentation**
   - Add JSDoc comments for new functions
   - Update README if needed
   - Add Storybook stories for new components

### Submitting a Pull Request

1. Go to your fork on GitHub
2. Click "New pull request"
3. Select your feature branch
4. Fill out the PR template:

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have added tests for my changes
- [ ] I have updated the documentation
- [ ] I have added Storybook stories (if applicable)
```

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## 🎨 Style Guidelines

### TypeScript/JavaScript

```typescript
// Use meaningful variable names
const userProfile = await fetchUserProfile(userId)

// Prefer const over let
const MAX_RETRIES = 3

// Use async/await over promises
async function loadData() {
  try {
    const data = await api.getData()
    return data
  } catch (error) {
    handleError(error)
  }
}

// Use optional chaining
const userName = user?.profile?.name ?? 'Anonymous'

// Export types separately
export type ButtonProps = {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md' }: ButtonProps) {
  // Implementation
}
```

### React Components

```typescript
// Use function components with TypeScript
interface ComponentProps {
  title: string
  children: React.ReactNode
}

export function Component({ title, children }: ComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// Use custom hooks for logic
function useCustomHook() {
  const [state, setState] = useState(false)

  const toggle = useCallback(() => {
    setState(prev => !prev)
  }, [])

  return { state, toggle }
}
```

### CSS/Tailwind

```tsx
// Use Tailwind classes
<div className="flex items-center justify-between p-4">
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
</div>

// Group related classes
<div className={`
  flex items-center justify-center
  w-full h-screen
  bg-gray-100 dark:bg-gray-900
`}>
  Content
</div>
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick handler', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Tests

```typescript
import { expect, test } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')

  await page.fill('[name="email"]', 'user@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading')).toHaveText('Dashboard')
})
```

### Testing Best Practices

- Test user behavior, not implementation details
- Use meaningful test descriptions
- Keep tests focused and isolated
- Mock external dependencies
- Test edge cases and error states

## 📚 Documentation

### Component Documentation

````typescript
/**
 * Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export function Button({ variant, size, onClick, children }: ButtonProps) {
  // Implementation
}
````

### Storybook Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
}
```

## 🎯 Areas for Contribution

### Good First Issues

- Adding missing TypeScript types
- Improving component documentation
- Adding unit tests for existing components
- Fixing accessibility issues
- Updating dependencies

### Feature Requests

- New UI components
- Performance optimizations
- Accessibility improvements
- Internationalization enhancements
- Developer experience improvements

### Bug Reports

When reporting bugs, please include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details

## 🙋 Getting Help

- Check existing issues and PRs
- Read the documentation
- Ask questions in discussions
- Join our community chat

## 🎉 Recognition

Contributors will be:

- Added to the contributors list
- Mentioned in release notes
- Given credit in documentation

Thank you for contributing to Radiant UI! 🚀
