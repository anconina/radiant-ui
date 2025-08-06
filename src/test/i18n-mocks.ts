/**
 * Comprehensive i18n mock translations for testing
 * This provides actual English text instead of translation keys
 */
import { vi } from 'vitest'

export const mockTranslations = {
  // Common namespace
  common: {
    'app.name': 'Radiant UI',
    'app.description': 'Modern React application',
    'status.online': 'Online',
    'messages.and': 'and',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'close': 'Close',
    'search': 'Search',
    'filter': 'Filter',
    'refresh': 'Refresh',
    'export': 'Export',
    'import': 'Import',
  },
  
  // Auth namespace
  auth: {
    'login.welcomeBack': 'Welcome back',
    'login.signInToAccount': 'Sign in to your account',
    'login.email': 'Email',
    'login.emailPlaceholder': 'Enter your email',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Enter your password',
    'login.rememberMeDays': 'Remember me for 30 days',
    'login.submit': 'Sign In',
    'login.signingIn': 'Signing in...',
    'login.forgotPassword': 'Forgot password?',
    'login.orContinueWith': 'Or continue with',
    'login.continueWithApple': 'Continue with Apple',
    'login.continueWithGoogle': 'Continue with Google',
    'login.continueWithGithub': 'Continue with GitHub',
    'login.dontHaveAccount': "Don't have an account?",
    'login.signUp': 'Sign up',
    'login.testimonial.quote': 'This platform has transformed our business',
    'login.testimonial.author': 'Jane Doe, CEO',
    'login.demoCredentials': 'Demo Credentials',
    'login.byContinuing': 'By continuing, you agree to our',
    'login.termsOfService': 'Terms of Service',
    'login.privacyPolicy': 'Privacy Policy',
    'login.error': 'Invalid email or password',
    'login.showPassword': 'Show password',
    'login.hidePassword': 'Hide password',
    
    'register.title': 'Create your account',
    'register.subtitle': 'Get started with your free account',
    'register.firstName': 'First Name',
    'register.lastName': 'Last Name',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.placeholders.firstName': 'Enter your first name',
    'register.placeholders.lastName': 'Enter your last name',
    'register.placeholders.email': 'Enter your email',
    'register.placeholders.password': 'Enter your password',
    'register.placeholders.confirmPassword': 'Confirm your password',
    'register.submit': 'Create Account',
    'register.error': 'Registration failed',
  },
  
  // Dashboard namespace
  dashboard: {
    'title': 'Dashboard',
    'subtitle': 'Your business at a glance',
    'welcome': 'Welcome back',
    'totalRevenue': 'Total Revenue',
    'totalUsers': 'Total Users',
    'totalOrders': 'Total Orders',
    'activeNow': 'Active Now',
    'period.week': 'This Week',
    'period.month': 'This Month',
    'period.year': 'This Year',
    'stats.revenue': 'Total Revenue',
    'stats.users': 'Active Users',
    'stats.orders': 'New Orders',
    'stats.growth': 'Growth Rate',
    'charts.revenue': 'Revenue Overview',
    'charts.activity': 'User Activity',
    'charts.sales': 'Recent Sales',
    'charts.products': 'Top Products',
    'actions.refresh': 'Refresh Data',
    'actions.export': 'Export Report',
    'actions.filter': 'Filter',
    'loading': 'Loading dashboard...',
    'error': 'Failed to load dashboard data',
    'today': 'Today',
    'thisWeek': 'This Week',
    'thisMonth': 'This Month',
  },
  
  // Settings namespace - properly nested structure
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account settings and preferences',
    pageTitle: 'Settings',
    pageDescription: 'Manage your account settings and preferences',
    button: {
      save: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
    },
    actions: {
      saveChanges: 'Save Changes',
      saving: 'Saving...',
    },
    messages: {
      settingsSaved: 'Settings saved successfully',
    },
    toast: {
      success: 'Settings saved successfully',
      error: 'Failed to save settings',
    },
    tabs: {
      appearance: 'Appearance',
      language: 'Language',
      notifications: 'Notifications',
      privacy: 'Privacy',
    },
    appearance: {
      title: 'Appearance',
      description: 'Customize the look and feel of the application',
      colorTheme: 'Color Theme',
      fontSize: 'Font Size',
      reducedMotion: 'Reduce Motion',
      highContrast: 'High Contrast Mode',
      themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
    },
    language: {
      title: 'Language & Region',
      description: 'Set your language and regional preferences',
      language: 'Display Language',
      displayLanguage: 'Display Language',
      dateFormat: 'Date Format',
      timeFormat: 'Time Format',
      timezone: 'Timezone',
      firstDayOfWeek: 'First Day of Week',
    },
    notifications: {
      title: 'Notifications',
      description: 'Configure how you receive notifications',
      types: {
        updates: {
          label: 'Product Updates',
          description: 'Get notified about new features and updates',
        },
        security: {
          label: 'Security Alerts',
          description: 'Important security notifications',
        },
        marketing: {
          label: 'Marketing',
          description: 'Promotional offers and newsletters',
        },
        reminders: {
          label: 'Reminders',
          description: 'Task and event reminders',
        },
      },
      channels: {
        email: 'Email',
        push: 'Push',
        sms: 'SMS',
      },
      quietHours: 'Quiet Hours',
      enableQuietHours: 'Enable Quiet Hours',
    },
    privacy: {
      title: 'Privacy',
      description: 'Manage your privacy settings and data sharing',
      profileVisibility: 'Profile Visibility',
      showEmail: 'Show Email Address',
      showActivity: 'Show Activity Status',
      allowMessages: 'Allow Direct Messages',
      visibility: {
        public: 'Public',
        private: 'Private',
        friends: 'Friends Only',
      },
    },
  },
  
  // Admin namespace
  admin: {
    'dashboard.title': 'Admin Dashboard',
    'dashboard.description': 'Manage users, settings, and system configuration',
    'users.total': 'Total Users',
    'users.active': 'Active Users',
    'users.new': 'New Users',
    'sessions.active': 'Active Sessions',
    'security.alerts': 'Security Alerts',
    'api.requests': 'API Requests',
    'management.users': 'User Management',
    'management.roles': 'Manage Roles',
    'configuration.system': 'System Configuration',
    'configuration.email': 'Email Configuration',
    'configuration.api': 'API Settings',
  },
  
  // Profile namespace
  profile: {
    'title': 'Profile',
    'subtitle': 'Manage your profile information',
    'personalInfo': 'Personal Information',
    'accountSettings': 'Account Settings',
    'security': 'Security',
    'preferences': 'Preferences',
  },
  
  // Navigation namespace
  navigation: {
    'home': 'Home',
    'dashboard': 'Dashboard',
    'profile': 'Profile',
    'settings': 'Settings',
    'admin': 'Admin',
    'logout': 'Logout',
    'help': 'Help',
    'notifications': 'Notifications',
  },
};

// Helper function to get nested translation
export function getTranslation(key: string): string {
  const parts = key.split('.')
  let current: any = mockTranslations
  
  // First check if it includes a namespace prefix
  const namespaceMatch = key.match(/^(\w+):(.+)/)
  if (namespaceMatch) {
    const [, namespace, actualKey] = namespaceMatch
    current = current[namespace]
    if (!current) return key
    return getTranslation(actualKey)
  }
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return key // Return the key if translation not found
    }
  }
  
  return typeof current === 'string' ? current : key
}

// Mock implementation for useTranslation hook
export function createMockUseTranslation(namespace?: string) {
  return () => ({
    t: (key: string) => {
      if (namespace) {
        return getTranslation(`${namespace}.${key}`)
      }
      return getTranslation(key)
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  })
}

// Export for use in tests
export const mockUseTranslation = createMockUseTranslation()