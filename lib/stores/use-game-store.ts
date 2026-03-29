import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"

import {
  STORY_BEATS,
  countSimulationTurns,
  guidanceBeatIndexFromSimulationCount,
} from "@/lib/story-beats"
import { NPC_ORDER } from "@/lib/npc-catalog"
import {
  appendNpcExchangeToStoryFlow,
  appendTurnToStoryFlow,
  createInitialFlowNodes,
  STORY_FLOW_ROOT_ID,
} from "@/lib/story-flow"
import type {
  FlowUpdatePayload,
  GameEventItem,
  GameTags,
  NpcMessage,
  NpcThread,
  StateDelta,
} from "@/lib/types/game"

const SCENARIO_DEFAULT = "Saving for the tree house"

function createEmptyThreads(): Record<string, NpcThread> {
  return Object.fromEntries(
    NPC_ORDER.map((id) => [id, { npcId: id, messages: [] }])
  )
}

export interface GameStoreState {
  balanceCents: number
  goalAmountCents: number
  treeHealth: number
  tags: GameTags
  events: GameEventItem[]
  npcThreads: Record<string, NpcThread>
  scenarioLabel: string
  isSimulating: boolean
  isNpcSending: boolean
  lastError: string | null

  flowNodes: Node[]
  flowEdges: Edge[]
  flowTailNodeId: string

  /** Advances with simulation turns only; see lib/story-beats.ts */
  guidanceBeatIndex: number

  uiLeftPanelOpen: boolean
  uiRightPanelOpen: boolean
  setUiLeftPanelOpen: (v: boolean) => void
  setUiRightPanelOpen: (v: boolean) => void
  toggleUiLeftPanel: () => void
  toggleUiRightPanel: () => void

  setFromServerHydration: (partial: Partial<GameStoreState>) => void
  applySimulateTurnResult: (input: {
    narrative: string
    stateDelta: StateDelta
    newTags: Partial<GameTags>
    actionLabel?: string
    flowUpdate?: FlowUpdatePayload
  }) => void
  appendNpcMessage: (npcId: string, message: NpcMessage) => void
  recordNpcExchange: (input: {
    exchangeId: string
    npcId: string
    displayName: string
    userText: string
    assistantText: string
  }) => void
  setSimulating: (v: boolean) => void
  setNpcSending: (v: boolean) => void
  setError: (msg: string | null) => void
  onFlowNodesChange: (changes: NodeChange[]) => void
  onFlowEdgesChange: (changes: EdgeChange[]) => void
  reset: () => void
}

const initialState = {
  balanceCents: 1_250_00,
  goalAmountCents: 50_000_00,
  treeHealth: 72,
  tags: {
    streak_days: 3,
    impulsive_spender: false,
  } as GameTags,
  events: [] as GameEventItem[],
  npcThreads: createEmptyThreads(),
  scenarioLabel: SCENARIO_DEFAULT,
  isSimulating: false,
  isNpcSending: false,
  lastError: null,
  flowNodes: createInitialFlowNodes(SCENARIO_DEFAULT),
  flowEdges: [] as Edge[],
  flowTailNodeId: STORY_FLOW_ROOT_ID,
  guidanceBeatIndex: 0,
  uiLeftPanelOpen: true,
  uiRightPanelOpen: true,
}

