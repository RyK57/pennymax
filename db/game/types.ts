import type { GameTags } from "@/lib/types/game"

export interface GameStateRow {
  id: string
  balanceCents: number
  goalAmountCents: number
  treeHealth: number
  tags: GameTags
  scenarioLabel: string
  updatedAt: string
}

export interface EventRow {
  id: string
  gameId: string
  narrative: string
  actionLabel: string | null
  createdAt: string
  payload: Record<string, unknown> | null
}

export interface EventSummaryRow {
  id: string
  gameId: string
  summaryText: string
  coversFrom: string
  coversTo: string
  createdAt: string
}
