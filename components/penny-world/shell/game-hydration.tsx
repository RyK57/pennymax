"use client"

import { useEffect } from "react"

import { getOrCreateGameState } from "@/db/game/game-state"
import { listRecentEvents } from "@/db/game/events"
import { useGameStore } from "@/lib/stores/use-game-store"
import type { GameEventItem, StoryEventSource } from "@/lib/types/game"

export function GameHydration() {
  const setFromServerHydration = useGameStore((s) => s.setFromServerHydration)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const row = await getOrCreateGameState()
      const dbEvents = await listRecentEvents(row.id, 30)
      if (cancelled) return

      const events: GameEventItem[] = dbEvents.map((e) => {
        const p = e.payload as Record<string, unknown> | null | undefined
        const src = p?.source as StoryEventSource | undefined
        const npcId = typeof p?.npcId === "string" ? p.npcId : undefined
        return {
          id: e.id,
          narrative: e.narrative,
          createdAt: e.createdAt,
          actionLabel: e.actionLabel ?? undefined,
          ...(src ? { source: src } : {}),
          ...(npcId ? { npcId } : {}),
        }
      })

      setFromServerHydration({
        balanceCents: row.balanceCents,
        goalAmountCents: row.goalAmountCents,
        treeHealth: row.treeHealth,
        tags: row.tags,
        scenarioLabel: row.scenarioLabel,
        ...(events.length ? { events } : {}),
      })
    })()
    return () => {
      cancelled = true
    }
  }, [setFromServerHydration])

  return null
}
