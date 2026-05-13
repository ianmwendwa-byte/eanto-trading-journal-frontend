"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AccountsHeader } from "@/components/accounts-header"
import { AccountsCarousel } from "@/components/accounts-carousel"
import { EmptyState } from "@/components/empty-state"
import { AddAccount } from "@/components/add-account"

import { accountApi } from "@/app/services/api"

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // ───────────────── FETCH ACCOUNTS ─────────────────
  const fetchAccounts = async () => {
    try {
      setLoading(true)

      const data = await accountApi.getAll()

      setAccounts(data || [])
    } catch (err) {
      toast.error("Failed to load accounts")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  // ───────────────── ADD ACCOUNT (UI UPDATE) ─────────────────
  const handleAccountCreated = (newAccount) => {
    setAccounts((prev) => [newAccount, ...prev])
  }

  // ───────────────── DELETE ACCOUNT ─────────────────
  const handleDeleteAccount = (id) => {
    setAccounts((prev) =>
      prev.filter((acc) => acc._id !== id)
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">

      {/* HEADER + ADD BUTTON */}
      <div className="flex items-center justify-between">
        <AccountsHeader />

        <AddAccount
          onAccountCreated={handleAccountCreated}
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-sm text-muted-foreground">
          Loading accounts...
        </p>
      ) : accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <AccountsCarousel
          accounts={accounts}
          onDelete={handleDeleteAccount}
        />
      )}

    </div>
  )
}