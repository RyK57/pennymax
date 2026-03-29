import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

interface BalanceHudProps {
  balanceCents: number
  tone?: "default" | "pax"
}

export function BalanceHud({ balanceCents, tone = "default" }: BalanceHudProps) {
  if (tone === "pax") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-background/90">
        <span className="text-background/55">Balance</span>
        <span className="font-semibold tabular-nums text-background">
          {formatUsdFromCents(balanceCents)}
        </span>
      </span>
    )
  }

  return (
    <Card size="sm" className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Balance
        </CardTitle>
        <Badge variant="secondary" className="rounded-md">
          Penny
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatUsdFromCents(balanceCents)}
        </p>
      </CardContent>
    </Card>
  )
}
