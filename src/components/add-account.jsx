"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  ShieldCheck,
  Wallet,
  Sword,
  ChevronRight,
} from "lucide-react"

import { accountApi } from "@/app/services/api"
import { accountSchema } from "@/app/schema/account"

// ─────────────────────────────────────────────
// SAFE NUMBER PARSER
// ─────────────────────────────────────────────
const toNumber = (v) => {
  if (v === "" || v === null || v === undefined) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

export function AddAccount({ onAccountCreated }) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "NORMAL ACCOUNT",
      broker: "",
      currency: "USD",
      startingBalance: 0,
      accountSize: 0,

      maxDrawdownPercent: "",
      dailyDrawdownPercent: "",
      profitTarget: "",
      maxTradesPerDay: "",
      maxLotSize: "",

      trackRules: "",
      propFirmName: "",
    },
  })

  const type = watch("type")

  const isProp = type === "PROP ACCOUNT"
  const isWar = type === "WAR ACCOUNT"

  // ─────────────────────────────────────────────
  // TRACK RULE PARSER
  // ─────────────────────────────────────────────
  const parseTrackRules = (text) => {
    if (!text) return []

    return text
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean)
      .map((rule) => ({
        title: rule,
        type: "custom",
        enabled: true,
        violationsCount: 0,
        score: 100,
        config: {},
      }))
  }

  // ─────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        type: data.type,
        currency: data.currency || "USD",
        startingBalance: toNumber(data.startingBalance) || 0,
      }

      // ───────────────── NORMAL ACCOUNT ─────────────────
      if (type === "NORMAL ACCOUNT") {
        payload.broker = data.broker || "unknown"
        payload.ruleMode = "track-only"
        payload.trackRules = parseTrackRules(data.trackRules)
        payload.propRules = {}
        payload.propFirm = { enabled: false }
        payload.accountSize = 0
      }

      // ───────────────── WAR ACCOUNT ─────────────────
      if (type === "WAR ACCOUNT") {
        payload.broker = data.broker || "unknown"
        payload.ruleMode = "off"
        payload.trackRules = parseTrackRules(data.trackRules)
        payload.propRules = {}
        payload.propFirm = { enabled: false }
        payload.accountSize = 0
      }

      // ───────────────── PROP ACCOUNT ─────────────────
      if (type === "PROP ACCOUNT") {
        payload.ruleMode = "enforced"
        payload.accountSize = toNumber(data.accountSize) || 0

        const propRules = {
          maxDrawdownPercent: toNumber(data.maxDrawdownPercent),
          dailyDrawdownPercent: toNumber(data.dailyDrawdownPercent),
          profitTarget: toNumber(data.profitTarget),
          maxTradesPerDay: toNumber(data.maxTradesPerDay),
          maxLotSize: toNumber(data.maxLotSize),
        }

        if (propRules.maxDrawdownPercent == null)
          throw new Error("Max drawdown required")

        if (propRules.profitTarget == null)
          throw new Error("Profit target required")

        if (!payload.accountSize || payload.accountSize <= 0)
          throw new Error("Account size required")

        payload.propRules = propRules

        payload.propFirm = {
          enabled: true,
          firmName: data.propFirmName || null,
          phase: "phase_1",
          status: "active",
        }

        payload.trackRules = parseTrackRules(data.trackRules)
      }

      const res = await accountApi.create(payload)

      toast.success("Account created successfully", {
        description: data.name,
      })

      onAccountCreated?.(res)

      reset()
      setOpen(false)
    } catch (err) {
      toast.error("Failed to create account", {
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Check required fields",
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          + Link New Account
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl p-0 border-l border-border bg-background flex flex-col">

        {/* ───────────────── HEADER ───────────────── */}
        <SheetHeader className="border-b border-border px-6 py-5 bg-background/95 backdrop-blur">
          <div className="space-y-1">
            <SheetTitle className="font-heading text-2xl">
              Create Account
            </SheetTitle>

            <p className="text-sm text-muted-foreground">
              Link your trading accounts to track performance and enforce rules.
            </p>
          </div>
        </SheetHeader>

        {/* ───────────────── BODY ───────────────── */}
        <div className="flex min-h-0 flex-1 flex-col">

          <div className="flex-1 overflow-y-auto px-6 py-6">

            <form className="space-y-8">

              {/* ───────────────── ACCOUNT CLASSIFICATION ───────────────── */}
              <section className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                    Account Classification
                  </p>
                </div>

                <div className="space-y-3">

                  {/* NORMAL */}
                  <button
                    type="button"
                    onClick={() => setValue("type", "NORMAL ACCOUNT")}
                    className={`w-full rounded-xl border transition-all text-left p-5 trading-card ${
                      type === "NORMAL ACCOUNT"
                        ? "border-primary bg-primary/10 eanto-glow"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading text-lg">
                            Normal
                          </h3>

                          {type === "NORMAL ACCOUNT" && (
                            <ChevronRight className="h-5 w-5 text-primary" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          Personal capital account with flexible tracking.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* PROP */}
                  <button
                    type="button"
                    onClick={() => setValue("type", "PROP ACCOUNT")}
                    className={`w-full rounded-xl border transition-all text-left p-5 trading-card ${
                      type === "PROP ACCOUNT"
                        ? "border-primary bg-primary/10 eanto-glow"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading text-lg">
                            Prop
                          </h3>

                          {type === "PROP ACCOUNT" && (
                            <ChevronRight className="h-5 w-5 text-primary" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          Institutional challenge environment with enforced rules.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* WAR */}
                  <button
                    type="button"
                    onClick={() => setValue("type", "WAR ACCOUNT")}
                    className={`w-full rounded-xl border transition-all text-left p-5 trading-card ${
                      type === "WAR ACCOUNT"
                        ? "border-red-500/40 bg-red-500/10"
                        : "hover:border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Sword className="h-6 w-6 text-red-500" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading text-lg">
                            War
                          </h3>

                          {type === "WAR ACCOUNT" && (
                            <ChevronRight className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          High aggression execution environment with disabled enforcement.
                        </p>
                      </div>
                    </div>
                  </button>

                </div>
              </section>

              {/* ───────────────── ACCOUNT DETAILS ───────────────── */}
              <section className="trading-card p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="font-heading text-lg">
                    Account Details
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Configure your account identity and capital structure.
                  </p>
                </div>

                <div className="space-y-5">

                  {/* ACCOUNT NAME */}
                  <div className="space-y-2">
                    <Label>Account Name</Label>

                    <Input
                      placeholder="Eanto"
                      {...register("name")}
                    />
                  </div>

                  {/* BROKER */}
                  <div className="space-y-2">
                    <Label>
                      {isProp ? "Prop Firm" : "Broker"}
                    </Label>

                    {isProp ? (
                      <Input
                        placeholder="FTMO"
                        {...register("propFirmName")}
                      />
                    ) : (
                      <Input
                        placeholder="IC Markets"
                        {...register("broker")}
                      />
                    )}
                  </div>

                  {/* CURRENCY */}
                  <div className="space-y-2">
                    <Label>Currency</Label>

                    <Select
                      defaultValue="USD"
                      onValueChange={(v) => setValue("currency", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="KSH">KSH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </section>

              {/* ───────────────── FINANCIAL PARAMETERS ───────────────── */}
              <section className="trading-card p-6 space-y-6">

                <div className="space-y-1">
                  <h2 className="font-heading text-lg">
                    Financial Parameters
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Define account capital and operational limits.
                  </p>
                </div>

                <div className="grid gap-5">

                  <div className="space-y-2">
                    <Label>Starting Balance</Label>

                    <Input
                      type="number"
                      placeholder="100000"
                      {...register("startingBalance")}
                    />
                  </div>

                  {isProp && (
                    <div className="space-y-2">
                      <Label>Account Size</Label>

                      <Input
                        type="number"
                        placeholder="100000"
                        {...register("accountSize")}
                      />
                    </div>
                  )}

                </div>
              </section>

              {/* ───────────────── PROP RULES ───────────────── */}
              {isProp && (
                <section className="trading-card p-6 space-y-6 border-primary/20">

                  <div className="space-y-1">
                    <h2 className="font-heading text-lg">
                      Prop Rules
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Risk enforcement configuration for challenge accounts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="space-y-2">
                      <Label>Max Drawdown %</Label>

                      <Input
                        placeholder="10"
                        {...register("maxDrawdownPercent")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Daily Drawdown %</Label>

                      <Input
                        placeholder="5"
                        {...register("dailyDrawdownPercent")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Profit Target %</Label>

                      <Input
                        placeholder="8"
                        {...register("profitTarget")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Trades Per Day</Label>

                      <Input
                        placeholder="5"
                        {...register("maxTradesPerDay")}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Max Lot Size</Label>

                      <Input
                        placeholder="2.0"
                        {...register("maxLotSize")}
                      />
                    </div>

                  </div>
                </section>
              )}

              {/* ───────────────── TRACK RULES ───────────────── */}
              <section className="trading-card p-6 space-y-6">

                <div className="space-y-1">
                  <h2 className="font-heading text-lg">
                    Track Rules
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Define behavioral and execution constraints.
                  </p>
                </div>

                <Textarea
                  rows={7}
                  placeholder={`Only trade London session
Risk 1% per trade
No revenge trading`}
                  className="resize-none"
                  {...register("trackRules")}
                />

              </section>

              {/* ───────────────── WAR WARNING ───────────────── */}
              {isWar && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">
                    War mode disables enforcement rules and tracking protection.
                  </p>
                </div>
              )}

            </form>
          </div>

          {/* ───────────────── FOOTER ───────────────── */}
          <div className="border-t border-border bg-background px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">

              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting ? "Creating..." : "Add Account"}
              </Button>

            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}