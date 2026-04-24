import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AccountCard({ account }) {
  const isProp = account.type === "prop"
  const isWar = account.type === "war"

  return (
    <Card
      className={cn(
        "p-5 flex flex-col gap-4 transition hover:shadow-md border",

        // background logic
        isProp && "bg-yellow-50 dark:bg-yellow-950/20",
        isWar && "bg-red-50 dark:bg-red-950/20",
        !isProp && !isWar && "bg-green-50 dark:bg-green-950/10"
      )}
    >

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-base">{account.name}</h3>
          <p className="text-xs text-muted-foreground">
            {account.broker || "No broker"}
          </p>
        </div>

        <span
          className={cn(
            "text-xs px-2 py-1 rounded-md border",
            isProp && "border-yellow-400 text-yellow-700",
            isWar && "border-red-400 text-red-700",
            !isProp && !isWar && "border-green-400 text-green-700"
          )}
        >
          {account.type}
        </span>
      </div>

      {/* BALANCE */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {account.currency} {account.balanceSnapshot || 0}
        </h2>
        <p className="text-xs text-muted-foreground">
          Starting balance: {account.startingBalance || 0}
        </p>
      </div>

      {/* RULE MODE */}
      <div className="text-xs text-muted-foreground">
        Rule Mode: <span className="font-medium">{account.ruleMode}</span>
      </div>

      {/* PROP INFO */}
      {isProp && account.propFirm?.enabled && (
        <div className="text-xs space-y-1 border rounded-md p-2 bg-white/40 dark:bg-black/20">
          <p>Phase: {account.propFirm.phase}</p>
          <p>Status: {account.propFirm.status}</p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-2 pt-2">
        <Button size="sm" variant="outline" className="w-full">
          View
        </Button>

        <Button size="sm" variant="secondary" className="w-full">
          Edit
        </Button>

        <Button size="sm" variant="destructive" className="w-full">
          Delete
        </Button>
      </div>
    </Card>
  )
}