import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TreeHealthBadgeProps {
  treeHealth: number
  tone?: "default" | "pax"
}

export function TreeHealthBadge({
  treeHealth,
  tone = "default",
}: TreeHealthBadgeProps) {
  const label =
    treeHealth >= 70 ? "Thriving" : treeHealth >= 40 ? "Steady" : "Needs care"

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md",
        tone === "pax"
          ? "border-background/25 bg-background/10 text-background"
          : "border-border bg-card/80 text-foreground"
      )}
    >
      Tree {Math.round(treeHealth)}/100 · {label}
    </Badge>
  )
}
