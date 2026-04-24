import { useState } from "react"

import { DashboardHeader } from "@/components/dashboard-header"
import { StatsGrid } from "@/components/stats-grid"
import { DisciplinePanel } from "@/components/discipline-panel"
import { ChartsSection } from "@/components/charts-section"
import { TradesTable } from "@/components/trades-table"
import { InsightsPreview } from "@/components/insights-preview"

export default function Dashboard() {
  const [accountId, setAccountId] = useState("")
  const [period, setPeriod] = useState("month")

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <DashboardHeader
        accountId={accountId}
        setAccountId={setAccountId}
        period={period}
        setPeriod={setPeriod}
      />

      {/* Stats */}
      <StatsGrid />

      {/* Middle Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DisciplinePanel />
        <div className="lg:col-span-2">
          <ChartsSection />
        </div>
      </div>

      {/* Trades */}
      <TradesTable />

      {/* Insights */}
      <InsightsPreview />

    </div>
  )
}