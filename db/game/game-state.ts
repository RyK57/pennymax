"use server"

import type { GameStateRow } from "@/db/game/types"

const MOCK_GAME_ID = "local-prototype-game"

function defaultRow(): GameStateRow {
  const now = new Date().toISOString()
  return {
    id: MOCK_GAME_ID,
    balanceCents: 1_250_00,
    goalAmountCents: 50_000_00,
    treeHealth: 72,
    tags: { streak_days: 3, impulsive_spender: false },
    scenarioLabel: "Saving for the tree house",
    updatedAt: now,
  }
}

export async function getOrCreateGameState(): Promise<GameStateRow> {
  return defaultRow()
}

export async function updateGameStatePatch(
  patch: Partial<
    Pick<
      GameStateRow,
      "balanceCents" | "goalAmountCents" | "treeHealth" | "tags" | "scenarioLabel"
    >
  >
): Promise<GameStateRow> {
  return { ...defaultRow(), ...patch, updatedAt: new Date().toISOString() }
}
