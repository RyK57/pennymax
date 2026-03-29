export type GuidedPersonalityType =
  | "explorer"
  | "creator"
  | "helper"
  | "leader"

export type GuidedSpenderStyle = "spend" | "saver" | "split" | ""

export type GuidedDifficulty = "easy" | "medium" | "hard" | ""

/** Stored on profile after onboarding (never empty). */
export type GuidedDifficultySetting = "easy" | "medium" | "hard"

export interface GuidedProfile {
  /** Player name — Penny & Grandpa use this in dialogue */
  childName: string
  /** Primary DSG personality for earning scenarios (derived from chip picks) */
  personalityType: GuidedPersonalityType
  /** Language band for the agent */
  ageRange: string
  /** Narrative label for the savings arc */
  savingGoalLabel: string
  /** Win target in cents (Money Tree) */
  goalAmountCents: number
  /** Interest chip ids from onboarding */
  interests: string[]
  /** Up to 2 personality chips (leader, helper, creator, explorer, thinker, funny) */
  personalityChipSelections: string[]
  spenderStyle: GuidedSpenderStyle
  /** Mall temptation chip ids */
  temptation: string[]
  difficulty: GuidedDifficultySetting
  extraNote?: string
}

export interface GuidedScenePayload {
  sessionId: string
  turnIndex: number
  scriptStep: number
  stepTitle: string
  sceneDescription: string
  imagePrompt: string
  imageUrl: string
  question: string
  suggestedActions: string[]
  narrativeSummary: string
  balanceCents: number
  goalAmountCents: number
  score: number
  treeHealth: number
  outcome: "playing" | "won" | "lost"
  grandpaHint?: string | null
  pennyLetter?: string | null
}

export function deriveGuidedPersonalityType(
  chips: string[]
): GuidedPersonalityType {
  const core: GuidedPersonalityType[] = [
    "explorer",
    "creator",
    "helper",
    "leader",
  ]
  for (const id of chips) {
    if (core.includes(id as GuidedPersonalityType)) {
      return id as GuidedPersonalityType
    }
  }
  if (chips.includes("thinker")) return "helper"
  if (chips.includes("funny")) return "creator"
  return "helper"
}
