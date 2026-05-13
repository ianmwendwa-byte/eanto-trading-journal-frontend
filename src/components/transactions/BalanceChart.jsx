"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getBalanceHistory } from "@/data/transactions-mock-data"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-xl">
        <p className="font-medium text-sm text-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <p className="text-sm text-muted-foreground">Balance</p>
        </div>
        <p className="font-mono font-medium text-foreground tabular-nums mt-1">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export function BalanceChart({ transactions }) {
  const chartData = useMemo(() => getBalanceHistory(transactions), [transactions])

  // Sample data for performance (show all data points but limit if too many)
  const displayData = chartData.length > 50 ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 50) === 0) : chartData

  const chartConfig = {
    balance: {
      label: "Balance",
      color: "var(--primary)",
    },
  }

  return (
    <Card className="card-elevated lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-heading">Balance History</CardTitle>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.3} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
                className="text-xs text-muted-foreground"
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                dataKey="balance"
                type="monotone"
                fill="url(#fillBalance)"
                stroke="var(--color-balance)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--color-balance)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
