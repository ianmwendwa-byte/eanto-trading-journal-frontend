import { AccountCard } from "./account-card"

export function AccountsGrid({ accounts }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  )
}