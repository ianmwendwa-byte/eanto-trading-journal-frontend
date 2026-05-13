"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { accountApi } from "@/app/services/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Badge } from "@/components/ui/badge"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area as RechartArea,
} from "recharts"

import {
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  Fingerprint,
  Plus,
  TicketX,
  Trash2,
} from "lucide-react"

const equityData = [
  { day: "Mon", equity: 10000 },
  { day: "Tue", equity: 10200 },
  { day: "Wed", equity: 10120 },
  { day: "Thu", equity: 10550 },
  { day: "Fri", equity: 10800 },
  { day: "Sat", equity: 11020 },
]

export default function EditAccount() {
  const { accountId } = useParams()

  const navigate = useNavigate()

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [account, setAccount] =
    useState(null)

  // ─────────────────────────────────────
  // FETCH ACCOUNT
  // ─────────────────────────────────────
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true)

        const res =
          await accountApi.getOne(
            accountId
          )

        setAccount({
          ...res,

          propRules: {
            maxDrawdownPercent: res.propRules?.maxDrawdownPercent || "",
            dailyDrawdownPercent: res.propRules?.dailyDrawdownPercent || "",
            profitTarget: res.propRules?.profitTarget || "",
            maxTradesPerDay: res.propRules?.maxTradesPerDay || "",
            maxLotSize: res.propRules?.maxLotSize || "",
            allowedSessions: res.propRules?.allowedSessions || [],
          },

          trackRules: res.trackRules || [],

          propFirm: {
            firmName: res.propFirm?.firmName || "",
            phase: res.propFirm?.phase || "phase_1",
            status: res.propFirm?.status || "active",
            enabled: res.propFirm?.enabled || false,
            failureReason: res.propFirm?.failureReason || "",
          },
        })
      } catch (err) {
        toast.error(
          "Failed to load account",
          {
            description:
              err?.message ||
              "Something went wrong",
          }
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [accountId])

  // ─────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────
  const handleChange = (
    key,
    value
  ) => {
    setAccount((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleNestedChange = (
    parent,
    key,
    value
  ) => {
    setAccount((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [key]: value,
      },
    }))
  }

  // ─────────────────────────────────────
  // CUSTOM RULES
  // ─────────────────────────────────────
  const addCustomRule = () => {
    const rules = [
      ...(account.trackRules || []),
      {
        title: "New Rule",
        evaluationType: "custom",
        enabled: true,
        config: {},
      },
    ]

    handleChange("trackRules", rules)
  }

  const updateCustomRule = (
    index,
    value
  ) => {
    const updatedRules = [
      ...(account.trackRules || []),
    ]

    updatedRules[index] = {
      ...updatedRules[index],
      title: value,
    }

    handleChange("trackRules", updatedRules)
  }

  const removeCustomRule = (
    index
  ) => {
    const updatedRules = [
      ...(account.trackRules || []),
    ]

    updatedRules.splice(index, 1)

    handleChange("trackRules", updatedRules)
  }

  // ─────────────────────────────────────
  // SAVE
  // ─────────────────────────────────────
 // ─────────────────────────────────────
// SAVE
// ─────────────────────────────────────
const handleSave = async () => {
  try {
    setSaving(true)

    const toNumber = (value) => {
      const n = Number(value)

      return Number.isNaN(n) || value === ""
        ? null
        : n
    }

    const payload = {}

    // ─────────────────────────────
    // COMMON
    // ─────────────────────────────
    if (account.name !== undefined) {
      payload.name = account.name
    }

    // ─────────────────────────────
    // WAR ACCOUNT
    // allowed:
    // name, broker
    // ─────────────────────────────
    if (account.type === "WAR ACCOUNT") {
      payload.broker =
        account.broker || "unknown"
    }

    // ─────────────────────────────
    // NORMAL ACCOUNT
    // allowed:
    // name, broker, trackRules
    // ─────────────────────────────
    if (
      account.type ===
      "NORMAL ACCOUNT"
    ) {
      payload.broker =
        account.broker || "unknown"

      payload.trackRules =
        account.trackRules || []
    }

    // ─────────────────────────────
    // PROP ACCOUNT
    // allowed:
    // name, propRules, propFirm
    // ─────────────────────────────
    if (
      account.type ===
      "PROP ACCOUNT"
    ) {
      payload.propRules = {
        maxDrawdownPercent:
          toNumber(
            account.propRules
              ?.maxDrawdownPercent
          ),

        dailyDrawdownPercent:
          toNumber(
            account.propRules
              ?.dailyDrawdownPercent
          ),

        profitTarget:
          toNumber(
            account.propRules
              ?.profitTarget
          ),

        maxTradesPerDay:
          toNumber(
            account.propRules
              ?.maxTradesPerDay
          ),

        maxLotSize:
          toNumber(
            account.propRules
              ?.maxLotSize
          ),

        allowedSessions:
          account.propRules
            ?.allowedSessions || [],
      }

      payload.propFirm = {
        firmName:
          account.propFirm?.firmName ||
          null,

        phase:
          account.propFirm?.phase ||
          "phase_1",

        status:
          account.propFirm?.status ||
          "active",
      }
    }

    await accountApi.update(
      accountId,
      payload
    )

    toast.success(
      "Account updated"
    )

    navigate("/accounts")
  } catch (err) {
    toast.error(
      "Failed to update account",
      {
        description:
          err?.message ||
          "Something went wrong",
      }
    )
  } finally {
    setSaving(false)
  }
}

  // ─────────────────────────────────────
  // STATES
  // ─────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6">
        Loading account...
      </div>
    )
  }

  if (!account) {
    return (
      <div className="p-6 warning">
        Account not found
      </div>
    )
  }

  const isProp =
    account.type ===
    "PROP ACCOUNT"

  const isWar =
    account.type ===
    "WAR ACCOUNT"

  const isTrackOnly =
    account.ruleMode ===
    "track-only"

    const getBadgeClass = (type) => {
  switch (type?.toLowerCase()) {
    case "prop account":
      return "bg-primary text-white";
    case "normal account":
      return "bg-success text-white";
    case "war account":
      return "bg-danger text-white";
    default:
      return "bg-muted text-foreground";
  }
};

  // ─────────────────────────────────────
  // UI
  // ─────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Account
          </h1>

          <p className="text-muted-foreground mt-1">
            Configure account
            settings and trading
            rules
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Badge className={`p-3 ${getBadgeClass(account.type)}`}>
             {account.type}
          </Badge>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Balance
            </p>

            <p className="text-lg font-semibold">
              {account.currency}
              {Number(
                account.balanceSnapshot ||
                  0
              ).toLocaleString()}
            </p>
          </div>

        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="xl:col-span-2 space-y-6">

          {/* ACCOUNT */}
          <Card>

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint size={15} className="text-primary"/>
                <span>Account Identity</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* NAME */}
                <div className="space-y-2">

                  <Label>
                    Account Name
                  </Label>

                  <Input
                    value={
                      account.name || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "name",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* TYPE */}
                <div className="space-y-2">

                  <Label>
                    Account Type
                  </Label>

                  <Input
                    disabled
                    value={
                      account.type || ""
                    }
                    className="opacity-70"
                  />

                </div>

                {/* CURRENCY */}
                <div className="space-y-2">

                  <Label>
                    Currency
                  </Label>

                  <Input
                    disabled
                    value={
                      account.currency ||
                      ""
                    }
                    className="opacity-70"
                  />

                </div>

                {/* BROKER */}
                {!isProp && (
                  <div className="space-y-2 md:col-span-3">

                    <Label>
                      Broker
                    </Label>

                    <Input
                      value={
                        account.broker ||
                        ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "broker",
                          e.target.value
                        )
                      }
                    />

                  </div>
                )}

              </div>

            </CardContent>

          </Card>

          {/* FINANCIAL */}
          <Card>

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleDollarSign size={15} className="text-primary" />
                <span>Financial Settings</span>
              </CardTitle>
            </CardHeader>

            <CardContent>

              <div
                className={`grid gap-4 ${
                  isProp
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >

                {/* STARTING BALANCE */}
                <div className="space-y-2">

                  <Label>
                    Starting Balance
                  </Label>

                  <Input
                    disabled
                    className="opacity-70"
                    value={`${account.currency}${Number(
                      account.startingBalance ||
                        0
                    ).toLocaleString()}`}
                  />

                  <p className="text-xs text-muted-foreground">
                    Locked after
                    account creation.
                  </p>

                </div>

                {/* ACCOUNT SIZE */}
                {isProp && (
                  <div className="space-y-2">

                    <Label>
                      Account Size
                    </Label>

                    <Input
                      disabled
                      className="opacity-70"
                      value={`${account.currency}${Number(
                        account.accountSize ||
                          0
                      ).toLocaleString()}`}
                    />

                    <p className="text-xs text-muted-foreground">
                      Prop challenge
                      size cannot be
                      modified.
                    </p>

                  </div>
                )}

              </div>

            </CardContent>

          </Card>

          {/* RULE ENGINE */}
          {!isWar && (
            <Card>

              <CardHeader>

                <div className="flex items-center justify-between">

                  <CardTitle className="flex items-center gap-2">
                    <TicketX size={15} className="text-primary" />
                    <span>Rule Engine</span>
                  </CardTitle>

                  <Badge
                    variant="outline"
                    className="uppercase"
                  >
                    {account.ruleMode ||
                      "track-only"}
                  </Badge>

                </div>

              </CardHeader>

              <CardContent className="space-y-5">

                {/* ENFORCED */}
                {!isTrackOnly && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* MAX DD */}
                    <div className="space-y-2">

                      <Label>
                        Max Drawdown %
                      </Label>

                      <Input
                        type="number"
                        value={
                          account.propRules
                            ?.maxDrawdownPercent ||
                          ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "propRules",
                            "maxDrawdownPercent",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* DAILY DD */}
                    <div className="space-y-2">

                      <Label>
                        Daily DD %
                      </Label>

                      <Input
                        type="number"
                        value={
                          account.propRules
                            ?.dailyDrawdownPercent ||
                          ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "propRules",
                            "dailyDrawdownPercent",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* PROFIT TARGET */}
                    <div className="space-y-2">

                      <Label>
                        Profit Target %
                      </Label>

                      <Input
                        type="number"
                        value={
                          account.propRules
                            ?.profitTarget ||
                          ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "propRules",
                            "profitTarget",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* MAX TRADES */}
                    <div className="space-y-2">

                      <Label>
                        Max Trades/Day
                      </Label>

                      <Input
                        type="number"
                        value={
                          account.propRules
                            ?.maxTradesPerDay ||
                          ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "propRules",
                            "maxTradesPerDay",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>
                )}

                {/* TRACK ONLY */}
                {isTrackOnly && (
                  <div className="space-y-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <h3 className="font-medium">
                          Trading Rules
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          Personal
                          discipline and
                          behavioral
                          rules
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={
                          addCustomRule
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rule
                      </Button>

                    </div>

                    <div className="space-y-3">

                      {account.trackRules
                        ?.length === 0 && (
                        <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                          No custom
                          rules added
                        </div>
                      )}

                      {account.trackRules?.map(
                        (
                          rule,
                          index
                        ) => (
                          <div
                            key={index}
                            className="flex items-center gap-3"
                          >

                            <Input
                              value={rule.title || ""}
                              placeholder="Enter trading rule..."
                              onChange={(
                                e
                              ) =>
                                updateCustomRule(
                                  index,
                                  e.target
                                    .value
                                )
                              }
                            />

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                removeCustomRule(
                                  index
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

              </CardContent>

            </Card>
          )}

          {/* PROP */}
          {isProp && (
            <Card>

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CircleCheck size={15} className="text-primary" />
                  <span> Prop Firm Configuration</span>
                  
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* FIRM */}
                <div className="space-y-2">

                  <Label>
                    Firm Name
                  </Label>

                  <Input
                    value={
                      account.propFirm
                        ?.firmName || ""
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "propFirm",
                        "firmName",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* PHASE */}
                  <div className="space-y-2">

                    <Label>
                      Phase
                    </Label>

                    <Select
                      value={
                        account.propFirm
                          ?.phase ||
                        "phase_1"
                      }
                      onValueChange={(
                        value
                      ) =>
                        handleNestedChange(
                          "propFirm",
                          "phase",
                          value
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="phase_1">
                          Phase 1
                        </SelectItem>

                        <SelectItem value="phase_2">
                          Phase 2
                        </SelectItem>

                        <SelectItem value="funded">
                          Funded
                        </SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                  {/* STATUS */}
                  <div className="space-y-2">

                    <Label>
                      Status
                    </Label>

                    <Select
                      value={
                        account.propFirm
                          ?.status ||
                        "active"
                      }
                      onValueChange={(
                        value
                      ) =>
                        handleNestedChange(
                          "propFirm",
                          "status",
                          value
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="active">
                          Active
                        </SelectItem>

                        <SelectItem value="passed">
                          Passed
                        </SelectItem>

                        <SelectItem value="failed">
                          Failed
                        </SelectItem>

                        <SelectItem value="blown">
                          Blown
                        </SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                </div>

              </CardContent>

            </Card>
          )}

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* OVERVIEW */}
          <Card>

            <CardHeader>
              <CardTitle>
                Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="flex justify-between">

                <span className="text-muted-foreground">
                  Balance
                </span>

                <span className="font-semibold">
                  {account.currency}
                  {Number(
                    account.balanceSnapshot ||
                      0
                  ).toLocaleString()}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-muted-foreground">
                  Total Trades
                </span>

                <span>
                  {account.performance
                    ?.totalTrades || 0}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-muted-foreground">
                  Win Rate
                </span>

                <span>
                  {account.performance
                    ?.winRate || 0}
                  %
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-muted-foreground">
                  Profit Factor
                </span>

                <span>
                  {account.performance
                    ?.profitFactor || 0}
                </span>

              </div>

            </CardContent>

          </Card>

          {/* EQUITY */}
          <Card>

            <CardHeader>
              <CardTitle>
                Equity Curve
              </CardTitle>
            </CardHeader>

            <CardContent>

              <div className="h-55">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={equityData}
                  >

                    <defs>

                      <linearGradient
                        id="equityGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="5%"
                          stopColor="var(--success)"
                          stopOpacity={
                            0.4
                          }
                        />

                        <stop
                          offset="95%"
                          stopColor="var(--success)"
                          stopOpacity={
                            0
                          }
                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.08}
                    />

                    <XAxis
                      dataKey="day"
                    />

                    <YAxis />

                    <Tooltip />

                    <RechartArea
                      type="monotone"
                      dataKey="equity"
                      stroke="var(--success"
                      strokeWidth={2}
                      fill="url(#equityGradient)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </CardContent>

          </Card>

          {/* NOTE */}
          <Card className="card-elevated border-warning/20 bg-warning/10">

            <CardContent className="p-4">
              <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <CircleAlert size={15} />
                <h3 className="font-medium">
                  Risk Management
                  Note
                </h3>
               </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your rule engine
                  affects behavioral
                  tracking, alerts,
                  and performance
                  analytics. Keep
                  your rules aligned
                  with your trading
                  plan to maintain
                  consistency.
                </p>

              </div>

            </CardContent>

          </Card>

        </div>

      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4 pt-2">

        <Button
          variant="outline"
          onClick={() =>
            navigate("/accounts")
          }
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </Button>

      </div>

    </div>
  )
}