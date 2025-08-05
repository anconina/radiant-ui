import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

import type { DashboardData } from '@/features/dashboard/model/use-dashboard-data'

// Generate mock data
function generateDashboardData(): DashboardData {
  // Generate revenue data for the last 30 days
  const revenueData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: faker.number.int({ min: 1000, max: 5000 }),
      orders: faker.number.int({ min: 10, max: 50 }),
    }
  })

  // Generate activity data for days of the week
  const activityData = [
    { name: 'Mon', total: faker.number.int({ min: 100, max: 300 }) },
    { name: 'Tue', total: faker.number.int({ min: 100, max: 300 }) },
    { name: 'Wed', total: faker.number.int({ min: 100, max: 300 }) },
    { name: 'Thu', total: faker.number.int({ min: 100, max: 300 }) },
    { name: 'Fri', total: faker.number.int({ min: 100, max: 300 }) },
    { name: 'Sat', total: faker.number.int({ min: 50, max: 200 }) },
    { name: 'Sun', total: faker.number.int({ min: 50, max: 200 }) },
  ]

  // Generate recent sales
  const recentSales = Array.from({ length: 8 }, () => ({
    id: faker.string.uuid(),
    customer: {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      avatar: faker.image.avatar(),
    },
    amount: `$${faker.number.int({ min: 50, max: 500 })}.00`,
    status: faker.helpers.arrayElement(['completed', 'pending', 'failed'] as const),
    date: faker.date.recent({ days: 7 }).toLocaleDateString(),
  }))

  // Generate top products
  const topProducts = Array.from({ length: 5 }, () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    sales: faker.number.int({ min: 100, max: 1000 }),
    revenue: `$${faker.number.int({ min: 5000, max: 50000 })}`,
    growth: faker.number.float({ min: -20, max: 50, fractionDigits: 1 }),
  }))

  // Calculate total revenue from revenue data
  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0)
  const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0)

  return {
    stats: {
      revenue: `$${totalRevenue.toLocaleString()}`,
      users: faker.number.int({ min: 10000, max: 50000 }),
      orders: totalOrders,
      activeUsers: faker.number.int({ min: 500, max: 2000 }),
    },
    revenueData,
    activityData,
    recentSales,
    topProducts,
  }
}

export const dashboardHandlers = [
  // Get dashboard data
  http.get('http://localhost:3000/api/dashboard', () => {
    const data = generateDashboardData()
    return HttpResponse.json(data)
  }),

  // Get dashboard stats only
  http.get('http://localhost:3000/api/dashboard/stats', () => {
    const { stats } = generateDashboardData()
    return HttpResponse.json(stats)
  }),

  // Get revenue data with date range
  http.get('http://localhost:3000/api/dashboard/revenue', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'

    let days = 30
    if (period === 'week') days = 7
    if (period === 'day') days = 1

    const revenueData = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: faker.number.int({ min: 1000, max: 5000 }),
        orders: faker.number.int({ min: 10, max: 50 }),
      }
    })

    return HttpResponse.json(revenueData)
  }),

  // Export dashboard data
  http.post('http://localhost:3000/api/dashboard/export', async ({ request }) => {
    const { format } = (await request.json()) as { format: 'csv' | 'json' | 'pdf' }

    // Simulate file generation delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (format === 'csv') {
      return new HttpResponse('Date,Revenue,Orders\n2024-01-01,1234,45\n2024-01-02,2345,56', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="dashboard-export.csv"',
        },
      })
    }

    if (format === 'json') {
      return HttpResponse.json({
        exported: true,
        format,
        timestamp: new Date().toISOString(),
        data: generateDashboardData(),
      })
    }

    // For PDF, return a success message (actual PDF generation would be more complex)
    return HttpResponse.json({
      success: true,
      message: 'PDF export initiated',
      downloadUrl: '/api/dashboard/export/download/abc123',
    })
  }),

  // Refresh dashboard data
  http.post('http://localhost:3000/api/dashboard/refresh', () => {
    // Simulate refresh with new data
    return HttpResponse.json({
      success: true,
      message: 'Dashboard refreshed',
      timestamp: new Date().toISOString(),
    })
  }),
]
