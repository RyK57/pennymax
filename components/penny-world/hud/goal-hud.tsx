import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

interface GoalHudProps {
  goalAmountCents: number
  balanceCents: number
  tone?: "default" | "pax"
}

export function GoalHud({
  goalAmountCents,
  balanceCents,
  tone = "default",
}: GoalHudProps) {
  const pct = goalAmountCents
    ? Math.min(100, Math.round((balanceCents / goalAmountCents) * 100))
    : 0

  if (tone === "pax") {
    return (
      <div className="w-full min-w-[6rem] space-y-1 text-xs text-background/90">
        <div className="flex justify-between gap-2 text-[0.65rem] uppercase tracking-wide text-background/55">
          <span>Goal</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-background/15">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="truncate text-[0.7rem] text-background/75 tabular-nums">
          {formatUsdFromCents(goalAmountCents)}
        </p>
      </div>
    )
  }

  return (
    <Card size="sm" className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          House goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg font-semibold tabular-nums text-foreground">
          {formatUsdFromCents(goalAmountCents)}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{pct}% toward goal</p>
      </CardContent>
    </Card>
  )
}
