import { Button } from "@/components/ui/button"
import { AddAccount } from "./add-account"

export function AccountsHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h2 className="text-xl font-semibold">Portifolio Overview</h2>
        <p className="text-sm text-muted-foreground">
          Manage your trading accounts
        </p>
      </div>

    </div>
  )
}