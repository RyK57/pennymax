export interface GameTags {
  [key: string]: string | number | boolean | null | undefined
}

export type StoryEventSource = "simulation" | "npc"

export interface GameEventItem {
  id: string
  narrative: string
  createdAt: string
  actionLabel?: string
  source?: StoryEventSource
  npcId?: string
}

export interface NpcMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export interface NpcThread {
  npcId: string
  messages: NpcMessage[]
}

export interface StateDelta {
  balanceCents?: number
  goalAmountCents?: number
  treeHealth?: number
}

/** Optional graph hints from the consequence engine (merged into React Flow). */
export interface FlowNodePayload {
  id: string
  label: string
  kind?: string
  hint?: string
}

export interface FlowEdgePayload {
  from: string
  to: string
}

export interface FlowUpdatePayload {
  nodes?: FlowNodePayload[]
  edges?: FlowEdgePayload[]
}

export interface SimulateTurnResponse {
  narrative: string
  stateDelta: StateDelta
  newTags: Partial<GameTags>
  flowUpdate?: FlowUpdatePayload
}

export interface NpcChatResponse {
  message: string
}
