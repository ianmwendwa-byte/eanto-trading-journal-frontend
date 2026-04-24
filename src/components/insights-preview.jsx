// components/insights-preview.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function InsightsPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div>
          <p className="text-sm text-muted-foreground">Best Pair</p>
          <p className="font-medium">EURUSD</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Worst Habit</p>
          <p className="font-medium">Overtrading</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Best Session</p>
          <p className="font-medium">London</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Worst Session</p>
          <p className="font-medium">New York</p>
        </div>

      </CardContent>
    </Card>
  )
}