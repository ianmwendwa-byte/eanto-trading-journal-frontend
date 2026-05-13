import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChartsSection() {
  return (
    <Card className="card-elevated lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-heading">Equity Curve</CardTitle>
      </CardHeader>

      <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
        Chart Placeholder
      </CardContent>
    </Card>
  )
}