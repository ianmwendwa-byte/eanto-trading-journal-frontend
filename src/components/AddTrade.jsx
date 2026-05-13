"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  BarChart3,
  FileText,
  DollarSign,
  Shield,
  Hash,
} from "lucide-react"

import { accountApi, tradeApi } from "@/app/services/api"
import { tradeSchema } from "@/app/schema/trade"
import { Badge } from "@/components/ui/badge"

export default function AddTradePage() {
  const navigate = useNavigate()
  const { accountId } = useParams()
  const [accounts, setAccounts] = useState([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      accountId: accountId || "",
      pair: "",
      direction: "buy",
      lotSize: "",
      entryPrice: "",
      stopLoss: "",
      takeProfit: "",
      pnl: "",
      riskAmount: "",
      session: "london",
      note: "",
    },
  })

  // ───────────────── FETCH ACCOUNTS ─────────────────
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountApi.getAll()
        setAccounts(data || [])
      } catch {
        toast.error("Failed to load accounts")
      }
    }
    fetchAccounts()
  }, [])

  // ───────────────── SYNC ACCOUNTID FROM URL ─────────────────
  useEffect(() => {
    if (accountId) {
      setValue("accountId", accountId)
    }
  }, [accountId, setValue])

  // ───────────────── SUBMIT ─────────────────
  const onSubmit = async (data) => {
    try {
      const payload = {
        accountId: data.accountId,
        pair: data.pair.toUpperCase(),
        direction: data.direction,
        lotSize: parseFloat(data.lotSize),
        entryPrice: parseFloat(data.entryPrice),
        stopLoss: parseFloat(data.stopLoss),
        takeProfit: data.takeProfit ? parseFloat(data.takeProfit) : null,
        pnl: parseFloat(data.pnl),
        riskAmount: parseFloat(data.riskAmount),
        session: data.session,
        note: data.note || null,
        openedAt: new Date(),
        closedAt: new Date(),
      }

      await tradeApi.create(payload)

      toast.success("Trade created successfully", {
        description: `${data.pair} ${data.direction}`,
      })

      navigate(`/journal/${data.accountId}`)
    } catch (err) {
      toast.error("Failed to create trade", {
        description: err?.response?.data?.message || err?.message || "Check required fields",
      })
    }
  }

  // ───────────────── DERIVED STATE ─────────────────
  const isAccountLocked = !!accountId
  const filteredAccounts = isAccountLocked
    ? accounts.filter((acc) => acc._id === accountId)
    : accounts

  const selectedAccount = accounts.find((acc) => acc._id === accountId)

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Add Trade</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAccountLocked
                ? `Record a trade for ${selectedAccount?.name || "account"}`
                : "Record a new trade for your account."}
            </p>
          </div>
        </div>
      </div>

      {/* ACCOUNT BANNER (when locked to a specific account) */}
      {isAccountLocked && selectedAccount && (
        <div className="trading-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Hash className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{selectedAccount.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedAccount.type} &middot; {selectedAccount.broker || "Unknown broker"}
            </p>
          </div>
          <Badge variant="outline">{selectedAccount.type}</Badge>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Trade Details Group */}
        <div className="trading-card p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="font-heading text-lg flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Trade Details
            </h2>
            <p className="text-sm text-muted-foreground">Select account and pair.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Controller
                name="accountId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isAccountLocked}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAccounts.map((acc) => (
                        <SelectItem key={acc._id} value={acc._id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.accountId && (
                <p className="text-sm text-red-500">{errors.accountId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pair</Label>
              <Input
                placeholder="EURUSD"
                {...register("pair")}
                className="uppercase"
              />
              {errors.pair && (
                <p className="text-sm text-red-500">{errors.pair.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Controller
                name="direction"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Long
                        </div>
                      </SelectItem>
                      <SelectItem value="sell">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          Short
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.direction && (
                <p className="text-sm text-red-500">{errors.direction.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Entry Details Group */}
        <div className="trading-card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Entry Details
            </h2>
            <p className="text-sm text-muted-foreground">Position entry parameters.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entry Price</Label>
              <Input
                type="number"
                step="0.00001"
                placeholder="1.12345"
                {...register("entryPrice")}
              />
              {errors.entryPrice && (
                <p className="text-sm text-red-500">{errors.entryPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Lot Size</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.1"
                {...register("lotSize")}
              />
              {errors.lotSize && (
                <p className="text-sm text-red-500">{errors.lotSize.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Risk Parameters Group */}
        <div className="trading-card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Parameters
            </h2>
            <p className="text-sm text-muted-foreground">Stop loss, take profit, and risk amount.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stop Loss</Label>
              <Input
                type="number"
                step="0.00001"
                placeholder="1.12000"
                {...register("stopLoss")}
              />
              {errors.stopLoss && (
                <p className="text-sm text-red-500">{errors.stopLoss.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Take Profit</Label>
              <Input
                type="number"
                step="0.00001"
                placeholder="1.14000"
                {...register("takeProfit")}
              />
              {errors.takeProfit && (
                <p className="text-sm text-red-500">{errors.takeProfit.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Risk Amount</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="50"
              {...register("riskAmount")}
            />
            {errors.riskAmount && (
              <p className="text-sm text-red-500">{errors.riskAmount.message}</p>
            )}
          </div>
        </div>

        {/* Position Outcome Group */}
        <div className="trading-card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Position Outcome
            </h2>
            <p className="text-sm text-muted-foreground">PnL and session details.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>P&L</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="100"
                {...register("pnl")}
              />
              {errors.pnl && (
                <p className="text-sm text-red-500">{errors.pnl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Session</Label>
              <Controller
                name="session"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="london">London</SelectItem>
                      <SelectItem value="new_york">New York</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="sydney">Sydney</SelectItem>
                      <SelectItem value="tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.session && (
                <p className="text-sm text-red-500">{errors.session.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes Group */}
        <div className="trading-card p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="font-heading text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Notes
            </h2>
            <p className="text-sm text-muted-foreground">Trade rationale or observations.</p>
          </div>

          <Textarea
            rows={4}
            placeholder="Why this trade was taken..."
            {...register("note")}
          />
        </div>

        <div className="flex justify-end items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Trade"}
          </Button>
        </div>
      </form>
    </div>
  )
}