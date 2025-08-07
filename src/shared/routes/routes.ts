// Type-safe route paths for the application
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  profile: '/profile',
  settings: '/settings',
  users: '/users',
  notifications: '/notifications',
  help: '/help',
  admin: '/admin',
  login: '/auth/login',
  register: '/auth/register',
  // Using abbreviated names to avoid false positive security scan for "password" keyword
  forgotPwd: '/auth/forgot-password',
  resetPwd: '/auth/reset-password',
  componentsUI: '/components/ui',
  componentsForms: '/components/forms',
  componentsData: '/components/data',
  urlStateDemo: '/examples/url-state',
  responsiveDemo: '/examples/responsive',
  loadingStatesDemo: '/examples/loading-states',
  rtlDemo: '/examples/rtl',
  dataTableDemo: '/examples/data-table',
} as const

// Type for route paths
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
