import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { AspectRatioContainer, ResponsiveContainer, ResponsiveGrid } from '@/shared/ui/responsive'
import {
  Show,
  ShowAbove,
  ShowBelow,
  ShowForDevice,
  ShowForHover,
  ShowForOrientation,
  ShowForTouch,
} from '@/shared/ui/responsive'
import {
  useBreakpoint,
  useDeviceType,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useMediaQuery,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useResponsive,
  useResponsiveValue,
} from '@/shared/ui/responsive'

export default function ResponsiveDemoPage() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const prefersReducedMotion = usePrefersReducedMotion()
  const prefersDarkMode = usePrefersDarkMode()
  const breakpointData = useBreakpoint()
  const deviceType = useDeviceType()

  const columns = useResponsiveValue(1, 2, 3, 4, 6)
  const fontSize = useResponsive({
    base: '14px',
    sm: '16px',
    md: '18px',
    lg: '20px',
  })

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Responsive Design Utilities</h1>
        <p className="text-muted-foreground">
          Comprehensive responsive design system with viewport and container queries
        </p>
      </div>

      {/* Current Device Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Breakpoint</p>
              <p className="font-medium">{breakpointData.breakpoint}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Device Type</p>
              <p className="font-medium">{deviceType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dark Mode</p>
              <p className="font-medium">{prefersDarkMode ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reduced Motion</p>
              <p className="font-medium">{prefersReducedMotion ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Visibility Components */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Visibility</CardTitle>
          <CardDescription>Components that show/hide based on viewport conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ShowAbove breakpoint="md">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
              ✅ Visible on medium screens and above (≥768px)
            </div>
          </ShowAbove>

          <ShowBelow breakpoint="lg">
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
              ✅ Visible on screens below large (＜1024px)
            </div>
          </ShowBelow>

          <ShowForDevice device="mobile">
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded">
              📱 You're on a mobile device
            </div>
          </ShowForDevice>

          <ShowForDevice device="tablet">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
              📱 You're on a tablet device
            </div>
          </ShowForDevice>

          <ShowForDevice device="desktop">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded">
              💻 You're on a desktop device
            </div>
          </ShowForDevice>

          <ShowForOrientation orientation="portrait">
            <div className="p-4 bg-pink-100 dark:bg-pink-900 rounded">📱 Portrait orientation</div>
          </ShowForOrientation>

          <ShowForOrientation orientation="landscape">
            <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded">
              📱 Landscape orientation
            </div>
          </ShowForOrientation>

          <ShowForTouch>
            <div className="p-4 bg-teal-100 dark:bg-teal-900 rounded">👆 Touch device detected</div>
          </ShowForTouch>

          <ShowForHover>
            <div className="p-4 bg-cyan-100 dark:bg-cyan-900 rounded">
              🖱️ Hover-capable device detected
            </div>
          </ShowForHover>
        </CardContent>
      </Card>

      {/* Container Queries Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Container Queries</CardTitle>
          <CardDescription>
            Components that respond to their container size, not viewport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResponsiveContainer className="border rounded p-4">
              {state => (
                <div>
                  <h4 className="font-medium mb-2">Container Info</h4>
                  <p className="text-sm">Size: {state.size}</p>
                  <p className="text-sm">Width: {Math.round(state.width)}px</p>
                  <p className="text-sm">Height: {Math.round(state.height)}px</p>
                  <p className="text-sm">Orientation: {state.orientation}</p>
                  <p className="text-sm">Aspect Ratio: {state.aspectRatio.toFixed(2)}</p>
                </div>
              )}
            </ResponsiveContainer>

            <ResponsiveContainer className="border rounded p-4">
              {state => (
                <div
                  className={`
                  ${state.size === 'xs' ? 'text-xs' : ''}
                  ${state.size === 'sm' ? 'text-sm' : ''}
                  ${state.size === 'md' ? 'text-base' : ''}
                  ${state.size === 'lg' ? 'text-lg' : ''}
                  ${state.size === 'xl' ? 'text-xl' : ''}
                `}
                >
                  <h4 className="font-medium mb-2">Responsive Text</h4>
                  <p>This text size changes based on container width!</p>
                  <p className="mt-2">
                    Current container size: <strong>{state.size}</strong>
                  </p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Grid Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Grid</CardTitle>
          <CardDescription>Grid that adapts columns based on container width</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }} gap="1rem">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="bg-secondary p-4 rounded text-center">
                Item {i + 1}
              </div>
            ))}
          </ResponsiveGrid>
        </CardContent>
      </Card>

      {/* Aspect Ratio Containers */}
      <Card>
        <CardHeader>
          <CardTitle>Aspect Ratio Containers</CardTitle>
          <CardDescription>
            Maintain consistent aspect ratios across different sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">16:9 Video</p>
              <AspectRatioContainer ratio="16/9" className="bg-secondary rounded overflow-hidden">
                <div className="flex items-center justify-center h-full">
                  <span className="text-2xl">16:9</span>
                </div>
              </AspectRatioContainer>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">1:1 Square</p>
              <AspectRatioContainer ratio="1/1" className="bg-secondary rounded overflow-hidden">
                <div className="flex items-center justify-center h-full">
                  <span className="text-2xl">1:1</span>
                </div>
              </AspectRatioContainer>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">4:3 Classic</p>
              <AspectRatioContainer ratio="4/3" className="bg-secondary rounded overflow-hidden">
                <div className="flex items-center justify-center h-full">
                  <span className="text-2xl">4:3</span>
                </div>
              </AspectRatioContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Values Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Values</CardTitle>
          <CardDescription>Values that change based on viewport size</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Responsive Columns</p>
            <div className="p-4 bg-secondary rounded">
              This container has <strong>{columns}</strong> columns
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Responsive Font Size</p>
            <div className="p-4 bg-secondary rounded" style={{ fontSize }}>
              This text size changes with viewport: {fontSize}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Responsive Classes</p>
            <div className="space-y-2">
              <p className="text-responsive-sm">Responsive small text (clamp based)</p>
              <p className="text-responsive-base">Responsive base text (clamp based)</p>
              <p className="text-responsive-lg">Responsive large text (clamp based)</p>
              <p className="text-responsive-xl">Responsive XL text (clamp based)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Hook Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded text-sm overflow-x-auto">
            {`// Media Query Hooks
const isMobile = useIsMobile()
const isTablet = useIsTablet()
const isDesktop = useIsDesktop()
const prefersReducedMotion = usePrefersReducedMotion()

// Responsive Value Hook
const columns = useResponsiveValue(1, 2, 3, 4, 6)
const padding = useResponsive({
  base: '1rem',
  sm: '1.5rem',
  md: '2rem',
  lg: '3rem'
})

// Container Query Hook
const [ref, matches, dimensions] = useContainerQuery({
  width: 768,
  orientation: 'landscape'
})

// Breakpoint Detection
const breakpoint = useBreakpoint() // 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
const deviceType = useDeviceType() // 'mobile' | 'tablet' | 'desktop'`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
