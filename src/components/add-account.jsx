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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { accountApi } from "@/app/services/api"
import { accountSchema } from "@/app/schema/account"

export function AddAccount({ onAccountCreated }) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "normal",
      broker: "",
      currency: "USD",
      startingBalance: 0,
    },
  })

  const type = watch("type")

  const onSubmit = async (data) => {
    try {
      // ─── BUILD PAYLOAD (MATCH BACKEND SCHEMA)
      const payload = {
        name: data.name,
        type: data.type,
        broker: data.broker,
        currency: data.currency,
        startingBalance: Number(data.startingBalance),
      }

      // PROP RULES ONLY
      if (data.type === "prop") {
        payload.rules = {
          maxDrawdownPercent: Number(data.maxDrawdownPercent),
          profitTarget: Number(data.profitTarget),
        }
      }

      // ─── API CALL (FIXED METHOD NAME)
      const res = await accountApi.create(payload)

      // res = already response.data (because interceptor strips it)

      toast.success("Account created", {
        description: data.name,
      })

      onAccountCreated?.(res)

      reset()
      setOpen(false)
    } catch (err) {
      toast.error("Failed to create account", {
        description:
          err?.message ||
          err?.response?.data?.message ||
          "Something went wrong",
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>+ Add Account</Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>Create Account</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">

          {/* NAME */}
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* TYPE + BROKER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Type</Label>

              <Select
                defaultValue="normal"
                onValueChange={(v) => setValue("type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="prop">Prop</SelectItem>
                  <SelectItem value="war">War</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Broker</Label>
              <Input {...register("broker")} />
            </div>

          </div>

          {/* BALANCE */}
          <div className="space-y-2">
            <Label>Starting Balance</Label>
            <Input type="number" {...register("startingBalance")} />
          </div>

          {/* PROP RULES */}
          {type === "prop" && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">

              <p className="text-sm font-medium">Prop Rules</p>

              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label>Max DD %</Label>
                  <Input type="number" {...register("maxDrawdownPercent")} />
                </div>

                <div className="space-y-2">
                  <Label>Profit Target %</Label>
                  <Input type="number" {...register("profitTarget")} />
                </div>

              </div>
            </div>
          )}

          {/* ACTIONS */}
          <Button disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Account"}
          </Button>

        </form>
      </SheetContent>
    </Sheet>
  )
}