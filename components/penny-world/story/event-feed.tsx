"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGameStore } from "@/lib/stores/use-game-store"
import { cn } from "@/lib/utils"

import { EventFeedItem } from "./event-feed-item"
import { NarrativeBanner } from "./narrative-banner"

interface EventFeedProps {
  tone?: "default" | "pax"
}

export function EventFeed({ tone = "default" }: EventFeedProps) {
  const events = useGameStore((s) => s.events)
  const lastError = useGameStore((s) => s.lastError)
  const latest = events[0]?.narrative ?? null
  const isPax = tone === "pax"

  const inner = (
    <>
      {lastError ? (
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            isPax
              ? "border-destructive/40 bg-destructive/20 text-background"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {lastError}
        </p>
      ) : null}
      <NarrativeBanner text={latest} tone={tone} />
      <ScrollArea
        className={cn(
          "h-[min(18rem,38vh)] rounded-lg border",
          isPax ? "border-background/15" : "border-border"
        )}
      >
        <ul className="space-y-2 p-2">
          {events.map((e) => (
            <EventFeedItem key={e.id} event={e} tone={tone} />
          ))}
        </ul>
      </ScrollArea>
    </>
  )

  if (isPax) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 text-background">
        <div>
          <h3 className="text-sm font-semibold text-background">Story log</h3>
          <p className="text-xs text-background/65">
            Simulation turns and NPC talks both land here and on the map.
          </p>
        </div>
        {inner}
      </div>
    )
  }

  return (
    <Card className="flex min-h-0 flex-col border-border shadow-sm">
      <CardHeader>
        <CardTitle>Story log</CardTitle>
        <CardDescription>
          Turns and conversations, newest first.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        {inner}
      </CardContent>
    </Card>
  )
}
