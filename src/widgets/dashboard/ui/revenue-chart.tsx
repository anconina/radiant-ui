'use client'

import { Line, LineChart, XAxis, YAxis } from 'recharts'

import { useTheme } from '@/shared/providers'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/ui/chart'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  orders: {
    label: 'Orders',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function RevenueChart({ data }: RevenueChartProps) {
  const { theme: _theme } = useTheme()

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `$${value}`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="revenue"
          strokeWidth={2}
          activeDot={{
            r: 8,
            style: { fill: 'var(--color-revenue)' },
          }}
          style={{
            stroke: 'var(--color-revenue)',
            opacity: 1,
          }}
        />
        <Line
          type="monotone"
          dataKey="orders"
          strokeWidth={2}
          activeDot={{
            r: 8,
            style: { fill: 'var(--color-orders)' },
          }}
          style={{
            stroke: 'var(--color-orders)',
            opacity: 0.8,
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
