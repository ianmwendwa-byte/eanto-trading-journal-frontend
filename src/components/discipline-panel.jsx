// components/discipline-panel.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function DisciplinePanel() {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Discipline</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">

        {/* Adherence */}
        <div>
          <p className="text-sm mb-1">Rule Adherence</p>
          <Progress value={78} />
          <span className="text-xs text-muted-foreground">
            78%
          </span>
        </div>

        {/* Flags */}
        <div className="flex flex-col gap-2">
          <Badge variant="destructive">
            Overtrading: YES
          </Badge>

          <Badge variant="secondary">
            Risk Consistency: OK
          </Badge>
        </div>

      </CardContent>
    </Card>
  )
}