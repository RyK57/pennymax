/** Guided beats for the default tree-house scenario (matches action preset strings where possible). */

export interface StoryBeat {
  id: string
  title: string
  blurb: string
  /** Exact strings sent to simulate-turn (overlap with action presets). */
  suggestedActions: string[]
}

export const STORY_BEATS: StoryBeat[] = [
  {
    id: "beat-welcome",
    title: "Name the dream",
    blurb:
      "Penny’s saving for a backyard tree house. Help her take the first real step: make the goal feel real and tuck away a little cash on purpose.",
    suggestedActions: [
      "Start a labeled jar for the house goal",
      "Put $5 in savings",
      "Skip a snack run and move $3 to savings",
    ],
  },
  {
    id: "beat-rhythm",
    title: "Steady money rhythm",
    blurb:
      "Allowance and chores are Penny’s engine. This beat is about building a habit—banking part of what comes in and noticing where dollars go.",
    suggestedActions: [
      "Deposit half of allowance at the bank",
      "Negotiate extra chores for allowance",
      "Track every dollar in a notebook for one week",
    ],
  },
  {
    id: "beat-tradeoffs",
    title: "Spend or wait?",
    blurb:
      "Fun stuff shows up every week. Practice pausing: compare prices, say no once with a reason, or spend small and see how it feels next to the tree house goal.",
    suggestedActions: [
      "Compare three prices online before buying",
      "Say no to an impulse buy and write why",
      "Spend $5 at the mall on a keychain",
    ],
  },
  {
    id: "beat-learn-give",
    title: "Learn and lend a hand",
    blurb:
      "Money isn’t only save vs spend—it's understanding and community. Talk to someone wise, plan a low-spend hangout, or chip in for others.",
    suggestedActions: [
      "Research what 'interest' means with Grandpa",
      "Plan a no-spend weekend with friends",
      "Donate $1 to the class fundraiser",
    ],
  },
  {
    id: "beat-keep-going",
    title: "Keep the tree growing",
    blurb:
      "Surprises happen. Penny can still steer: round up savings mentally, replay a strong save move, or imagine what to do with a lucky break.",
    suggestedActions: [
      "Round up purchases mentally and save the difference",
      "Win a small contest prize—save, spend, or split?",
      "Put $5 in savings",
    ],
  },
]

/** Simulation turns only (NPC chats do not advance the beat counter). */
export function countSimulationTurns(
  events: { source?: string }[]
): number {
  return events.filter((e) => e.source !== "npc").length
}

/** Advance one beat every two completed simulation turns, capped at last beat. */
export function guidanceBeatIndexFromSimulationCount(
  simulationTurnCount: number,
  beatCount: number
): number {
  if (beatCount <= 0) return 0
  const idx = Math.floor(simulationTurnCount / 2)
  return Math.min(Math.max(0, idx), beatCount - 1)
}

export function getActiveStoryBeat(
  beatIndex: number
): StoryBeat | undefined {
  return STORY_BEATS[beatIndex]
}
