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
              "card-elevated transition-all hover:shadow-lg",

              // BACKGROUND VARIATIONS USING DESIGN TOKENS
              stat.type === "profit" &&
                "bg-success/5 border-success/20 dark:bg-success/10 dark:border-success/30",

              stat.type === "loss" &&
                "bg-destructive/5 border-destructive/20 dark:bg-destructive/10 dark:border-destructive/30",

              stat.type === "neutral" &&
                "bg-muted/30 border-border"
            )}
          >
            <CardContent className="p-6 flex flex-col gap-5">

              {/* HEADER */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>

                <div
                  className={cn(
                    "p-2 rounded-lg",

                    stat.type === "profit" && "bg-success/10",
                    stat.type === "loss" && "bg-destructive/10",
                    stat.type === "neutral" && "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",

                      stat.type === "profit" && "text-success",
                      stat.type === "loss" && "text-destructive",
                      stat.type === "neutral" && "text-muted-foreground"
                    )}
                  />
                </div>
              </div>

              {/* VALUE */}
              <div>
                <h3
                  className={cn(
                    "text-3xl lg:text-4xl font-bold tracking-tight font-heading",

                    stat.type === "profit" && "profit-text",
                    stat.type === "loss" && "loss-text",
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

            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}