export const useGameStore = create<GameStoreState>((set) => ({
  ...initialState,

  setFromServerHydration: (partial) =>
    set((s) => {
      const next = { ...s, ...partial }
      if (partial.events !== undefined) {
        const simCount = countSimulationTurns(next.events)
        return {
          ...next,
          guidanceBeatIndex: guidanceBeatIndexFromSimulationCount(
            simCount,
            STORY_BEATS.length
          ),
        }
      }
      return next
    }),

  applySimulateTurnResult: ({
    narrative,
    stateDelta,
    newTags,
    actionLabel,
    flowUpdate,
  }) =>
    set((s) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `evt-${Date.now()}`
      const event: GameEventItem = {
        id,
        narrative,
        createdAt: new Date().toISOString(),
        actionLabel,
        source: "simulation",
      }
      const depth = s.events.length
      const nextEvents = [event, ...s.events].slice(0, 50)
      const simCount = countSimulationTurns(nextEvents)
      const { nodes, edges, tailId } = appendTurnToStoryFlow({
        prevNodes: s.flowNodes,
        prevEdges: s.flowEdges,
        tailId: s.flowTailNodeId,
        depth,
        eventId: id,
        actionLabel,
        narrative,
        flowUpdate,
      })
      return {
        balanceCents: stateDelta.balanceCents ?? s.balanceCents,
        goalAmountCents: stateDelta.goalAmountCents ?? s.goalAmountCents,
        treeHealth: Math.min(
          100,
          Math.max(0, stateDelta.treeHealth ?? s.treeHealth)
        ),
        tags: { ...s.tags, ...newTags },
        events: nextEvents,
        flowNodes: nodes,
        flowEdges: edges,
        flowTailNodeId: tailId,
        guidanceBeatIndex: guidanceBeatIndexFromSimulationCount(
          simCount,
          STORY_BEATS.length
        ),
        lastError: null,
      }
    }),

  appendNpcMessage: (npcId, message) =>
    set((s) => {
      const thread = s.npcThreads[npcId] ?? { npcId, messages: [] }
      return {
        npcThreads: {
          ...s.npcThreads,
          [npcId]: {
            ...thread,
            messages: [...thread.messages, message].slice(-30),
          },
        },
        lastError: null,
      }
    }),

  recordNpcExchange: ({
    exchangeId,
    npcId,
    displayName,
    userText,
    assistantText,
  }) =>
    set((s) => {
      const narrative = `${displayName}: “${assistantText.slice(0, 220)}${assistantText.length > 220 ? "…" : ""}”`
      const actionLabel = `You said: “${userText.slice(0, 56)}${userText.length > 56 ? "…" : ""}”`
      const event: GameEventItem = {
        id: exchangeId,
        narrative,
        createdAt: new Date().toISOString(),
        actionLabel,
        source: "npc",
        npcId,
      }
      const depth = s.events.length
      const { nodes, edges, tailId } = appendNpcExchangeToStoryFlow({
        prevNodes: s.flowNodes,
        prevEdges: s.flowEdges,
        tailId: s.flowTailNodeId,
        depth,
        exchangeId,
        npcDisplayName: displayName,
        userLine: userText,
        npcLine: assistantText,
      })
      return {
        events: [event, ...s.events].slice(0, 50),
        flowNodes: nodes,
        flowEdges: edges,
        flowTailNodeId: tailId,
        lastError: null,
      }
    }),

  setUiLeftPanelOpen: (v) => set({ uiLeftPanelOpen: v }),
  setUiRightPanelOpen: (v) => set({ uiRightPanelOpen: v }),
  toggleUiLeftPanel: () => set((s) => ({ uiLeftPanelOpen: !s.uiLeftPanelOpen })),
  toggleUiRightPanel: () =>
    set((s) => ({ uiRightPanelOpen: !s.uiRightPanelOpen })),

  setSimulating: (v) => set({ isSimulating: v }),
  setNpcSending: (v) => set({ isNpcSending: v }),
  setError: (msg) => set({ lastError: msg }),

  onFlowNodesChange: (changes) =>
    set((s) => ({ flowNodes: applyNodeChanges(changes, s.flowNodes) })),

  onFlowEdgesChange: (changes) =>
    set((s) => ({ flowEdges: applyEdgeChanges(changes, s.flowEdges) })),

  reset: () =>
    set({
      ...initialState,
      npcThreads: createEmptyThreads(),
      flowNodes: createInitialFlowNodes(SCENARIO_DEFAULT),
      flowEdges: [],
      flowTailNodeId: STORY_FLOW_ROOT_ID,
      guidanceBeatIndex: 0,
      uiLeftPanelOpen: true,
      uiRightPanelOpen: true,
    }),
}))
