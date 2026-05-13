"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

import { ChartContainer } from "@/components/ui/chart"
import { getTransactionDistribution } from "@/data/transactions-mock-data"

const RADIAN = Math.PI / 180

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-xl">
        <p className="font-medium text-sm text-foreground">{data.label}</p>
        <p className="font-mono font-medium text-foreground tabular-nums mt-1">
          ${data.value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TransactionDistribution({ transactions }) {
  const chartData = useMemo(() => getTransactionDistribution(transactions), [transactions])

  const chartConfig = {
    deposit: {
      label: "Deposits",
      color: "var(--success)",
    },
    withdrawal: {
      label: "Withdrawals",
      color: "var(--destructive)",
    },
    trade_profit: {
      label: "Trade Profits",
      color: "var(--success)",
    },
    trade_loss: {
      label: "Trade Losses",
      color: "var(--destructive)",
    },
    payout: {
      label: "Payouts",
      color: "var(--warning)",
    },
  }

  return (
    <Card className="card-elevated lg:col-span-1">
      <CardHeader>
        <CardTitle className="font-heading">Transaction Types</CardTitle>
      </CardHeader>

      <CardContent className="flex items-center justify-center">
        <ChartContainer config={chartConfig} className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
