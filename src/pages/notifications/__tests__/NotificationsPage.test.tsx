import { MemoryRouter } from 'react-router-dom'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotificationsPage } from '../ui/NotificationsPage'

// Mock i18n
vi.mock('@/shared/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        // Page translations
        'page.title': 'Notifications',
        'page.description': 'Stay updated with your latest activities and alerts',
        
        // Stats translations
        'stats.total': 'Total',
        'stats.unread': 'Unread',
        'stats.thisWeek': 'This Week',
        'stats.actions': 'Actions',
        'stats.total.description': 'All notifications',
        'stats.unread.description': 'Requires attention',
        'stats.thisWeek.description': 'Recent updates',
        'stats.actions.description': 'Require action',
        
        // Filter translations
        'filter.button': 'Filter',
        'filter.label': 'Filter by',
        'filter.all': 'All',
        'filter.unread': 'Unread',
        
        // Action translations
        'actions.markAllRead': 'Mark all as read',
        'actions.clearAll': 'Clear all',
        'actions.markAsRead': 'Mark as read',
        'actions.delete': 'Delete',
        
        // Empty state
        'empty.title': 'No notifications',
        'empty.description': 'You have no notifications at this time',
        'empty.filtered': 'No notifications match your filter',
        
        // Mock notification content
        'mock.paymentReceived.title': 'Payment Received',
        'mock.paymentReceived.message': 'You have received a payment of $500 from John Doe',
        'mock.paymentReceived.action': 'View details',
        'mock.newFeature.title': 'New Feature Available',
        'mock.newFeature.message': 'Check out the new dashboard analytics feature',
        'mock.newFeature.action': 'Learn more',
        'mock.securityAlert.title': 'Security Alert',
        'mock.securityAlert.message': 'Unusual login activity detected from a new device',
        'mock.securityAlert.action': 'Review activity',
        'mock.systemUpdate.title': 'System Update',
        'mock.systemUpdate.message': 'System maintenance scheduled for tomorrow at 2 AM',
        'mock.welcome.title': 'Welcome to the Platform',
        'mock.welcome.message': 'Get started with our quick tour of the features',
        'mock.welcome.action': 'Start tour',
        'mock.teamInvite.title': 'Team Invitation',
        'mock.teamInvite.message': 'Sarah Johnson invited you to join the Marketing team',
        'mock.teamInvite.action': 'Accept invite',
        'mock.report.title': 'Monthly Report Ready',
        'mock.report.message': 'Your monthly analytics report is ready to download',
        'mock.report.action': 'Download',
        'mock.reminder.title': 'Meeting Reminder',
        'mock.reminder.message': 'Team standup meeting in 15 minutes',
        
        // Time formatting
        'time.ago': '{{time}} ago',
        'time.days': '{{count}} days',
        'time.hours': '{{count}} hours',
        'time.minutes': '{{count}} minutes',
      }
      
      // Handle parameterized translations
      if (params && typeof translations[key] === 'string') {
        let result = translations[key]
        Object.keys(params).forEach(param => {
          result = result.replace(`{{${param}}}`, params[param])
        })
        return result
      }
      
      return translations[key] || key
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
}))

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header with title and description', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(
      screen.getByText('Stay updated with your latest activities and alerts')
    ).toBeInTheDocument()
  })

  it('renders stats cards with correct calculations', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Total notifications (8 in mock data)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('All notifications')).toBeInTheDocument()

    // Unread notifications (2 in mock data: Payment Received and New Feature)
    expect(screen.getByText('Unread')).toBeInTheDocument()
    expect(screen.getAllByText('2')).toHaveLength(2) // One in badge, one in count
    expect(screen.getByText('Requires attention')).toBeInTheDocument()

    // This week notifications
    expect(screen.getByText('This Week')).toBeInTheDocument()

    // Action notifications (notifications with action property)
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Require action')).toBeInTheDocument()
  })

  it('displays all notifications with correct content', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Check for specific notifications from mock data
    expect(screen.getByText('Payment Received')).toBeInTheDocument()
    expect(
      screen.getByText('You have received a payment of $500 from John Doe')
    ).toBeInTheDocument()

    expect(screen.getByText('New Feature Available')).toBeInTheDocument()
    expect(screen.getByText('Check out the new dashboard analytics feature')).toBeInTheDocument()

    expect(screen.getByText('Security Alert')).toBeInTheDocument()
    expect(screen.getByText('Unusual login activity detected from a new device')).toBeInTheDocument()

    expect(screen.getByText('System Update')).toBeInTheDocument()
    expect(screen.getByText('System maintenance scheduled for tomorrow at 2 AM')).toBeInTheDocument()
  })

  it('shows correct notification types and badges', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Check for type badges
    expect(screen.getByText('success')).toBeInTheDocument()
    expect(screen.getAllByText('info')).toHaveLength(3) // 3 info notifications
    expect(screen.getByText('warning')).toBeInTheDocument()
    expect(screen.getByText('error')).toBeInTheDocument()

    // Check for "New" badges on unread notifications
    expect(screen.getAllByText('New')).toHaveLength(2) // 2 unread notifications
  })

  it('displays user avatars and initials correctly', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Check for user initials in avatars (JD for John Doe, SJ for Sarah Johnson)
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByText('SJ')).toBeInTheDocument()
  })

  it('formats timestamps correctly', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Mock dates should be formatted as relative time
    // Since we're using mock dates, we should see formatted timestamps
    expect(screen.getByText(/\d+ (minute|hour|day)s? ago/)).toBeInTheDocument()
  })

  it('filters notifications by unread status', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Open filter dropdown
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)

    // Click "Unread only"
    const unreadFilter = screen.getByText('Unread only')
    await user.click(unreadFilter)

    await waitFor(() => {
      // Should only show unread notifications (Payment Received and New Feature Available)
      expect(screen.getByText('Payment Received')).toBeInTheDocument()
      expect(screen.getByText('New Feature Available')).toBeInTheDocument()

      // Should not show read notifications
      expect(screen.queryByText('Security Alert')).not.toBeInTheDocument()
      expect(screen.queryByText('Payment Failed')).not.toBeInTheDocument()
    })
  })

  it('marks individual notifications as read', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Find the first unread notification and open its actions menu
    const actionButtons = screen.getAllByRole('button', { name: /actions/i })
    await user.click(actionButtons[0])

    // Click "Mark as read"
    const markAsReadButton = screen.getByText('Mark as read')
    await user.click(markAsReadButton)

    await waitFor(() => {
      // The "New" badge should be removed from that notification
      expect(screen.getAllByText('New')).toHaveLength(1) // Only 1 unread left
    })
  })

  it('marks all notifications as read', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Click "Mark all as read" button
    const markAllButton = screen.getByRole('button', { name: /mark all as read/i })
    await user.click(markAllButton)

    await waitFor(() => {
      // No "New" badges should remain
      expect(screen.queryByText('New')).not.toBeInTheDocument()

      // Unread count should be 0
      expect(screen.getAllByText('0')).toHaveLength(2) // In badge and count
    })
  })

  it('deletes individual notifications', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Open actions menu for first notification
    const actionButtons = screen.getAllByRole('button', { name: /actions/i })
    await user.click(actionButtons[0])

    // Click delete
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    await waitFor(() => {
      // Total count should decrease
      expect(screen.getByText('7')).toBeInTheDocument() // Total was 8, now 7
    })
  })

  it('clears all notifications', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Click "Clear all" button
    const clearAllButton = screen.getByRole('button', { name: /clear all/i })
    await user.click(clearAllButton)

    await waitFor(() => {
      // Should show empty state
      expect(screen.getByText('No notifications to display')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // Total count should be 0
    })
  })

  it('shows empty state when no notifications match filter', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // First mark all as read
    const markAllButton = screen.getByRole('button', { name: /mark all as read/i })
    await user.click(markAllButton)

    // Then filter by unread
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)

    const unreadFilter = screen.getByText('Unread only')
    await user.click(unreadFilter)

    await waitFor(() => {
      expect(screen.getByText('No unread notifications')).toBeInTheDocument()
    })
  })

  it('displays action buttons for notifications with actions', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Check for action buttons
    expect(screen.getByText('View transaction')).toBeInTheDocument()
    expect(screen.getByText('Learn more')).toBeInTheDocument()
    expect(screen.getByText('Review activity')).toBeInTheDocument()
    expect(screen.getByText('Update payment')).toBeInTheDocument()
    expect(screen.getByText('Upgrade plan')).toBeInTheDocument()
  })

  it('highlights unread notifications with different background', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Unread notifications should have bg-muted/20 class
    const paymentNotification = screen
      .getByText('Payment Received')
      .closest('[class*="bg-muted/20"]')
    expect(paymentNotification).toBeInTheDocument()

    const featureNotification = screen
      .getByText('New Feature Available')
      .closest('[class*="bg-muted/20"]')
    expect(featureNotification).toBeInTheDocument()
  })

  it('shows correct notification icons by type', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // All notifications should have proper icons
    // Since icons are rendered as SVG elements, we check for their containers
    const notificationItems = screen.getAllByText(/Payment|Feature|Security|Profile|Team|Storage/)
    expect(notificationItems.length).toBeGreaterThan(0)

    // Each notification should have either an avatar or an icon
    const iconContainers = document.querySelectorAll('.h-10.w-10')
    expect(iconContainers.length).toBeGreaterThanOrEqual(8) // 8 notifications
  })

  it('calculates this week notifications correctly', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    // Mock notifications are from March 2024, which should be calculated properly
    // The exact number depends on the current date when test runs, but should show a number
    const thisWeekCard = screen.getByText('This Week').closest('.card')
    expect(thisWeekCard).toBeInTheDocument()

    // Should have some numeric value displayed
    const thisWeekValue = thisWeekCard?.querySelector('.text-2xl.font-bold')
    expect(thisWeekValue).toBeInTheDocument()
  })

  it('shows "from" information for notifications with senders', () => {
    render(<NotificationsPage />, { wrapper: createWrapper() })

    expect(screen.getByText('from John Doe')).toBeInTheDocument()
    expect(screen.getByText('from Sarah Johnson')).toBeInTheDocument()
  })
})
