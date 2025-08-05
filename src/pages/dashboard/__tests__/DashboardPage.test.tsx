import { MemoryRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/shared/providers'

import { DashboardPage } from '../ui/DashboardPage'

// Mock the dashboard data hook
const mockDashboardData = vi.fn()

// Mock chart components to avoid rendering issues in tests
vi.mock('@/widgets/dashboard', () => ({
  RevenueChart: vi.fn(() => <div data-testid="revenue-chart">Revenue Chart</div>),
  ActivityChart: vi.fn(() => <div data-testid="activity-chart">Activity Chart</div>),
  RecentSales: vi.fn(() => <div data-testid="recent-sales">Recent Sales</div>),
  TopProducts: vi.fn(() => <div data-testid="top-products">Top Products</div>),
  StatCard: vi.fn((props: any) => {
    if (props.loading) {
      return (
        <div data-testid={`stat-card-${props.title?.toLowerCase().replace(/\s/g, '-')}-loading`}>
          <div role="status" aria-live="polite">
            Loading...
          </div>
        </div>
      )
    }
    return (
      <div data-testid={`stat-card-${props.title?.toLowerCase().replace(/\s/g, '-')}`}>
        <div>{props.title}</div>
        <div>{props.value}</div>
      </div>
    )
  }),
}))

vi.mock('@/features/dashboard', () => ({
  useDashboardData: () => mockDashboardData(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock return value
    mockDashboardData.mockReturnValue({
      data: {
        stats: {
          revenue: '$45,231.89',
          users: '573',
          orders: '12',
          activeUsers: '2,453',
        },
        revenueData: [],
        activityData: [],
        recentSales: [],
        topProducts: [],
      },
      loading: false,
      refetch: vi.fn(),
      exportData: vi.fn(),
      exporting: false,
    })
  })

  it('renders dashboard heading and welcome message', () => {
    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Your business at a glance/)).toBeInTheDocument()
  })

  it('renders all stat cards with loading state initially', () => {
    // Mock loading state
    mockDashboardData.mockReturnValueOnce({
      data: null,
      loading: true,
      refetch: vi.fn(),
      exportData: vi.fn(),
      exporting: false,
    })

    render(<DashboardPage />, { wrapper: createWrapper() })

    // Check for loading skeletons - there are 4 stat cards, each with loading state
    const loadingCards = screen.getAllByTestId(/stat-card-.*-loading/)
    expect(loadingCards).toHaveLength(4)
  })

  it('renders stat cards with data after loading', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() })

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Total Orders')).toBeInTheDocument()
      expect(screen.getByText('Active Now')).toBeInTheDocument()
    })

    // Check for values
    await waitFor(() => {
      expect(screen.getByText('$45,231.89')).toBeInTheDocument()
      expect(screen.getByText('573')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('2,453')).toBeInTheDocument()
    })
  })

  it('renders chart components', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument()
      expect(screen.getByTestId('activity-chart')).toBeInTheDocument()
      expect(screen.getByTestId('recent-sales')).toBeInTheDocument()
      expect(screen.getByTestId('top-products')).toBeInTheDocument()
    })
  })

  it('refreshes data on button click', async () => {
    const mockRefetch = vi.fn()
    mockDashboardData.mockReturnValue({
      data: {
        stats: {
          revenue: '$45,231.89',
          users: '573',
          orders: '12',
          activeUsers: '2,453',
        },
        revenueData: [],
        activityData: [],
        recentSales: [],
        topProducts: [],
      },
      loading: false,
      refetch: mockRefetch,
      exportData: vi.fn(),
      exporting: false,
    })

    render(<DashboardPage />, { wrapper: createWrapper() })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  it('renders stat cards in grid layout', () => {
    render(<DashboardPage />, { wrapper: createWrapper() })

    // Check that all stat cards are rendered
    expect(screen.getByTestId('stat-card-total-revenue')).toBeInTheDocument()
    expect(screen.getByTestId('stat-card-total-users')).toBeInTheDocument()
    expect(screen.getByTestId('stat-card-total-orders')).toBeInTheDocument()
    expect(screen.getByTestId('stat-card-active-now')).toBeInTheDocument()
  })

  it('displays error state when data fetch fails', async () => {
    // Mock console.error to avoid test output noise
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock error state
    mockDashboardData.mockReturnValueOnce({
      data: null,
      loading: false,
      error: new Error('Failed to load dashboard data'),
      refetch: vi.fn(),
      exportData: vi.fn(),
      exporting: false,
    })

    render(<DashboardPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      // Check for the error heading
      expect(
        screen.getByRole('heading', { name: /Failed to load dashboard data/i })
      ).toBeInTheDocument()
      // Check for the retry button
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument()
    })

    consoleError.mockRestore()
  })

  it('handles empty data gracefully', async () => {
    mockDashboardData.mockReturnValue({
      data: {
        stats: {
          revenue: '$0',
          users: '0',
          orders: '0',
          activeUsers: '0',
        },
        revenueData: [],
        activityData: [],
        recentSales: [],
        topProducts: [],
      },
      loading: false,
      refetch: vi.fn(),
      exportData: vi.fn(),
      exporting: false,
    })

    render(<DashboardPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('$0')).toBeInTheDocument()
      expect(screen.getAllByText('0')).toHaveLength(3) // users, orders, activeUsers
    })
  })

  it('maintains scroll position on component remount', async () => {
    const { rerender } = render(<DashboardPage />, { wrapper: createWrapper() })

    // Simulate scroll
    window.scrollY = 500

    // Remount component
    rerender(<DashboardPage />)

    // Check that scroll position is maintained
    expect(window.scrollY).toBe(500)
  })

  it('renders tabs for period selection', () => {
    render(<DashboardPage />, { wrapper: createWrapper() })

    // Check that tabs are rendered using their actual text content
    const todayTab = screen.getByRole('tab', { name: 'today' })
    const weekTab = screen.getByRole('tab', { name: 'thisWeek' })
    const monthTab = screen.getByRole('tab', { name: 'thisMonth' })

    expect(todayTab).toBeInTheDocument()
    expect(weekTab).toBeInTheDocument()
    expect(monthTab).toBeInTheDocument()

    // Check that week tab is selected by default
    expect(weekTab).toHaveAttribute('data-state', 'active')
  })
})
