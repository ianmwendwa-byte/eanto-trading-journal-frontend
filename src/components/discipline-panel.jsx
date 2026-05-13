// components/discipline-panel.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function DisciplinePanel() {
  return (
    <Card className="card-elevated lg:col-span-1">
      <CardHeader>
        <CardTitle className="font-heading">Discipline</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">

        {/* Adherence */}
        <div>
          <p className="text-sm text-foreground font-medium mb-1">Rule Adherence</p>
          <Progress value={78} />
          <span className="text-xs text-muted-foreground">
            78%
          </span>
        </div>

        {/* Flags */}
        <div className="flex flex-col gap-2">
          <Badge variant="destructive" className="loss-text">
            Overtrading: YES
          </Badge>

          <Badge variant="secondary" className="text-muted-foreground">
            Risk Consistency: OK
          </Badge>
        </div>

      </CardContent>
    </Card>
  )
}