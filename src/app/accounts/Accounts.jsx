"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AccountsHeader } from "@/components/accounts-header"
import { AccountsGrid } from "@/components/accounts-grid"
import { EmptyState } from "@/components/empty-state"

import { accountApi } from "@/app/services/api"

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // ─────────────────────────────────────────────
  // FETCH ACCOUNTS
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)

        // ✅ correct method from your api.js
        const res = await accountApi.getAll()

        // res is already response.data (because of interceptor)
        setAccounts(res || [])
      } catch (err) {
        toast.error("Failed to load accounts", {
          description:
            err?.message ||
            "Check your connection or server status",
        })

        console.error("Failed to fetch accounts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">

      {/* HEADER */}
      <AccountsHeader />

      {/* CONTENT */}
      {loading ? (
        <p className="text-sm text-muted-foreground">
          Loading accounts...
        </p>
      ) : accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <AccountsGrid accounts={accounts} />
      )}

    </div>
  )
}