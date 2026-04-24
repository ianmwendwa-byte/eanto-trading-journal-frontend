import { Button } from "@/components/ui/button"
import { AddAccount } from "./add-account"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">

      <h3 className="text-lg font-semibold">
        No accounts yet
      </h3>

      <p className="text-sm text-muted-foreground">
        Create your first trading account to start journaling
      </p>

      <div>
         <AddAccount/>
      </div>

    </div>
  )
}