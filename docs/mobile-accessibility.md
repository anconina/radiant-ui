# Mobile Accessibility Guidelines

## Overview

This document outlines the mobile accessibility features and best practices implemented in the RadiantUI design system.

## Core Principles

### 1. Touch Target Sizing

- **Minimum Size**: All interactive elements have a minimum touch target of 44x44 pixels (iOS) / 48x48dp (Android)
- **Spacing**: Interactive elements are spaced at least 8px apart to prevent accidental taps
- **Visual vs Touch**: Visual size can be smaller than touch target using padding/margins

```tsx
// Example: Small visual button with proper touch target
<button className="p-3 -m-3">
  {' '}
  // Extends touch area beyond visual bounds
  <Icon className="h-4 w-4" />
</button>
```

### 2. Focus Management

#### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are clearly visible (3px ring with sufficient contrast)
- Tab order follows logical reading order

#### Focus Trapping

- Modals and overlays trap focus within their boundaries
- Escape key closes overlays and returns focus to trigger element

```tsx
import { FocusTrap } from '@/shared/ui/accessibility'

;<FocusTrap active={isModalOpen}>
  <Modal>{/* Modal content */}</Modal>
</FocusTrap>
```

### 3. Screen Reader Support

#### ARIA Labels and Descriptions

- All interactive elements have descriptive labels
- Complex widgets use appropriate ARIA patterns
- Live regions announce dynamic updates

```tsx
import { Announce, VisuallyHidden } from '@/shared/ui/accessibility'

// Announce dynamic changes
<Announce message="Form submitted successfully" priority="polite" />

// Hidden text for screen readers
<button>
  <Icon />
  <VisuallyHidden>Delete item</VisuallyHidden>
</button>
```

### 4. Gesture Support

#### Standard Gestures

- **Swipe**: Navigate between screens or dismiss overlays
- **Long Press**: Show context menus or additional options
- **Double Tap**: Quick actions or zoom
- **Pinch**: Zoom images and maps

#### Implementation

```tsx
import { useSwipeGesture } from '@/shared/hooks/use-swipe-gesture'

const swipeHandlers = useSwipeGesture({
  onSwipeLeft: () => navigateNext(),
  onSwipeRight: () => navigatePrevious(),
  threshold: 0.3,
})
```

### 5. Visual Accessibility

#### Color Contrast

- Text contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have 3:1 contrast ratio against backgrounds
- Don't rely on color alone to convey information

#### Responsive Typography

- Base font size of 16px prevents zoom on iOS
- Fluid typography scales smoothly across devices
- Line heights optimized for readability

```css
/* Fluid typography example */
.text-fluid-base {
  font-size: clamp(1rem, 0.925rem + 0.375vw, 1.125rem);
  line-height: 1.6;
}
```

### 6. Motion and Animation

#### Reduced Motion Support

- Respect user's motion preferences
- Provide alternatives to motion-based interactions
- Essential animations are subtle and purposeful

```tsx
import { useReducedMotion } from '@/shared/hooks/use-mobile-accessibility'

const prefersReducedMotion = useReducedMotion()
const animationClass = prefersReducedMotion ? '' : 'animate-slide-in'
```

### 7. Form Accessibility

#### Mobile-Optimized Forms

- Large, touch-friendly input fields (minimum 56px height)
- Clear labels and error messages
- Proper input types for mobile keyboards
- Floating labels for space efficiency

```tsx
import { MobileFloatingInput } from '@/shared/ui/mobile-form'

;<MobileFloatingInput
  label="Email Address"
  type="email"
  error={errors.email}
  autoComplete="email"
  inputMode="email"
/>
```

### 8. Loading and Progress

#### Loading States

- Clear loading indicators with text alternatives
- Progress information for long operations
- Skeleton screens maintain layout stability

```tsx
import { LoadingState } from '@/shared/ui/accessibility'

;<LoadingState isLoading={isLoading} loadingText="Loading user data...">
  <UserProfile />
</LoadingState>
```

## Testing Checklist

### Manual Testing

- [ ] Test with iOS VoiceOver
- [ ] Test with Android TalkBack
- [ ] Test keyboard navigation
- [ ] Test with browser zoom at 200%
- [ ] Test in high contrast mode
- [ ] Test with reduced motion enabled
- [ ] Verify touch targets are ≥44px
- [ ] Check color contrast ratios

### Automated Testing

```tsx
// Development-only touch target validator
import { TouchTargetValidator } from '@/shared/ui/accessibility'

;<TouchTargetValidator>
  <App />
</TouchTargetValidator>
```

## Common Patterns

### Accessible Navigation

```tsx
<nav aria-label="Main navigation">
  <ul role="list">
    <li>
      <Link to="/home" aria-current={isActive ? 'page' : undefined}>
        Home
      </Link>
    </li>
  </ul>
</nav>
```

### Accessible Images

```tsx
<LazyImage src="/hero.jpg" alt="Description of the image content" loading="lazy" decoding="async" />
```

### Accessible Buttons

```tsx
<IconButton label="Open menu" icon={<MenuIcon />} onClick={handleClick} />
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility)
- [WebAIM Mobile Accessibility](https://webaim.org/articles/mobile/)
