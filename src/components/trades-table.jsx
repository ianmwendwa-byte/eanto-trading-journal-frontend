import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TradesTable() {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="font-heading">Recent Trades</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-sm text-muted-foreground">
          Trades are managed through the Account Journal.
        </div>
      </CardContent>
    </Card>
  )
}