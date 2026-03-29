import { create } from "zustand"

import type { GuidedProfile, GuidedScenePayload } from "@/lib/types/guided"

export type GuidedPhase = "onboarding" | "playing" | "ended"

export interface GuidedStoreState {
  phase: GuidedPhase
  profile: GuidedProfile | null
  sessionId: string | null
  turnIndex: number
  scriptStep: number
  stepTitle: string
  sceneDescription: string
  imageUrl: string
  question: string
  suggestedActions: string[]
  narrativeSummary: string
  balanceCents: number
  goalAmountCents: number
  score: number
  treeHealth: number
  outcome: GuidedScenePayload["outcome"]
  grandpaHint: string | null
  pennyLetter: string | null
  isLoading: boolean
  lastError: string | null

  setPhase: (p: GuidedPhase) => void
  setProfile: (p: GuidedProfile) => void
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
  applyScene: (payload: GuidedScenePayload) => void
  reset: () => void
}

const initial = {
  phase: "onboarding" as GuidedPhase,
  profile: null as GuidedProfile | null,
  sessionId: null as string | null,
  turnIndex: 0,
  scriptStep: 1,
  stepTitle: "",
  sceneDescription: "",
  imageUrl: "",
  question: "",
  suggestedActions: [] as string[],
  narrativeSummary: "",
  balanceCents: 0,
  goalAmountCents: 0,
  score: 0,
  treeHealth: 0,
  outcome: "playing" as GuidedScenePayload["outcome"],
  grandpaHint: null as string | null,
  pennyLetter: null as string | null,
  isLoading: false,
  lastError: null as string | null,
}

export const useGuidedStore = create<GuidedStoreState>((set) => ({
  ...initial,

  setPhase: (p) => set({ phase: p }),
  setProfile: (p) => set({ profile: p }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ lastError: msg }),

  applyScene: (payload) =>
    set({
      sessionId: payload.sessionId,
      turnIndex: payload.turnIndex,
      scriptStep: payload.scriptStep,
      stepTitle: payload.stepTitle,
      sceneDescription: payload.sceneDescription,
      imageUrl: payload.imageUrl,
      question: payload.question,
      suggestedActions: payload.suggestedActions,
      narrativeSummary: payload.narrativeSummary,
      balanceCents: payload.balanceCents,
      goalAmountCents: payload.goalAmountCents,
      score: payload.score,
      treeHealth: payload.treeHealth,
      outcome: payload.outcome,
      grandpaHint: payload.grandpaHint ?? null,
      pennyLetter: payload.pennyLetter ?? null,
      phase:
        payload.outcome === "won" || payload.outcome === "lost"
          ? "ended"
          : "playing",
      lastError: null,
    }),

  reset: () => set({ ...initial }),
}))
