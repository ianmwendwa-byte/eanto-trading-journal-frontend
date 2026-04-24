import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"

import { accountApi } from "@/app/services/api" 

export function DashboardHeader({
  accountId,
  setAccountId,
  period,
  setPeriod,
}) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await accountApi.getAccounts()
        setAccounts(res.data || [])

        if (res.data?.length && !accountId) {
          setAccountId(res.data[0].id)
        }
      } catch (err) {
        console.error("Failed to fetch accounts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [accountId, setAccountId])

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      {/* LEFT */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Dashboard</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Performance overview
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

        {/* ACCOUNT */}
        <Select
          value={accountId}
          onValueChange={setAccountId}
          disabled={loading}
        >
          <SelectTrigger className="w-full sm:w-50">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>

          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* PERIOD */}
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-35">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        {/* DATE BUTTON */}
        <Button
          variant="outline"
          size="icon"
          className="w-full sm:w-auto p-2"
        >
          <Calendar className="h-4 w-4" />
        </Button>

      </div>
    </div>
  )
}