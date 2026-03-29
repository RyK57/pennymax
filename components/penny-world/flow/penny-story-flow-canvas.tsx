"use client"

import { useCallback, useMemo } from "react"
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"

import { Maximize2, MessageCircle, PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/stores/use-game-store"

import { PennyFlowNode } from "./penny-flow-node"

const nodeTypes = { pennyTurn: PennyFlowNode }

function FlowBottomTools() {
  const { fitView } = useReactFlow()
  const toggleLeft = useGameStore((s) => s.toggleUiLeftPanel)
  const toggleRight = useGameStore((s) => s.toggleUiRightPanel)
  const isSimulating = useGameStore((s) => s.isSimulating)

  return (
    <Panel
      position="bottom-left"
      className="mb-3 ml-3 flex flex-wrap items-center gap-2"
    >
      <div className="game-floating-panel flex items-center gap-1 rounded-xl p-1.5">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="rounded-lg text-background hover:bg-background/15 hover:text-background"
          onClick={() => toggleLeft()}
          aria-label="Toggle actions panel"
        >
          <PanelLeft className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="rounded-lg text-background hover:bg-background/15 hover:text-background"
          onClick={() => toggleRight()}
          aria-label="Toggle story and chat panel"
        >
          <MessageCircle className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="rounded-lg text-background hover:bg-background/15 hover:text-background"
          onClick={() => fitView({ padding: 0.2, duration: 280 })}
          aria-label="Fit story map to view"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>
      {isSimulating ? (
        <span className="game-floating-panel rounded-lg px-2 py-1 text-xs text-background/90">
          Simulating…
        </span>
      ) : null}
    </Panel>
  )
}

export function PennyStoryFlowCanvas() {
  const nodes = useGameStore((s) => s.flowNodes)
  const edges = useGameStore((s) => s.flowEdges)
  const onFlowNodesChange = useGameStore((s) => s.onFlowNodesChange)
  const onFlowEdgesChange = useGameStore((s) => s.onFlowEdgesChange)

  const defaultEdgeOptions = useMemo(
    () => ({
      style: {
        stroke: "color-mix(in srgb, var(--foreground) 35%, transparent)",
        strokeWidth: 1.5,
      },
      type: "smoothstep" as const,
    }),
    []
  )

  const nodeColor = useCallback((n: Node) => {
    const kind = String(n.data?.kind ?? "")
    if (kind === "Start" || kind === "You are here") return "var(--primary)"
    if (kind === "Spend") return "var(--destructive)"
    if (kind === "Save") return "var(--chart-2)"
    if (kind === "Chat") return "var(--accent)"
    if (kind === "Reply") return "var(--chart-3)"
    if (kind === "Fork") return "var(--muted-foreground)"
    return "var(--muted-foreground)"
  }, [])

  const onNodesChange = useCallback(
    (changes: Parameters<typeof onFlowNodesChange>[0]) => {
      onFlowNodesChange(changes)
    },
    [onFlowNodesChange]
  )

  const onEdgesChange = useCallback(
    (changes: Parameters<typeof onFlowEdgesChange>[0]) => {
      onFlowEdgesChange(changes)
    },
    [onFlowEdgesChange]
  )

  return (
    <div className="h-full w-full [&_.react-flow\_\_attribution]:hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={1.75}
        proOptions={{ hideAttribution: true }}
        className="bg-muted/25"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.25}
          color="color-mix(in srgb, var(--foreground) 12%, transparent)"
        />
        <Controls
          className="game-floating-panel overflow-hidden rounded-xl border-0 shadow-lg [&_button]:border-background/20 [&_button]:bg-background/10 [&_button]:text-background [&_button:hover]:bg-background/20"
        />
        <MiniMap
          className="game-floating-panel !bottom-3 !right-3 overflow-hidden rounded-xl border-0 shadow-lg"
          nodeColor={nodeColor}
        />
        <FlowBottomTools />
      </ReactFlow>
    </div>
  )
}
