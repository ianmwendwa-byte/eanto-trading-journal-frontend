import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"

const stats = [
  {
    label: "Balance",
    value: "$1,240",
    type: "neutral",
    icon: Wallet,
  },
  {
    label: "Today PnL",
    value: "+$120",
    type: "profit",
    icon: TrendingUp,
  },
  {
    label: "Win Rate",
    value: "68%",
    type: "profit",
    icon: Activity,
  },
  {
    label: "Loss Streak",
    value: "3",
    type: "loss",
    icon: TrendingDown,
  },
]

export function StatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <Card
            key={stat.label}
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-lg",

              // BACKGROUND GRADIENTS
              stat.type === "profit" &&
                "bg-linear-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/30 dark:to-green-900/20",

              stat.type === "loss" &&
                "bg-linear-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950/30 dark:to-red-900/20",

              stat.type === "neutral" &&
                "bg-linear-to-br from-muted/40 to-muted/20"
            )}
          >
            <CardContent className="p-6 flex flex-col gap-5">

              {/* HEADER */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>

                <div
                  className={cn(
                    "p-2 rounded-lg",

                    stat.type === "profit" && "bg-green-200/40",
                    stat.type === "loss" && "bg-red-200/40",
                    stat.type === "neutral" && "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",

                      stat.type === "profit" && "text-green-700",
                      stat.type === "loss" && "text-red-700",
                      stat.type === "neutral" && "text-muted-foreground"
                    )}
                  />
                </div>
              </div>

              {/* VALUE */}
              <div>
                <h3
                  className={cn(
                    "text-3xl lg:text-4xl font-bold tracking-tight",

                    stat.type === "profit" && "text-green-700",
                    stat.type === "loss" && "text-red-700",
                    stat.type === "neutral" && "text-foreground"
                  )}
                >
                  {stat.value}
                </h3>

                <p className="text-xs text-muted-foreground mt-1">
                  {stat.type === "profit" && "Strong performance"}
                  {stat.type === "loss" && "Drawdown phase"}
                  {stat.type === "neutral" && "Stable account"}
                </p>
              </div>

              {/* GLOW EFFECT */}
              <div
                className={cn(
                  "absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-20",

                  stat.type === "profit" && "bg-green-400",
                  stat.type === "loss" && "bg-red-400",
                  stat.type === "neutral" && "bg-gray-400"
                )}
              />

            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}