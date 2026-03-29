"use client"

import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import type { GameEventItem } from "@/lib/types/game"
import { cn } from "@/lib/utils"

interface EventFeedItemProps {
  event: GameEventItem
  tone?: "default" | "pax"
}

export function EventFeedItem({ event, tone = "default" }: EventFeedItemProps) {
  const isPax = tone === "pax"
  const time = new Date(event.createdAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })

  const isNpc = event.source === "npc"

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-lg border px-3 py-2 shadow-sm",
        isPax
          ? "border-background/15 bg-background/10"
          : "border-border bg-card/80"
      )}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "rounded-md text-[0.65rem] uppercase tracking-wide",
            isNpc
              ? isPax
                ? "border-accent/40 bg-background/5 text-accent"
                : "border-accent/50 text-accent-foreground"
              : isPax
                ? "border-background/25 bg-background/5 text-background/85"
                : "border-border"
          )}
        >
          {isNpc ? "Chat" : "Turn"}
        </Badge>
        {event.actionLabel ? (
          <p
            className={cn(
              "text-xs font-medium",
              isPax ? "text-background/65" : "text-muted-foreground"
            )}
          >
            {event.actionLabel}
          </p>
        ) : null}
      </div>
      <p
        className={cn(
          "text-sm",
          isPax ? "text-background/95" : "text-foreground"
        )}
      >
        {event.narrative}
      </p>
      <p
        className={cn(
          "mt-1 text-xs",
          isPax ? "text-background/50" : "text-muted-foreground"
        )}
      >
        {time}
      </p>
    </motion.li>
  )
}
