import type { Edge, Node } from "@xyflow/react"

import type { FlowUpdatePayload } from "@/lib/types/game"

export const STORY_FLOW_ROOT_ID = "root"

export function createInitialFlowNodes(scenarioLabel: string): Node[] {
  return [
    {
      id: STORY_FLOW_ROOT_ID,
      type: "pennyTurn",
      position: { x: 80, y: 0 },
      data: {
        title: "Start",
        subtitle: scenarioLabel,
        kind: "You are here",
      },
    },
  ]
}

export function appendTurnToStoryFlow(input: {
  prevNodes: Node[]
  prevEdges: Edge[]
  tailId: string
  depth: number
  eventId: string
  actionLabel: string | undefined
  narrative: string
  flowUpdate?: FlowUpdatePayload
}): { nodes: Node[]; edges: Edge[]; tailId: string } {
  const {
    prevNodes,
    prevEdges,
    tailId,
    depth,
    eventId,
    actionLabel,
    narrative,
    flowUpdate,
  } = input

  const nodes = [...prevNodes]
  const edges = [...prevEdges]
  const baseY = 32 + depth * 100

  const aiNodes = flowUpdate?.nodes?.filter(Boolean) ?? []
  if (aiNodes.length > 0) {
    let newTail = tailId
    aiNodes.forEach((n, i) => {
      if (nodes.some((nx) => nx.id === n.id)) return
      const node: Node = {
        id: n.id,
        type: "pennyTurn",
        position: { x: 48 + (i % 3) * 200, y: baseY + Math.floor(i / 3) * 88 },
        data: {
          title: n.label,
          subtitle: n.hint ?? narrative,
          kind: n.kind ?? "Choice",
        },
      }
      nodes.push(node)
      newTail = n.id
    })

    const first = aiNodes[0]
    if (
      first &&
      !edges.some((e) => e.source === tailId && e.target === first.id)
    ) {
      edges.push({
        id: `e-${tailId}-${first.id}-${depth}-tail`,
        source: tailId,
        target: first.id,
      })
    }

    for (const e of flowUpdate?.edges ?? []) {
      if (edges.some((ex) => ex.source === e.from && ex.target === e.to)) continue
      edges.push({
        id: `e-${e.from}-${e.to}-${depth}`,
        source: e.from,
        target: e.to,
      })
    }

    for (let i = 0; i < aiNodes.length - 1; i++) {
      const a = aiNodes[i]
      const b = aiNodes[i + 1]
      if (!edges.some((ex) => ex.source === a.id && ex.target === b.id)) {
        edges.push({
          id: `e-${a.id}-${b.id}-${depth}-seq`,
          source: a.id,
          target: b.id,
        })
      }
    }

    return { nodes, edges, tailId: newTail }
  }

  const node: Node = {
    id: eventId,
    type: "pennyTurn",
    position: { x: 72 + (depth % 2) * 72, y: baseY },
    data: {
      title: actionLabel ?? "Story beat",
      subtitle: narrative,
      kind: "Turn",
    },
  }
  nodes.push(node)
  edges.push({
    id: `e-${tailId}-${eventId}-${depth}`,
    source: tailId,
    target: eventId,
  })
  return { nodes, edges, tailId: eventId }
}

/** Links NPC chat turns into the same graph as simulation beats. */
export function appendNpcExchangeToStoryFlow(input: {
  prevNodes: Node[]
  prevEdges: Edge[]
  tailId: string
  depth: number
  exchangeId: string
  npcDisplayName: string
  userLine: string
  npcLine: string
}): { nodes: Node[]; edges: Edge[]; tailId: string } {
  const {
    prevNodes,
    prevEdges,
    tailId,
    depth,
    exchangeId,
    npcDisplayName,
    userLine,
    npcLine,
  } = input

  const nodes = [...prevNodes]
  const edges = [...prevEdges]
  const baseY = 32 + depth * 100
  const sayId = `${exchangeId}-say`
  const replyId = `${exchangeId}-reply`

  const sayNode: Node = {
    id: sayId,
    type: "pennyTurn",
    position: { x: 56 + (depth % 2) * 48, y: baseY },
    data: {
      title: `Penny → ${npcDisplayName}`,
      subtitle: userLine,
      kind: "Chat",
    },
  }
  const replyNode: Node = {
    id: replyId,
    type: "pennyTurn",
    position: { x: 56 + (depth % 2) * 48, y: baseY + 100 },
    data: {
      title: npcDisplayName,
      subtitle: npcLine,
      kind: "Reply",
    },
  }

  nodes.push(sayNode, replyNode)
  edges.push(
    { id: `e-${tailId}-${sayId}`, source: tailId, target: sayId },
    { id: `e-${sayId}-${replyId}`, source: sayId, target: replyId }
  )

  return { nodes, edges, tailId: replyId }
}
