"use server"

import type { GameTags } from "@/lib/types/game"

import type { EventRow, EventSummaryRow } from "@/db/game/types"

const memoryEvents: EventRow[] = []
const memorySummaries: EventSummaryRow[] = []

export async function appendEvent(input: {
  id?: string
  gameId: string
  narrative: string
  actionLabel?: string
  payload?: Record<string, unknown>
}): Promise<EventRow> {
  const row: EventRow = {
    id:
      input.id ??
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `evt-${Date.now()}`),
    gameId: input.gameId,
    narrative: input.narrative,
    actionLabel: input.actionLabel ?? null,
    createdAt: new Date().toISOString(),
    payload: input.payload ?? null,
  }
  memoryEvents.unshift(row)
  return row
}

export async function listRecentEvents(
  gameId: string,
  limit = 20
): Promise<EventRow[]> {
  return memoryEvents.filter((e) => e.gameId === gameId).slice(0, limit)
}

export async function listSummaries(gameId: string): Promise<EventSummaryRow[]> {
  return memorySummaries.filter((s) => s.gameId === gameId)
}

export async function persistTurnSnapshot(input: {
  actionDescription: string
  narrative: string
  stateAfter: {
    balanceCents: number
    goalAmountCents: number
    treeHealth: number
    tags: GameTags
  }
}): Promise<void> {
  await appendEvent({
    gameId: "local-prototype-game",
    narrative: input.narrative,
    actionLabel: input.actionDescription,
    payload: { stateAfter: input.stateAfter, source: "simulation" },
  })
}

export async function persistNpcChatSnapshot(input: {
  eventId: string
  npcId: string
  displayName: string
  userText: string
  assistantText: string
  narrative: string
  actionLabel: string
}): Promise<void> {
  await appendEvent({
    id: input.eventId,
    gameId: "local-prototype-game",
    narrative: input.narrative,
    actionLabel: input.actionLabel,
    payload: {
      source: "npc",
      npcId: input.npcId,
      userText: input.userText,
      assistantText: input.assistantText,
      displayName: input.displayName,
    },
  })
}
