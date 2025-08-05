'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/ui/chart'

interface ActivityChartProps {
  data: Array<{
    name: string
    total: number
  }>
}

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="total"
          radius={[8, 8, 0, 0]}
          style={{
            fill: 'var(--color-total)',
            opacity: 0.9,
          }}
        />
      </BarChart>
    </ChartContainer>
  )
}
