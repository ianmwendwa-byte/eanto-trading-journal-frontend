import { AccountCard } from "./account-card"

export function AccountsGrid({
  accounts,
  onDelete,
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

      {accounts.map((account) => (
        <AccountCard
          key={account._id}
          account={account}
          onDelete={onDelete}
        />
      ))}

    </div>
  )
}