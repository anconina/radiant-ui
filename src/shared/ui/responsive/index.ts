/**
 * Responsive UI components public API
 * Provides responsive container components and visibility hooks
 */

// Responsive components
export { ResponsiveContainer } from './ResponsiveContainer'
export {
  Show,
  ShowAbove,
  ShowBelow,
  ShowBetween,
  ShowForDevice,
  ShowForHover,
  ShowForOrientation,
  ShowForTouch,
} from './Show'

// Placeholder exports that need implementation
export const AspectRatioContainer = ({ children }: { children: React.ReactNode }) => children
export const ResponsiveGrid = ({ children }: { children: React.ReactNode }) => children

// Re-export hooks
export * from './hooks'
