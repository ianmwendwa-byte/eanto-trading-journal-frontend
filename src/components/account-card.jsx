"use client"

import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { cn } from "@/lib/utils"

import {
  Pencil,
  Trash,
  AlertTriangle,
} from "lucide-react"

import { toast } from "sonner"
import { accountApi } from "@/app/services/api"
import { useNavigate } from "react-router-dom"

export function AccountCard({ account, onDelete }) {
  const navigate = useNavigate()

  const [openDelete, setOpenDelete] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)

  // ───────────────── TYPE CHECKS ─────────────────
  const isProp = account?.type === "PROP ACCOUNT"
  const isWar = account?.type === "WAR ACCOUNT"

  // ───────────────── PERFORMANCE SAFE ACCESS ─────────────────
  const performance = account?.performance || {}

  const pnl = performance.totalPnl || 0
  const winRate = performance.winRate || 0

  // ───────────────── ACCOUNT DATA ─────────────────
  const balance = account?.balanceSnapshot ?? 0
  const startingBalance = account?.startingBalance ?? 0
  const currency = account?.currency ?? "$"

  const broker =
    account.type === "PROP ACCOUNT"
      ? account?.propFirm?.firmName ?? "Unknown Firm"
      : account?.broker ?? "Unknown Broker"

  const ruleMode = account?.ruleMode ?? "track-only"
  const propFirm = account?.propFirm || {}
  const rules = account?.propRules || {}

  // ───────────────── DELETE VALIDATION ─────────────────
  const canDelete = confirmText === account?.name && checked

  // ───────────────── DELETE HANDLER ─────────────────
  const handleDelete = async () => {
    try {
      setLoading(true)

      await accountApi.delete(account._id)

      toast.success("Account deleted successfully")

      onDelete?.(account._id)

      setOpenDelete(false)
      setConfirmText("")
      setChecked(false)
    } catch (err) {
      console.error(err)

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete account"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ───────────────── CARD ───────────────── */}
      <Card
        className={cn(
          "card-elevated relative p-5 flex flex-col gap-5 transition-all duration-300 hover:shadow-xl border backdrop-blur h-full overflow-y-auto",
          "border-l-4",
          isProp && "border-l-primary bg-primary/5",
          isWar && "border-l-destructive bg-destructive/5",
          !isProp && !isWar && "border-l-success bg-success/5"
        )}
      >
        {/* ───────────────── HEADER ───────────────── */}
        <div className="flex justify-between items-start">
          <div>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest",
                isProp && "text-primary border-primary/30 bg-primary/10",
                isWar && "text-destructive border-destructive/30 bg-destructive/10",
                !isProp && !isWar && "text-success border-success/30 bg-success/10"
              )}
            >
              {account?.type}
            </span>

            <h3 className="text-lg font-semibold mt-2">
              {account?.name}
            </h3>

            <p className="text-xs text-muted-foreground">
              {broker}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 text-muted-foreground">
            <button
              className="hover:text-foreground transition"
              onClick={() =>
                navigate(`/accounts/${account._id}/edit`)
              }
            >
              <Pencil size={15} />
            </button>

            <button
              onClick={() => setOpenDelete(true)}
              className="hover:text-red-500 transition"
            >
              <Trash size={15} />
            </button>
          </div>
        </div>

        {/* ───────────────── BALANCE ───────────────── */}
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Current Balance
          </p>

          <h2 className="text-3xl font-bold tracking-tight">
            {currency} {Number(balance).toLocaleString()}
          </h2>
        </div>

        {/* ───────────────── PERFORMANCE ───────────────── */}
        <div className="grid grid-cols-2 gap-4 border-y py-4">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground mb-1 tracking-wider">
              Total PnL
            </p>

            <p
              className={cn(
                "font-bold text-lg trading-number",
                pnl > 0 && "profit-text",
                pnl < 0 && "loss-text"
              )}
            >
              {pnl > 0 ? "+" : ""}
              {currency}
              <span className="pl-1">{Number(pnl).toLocaleString()}</span>
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-muted-foreground mb-1 tracking-wider">
              Win Rate
            </p>

            <p className="font-bold text-lg">
              {winRate}%
            </p>
          </div>
        </div>

        {/* ───────────────── META ───────────────── */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground uppercase">
              Starting Balance
            </span>

            <span className="font-medium">
              {currency}{" "}
              {Number(startingBalance).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground uppercase">
              Rule Mode
            </span>

            <span className="font-medium capitalize">
              {ruleMode}
            </span>
          </div>

          {/* PROP DETAILS */}
          {isProp && propFirm?.enabled && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase">
                  Phase
                </span>

                <span className="font-medium capitalize">
                  {propFirm?.phase?.replace("_", " ") || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase">
                  Status
                </span>

                <span
                  className={cn(
                    "font-medium",
                    propFirm.status === "active" && "text-success",
                    propFirm.status === "failed" && "text-destructive",
                    propFirm.status === "passed" && "text-primary"
                  )}
                >
                  {propFirm.status || "-"}
                </span>
              </div>

              {propFirm.failureReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase">
                    Failed Reason
                  </span>

                  <span className="font-medium text-destructive text-right">
                    {propFirm.failureReason.replaceAll("_", " ")}
                  </span>
                </div>
              )}
            </>
          )}

          {/* RULES */}
          {rules?.maxDrawdownPercent && (
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase">
                Max DD
              </span>

              <span className="font-medium">
                {rules.maxDrawdownPercent}%
              </span>
            </div>
          )}

          {rules?.profitTarget && (
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase">
                Profit Target
              </span>

              <span className="font-medium">
                {rules.profitTarget}%
              </span>
            </div>
          )}
        </div>

        {/* ───────────────── CTA ───────────────── */}
        <Button
          className="w-full mt-auto"
          onClick={() => navigate(`/journal/${account._id}`)}
        >
          View Journal →
        </Button>
      </Card>

      {/* ───────────────── DELETE MODAL ───────────────── */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border bg-background">
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="text-destructive w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Delete Trading Account
                </h2>

                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  This action permanently removes all account data.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Type account name to confirm</Label>

              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={account?.name}
              />
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <span className="text-muted-foreground">
                  I understand this is irreversible
                </span>
              </label>
            </div>
          </div>

          <div className="border-t p-4 grid grid-cols-2 gap-3 bg-muted/20">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>

            <Button
              disabled={!canDelete || loading}
              onClick={handleDelete}
              variant="destructive"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}