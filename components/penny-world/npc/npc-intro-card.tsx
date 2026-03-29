import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { NpcDefinition } from "@/lib/npc-catalog"
import { cn } from "@/lib/utils"

import { NpcPortrait } from "./npc-portrait"

interface NpcIntroCardProps {
  npc: NpcDefinition
  tone?: "default" | "pax"
}

export function NpcIntroCard({ npc, tone = "default" }: NpcIntroCardProps) {
  const isPax = tone === "pax"

  return (
    <Card
      size="sm"
      className={cn(
        "overflow-hidden shadow-sm",
        isPax
          ? "border-background/15 bg-background/10 text-background"
          : "border-border bg-muted/20"
      )}
    >
      <div className="flex gap-3 p-3">
        <NpcPortrait
          npcId={npc.id}
          className={cn(
            "h-24 w-24 shrink-0 rounded-lg ring-1",
            isPax ? "ring-background/20" : "ring-border"
          )}
        />
        <CardHeader className="flex-1 space-y-1 p-0">
          <CardTitle
            className={cn("text-base", isPax && "text-background")}
          >
            {npc.displayName}
          </CardTitle>
          <CardDescription
            className={cn("text-xs", isPax && "text-background/70")}
          >
            {npc.tagline}
          </CardDescription>
        </CardHeader>
      </div>
      <CardContent
        className={cn(
          "border-t pt-3 pb-3",
          isPax ? "border-background/15" : "border-border"
        )}
      >
        <p
          className={cn(
            "text-xs leading-relaxed",
            isPax ? "text-background/75" : "text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "font-medium",
              isPax ? "text-background" : "text-foreground"
            )}
          >
            Try asking about:{" "}
          </span>
          {npc.talkAbout}
        </p>
      </CardContent>
    </Card>
  )
}
