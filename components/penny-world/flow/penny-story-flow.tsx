"use client"

import { useCallback, useMemo } from "react"
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useGameStore } from "@/lib/stores/use-game-store"

import { PennyFlowNode } from "./penny-flow-node"

const nodeTypes = { pennyTurn: PennyFlowNode }

export function PennyStoryFlowPanel() {
  const nodes = useGameStore((s) => s.flowNodes)
  const edges = useGameStore((s) => s.flowEdges)
  const onFlowNodesChange = useGameStore((s) => s.onFlowNodesChange)
  const onFlowEdgesChange = useGameStore((s) => s.onFlowEdgesChange)
  const isSimulating = useGameStore((s) => s.isSimulating)

  const defaultEdgeOptions = useMemo(
    () => ({
      style: { stroke: "var(--border)", strokeWidth: 1.5 },
      type: "smoothstep" as const,
    }),
    []
  )

  const nodeColor = useCallback((n: Node) => {
    const kind = String(n.data?.kind ?? "")
    if (kind === "Start" || kind === "You are here") return "var(--primary)"
    if (kind === "Spend") return "var(--destructive)"
    if (kind === "Save") return "var(--chart-2)"
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
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle>Story paths</CardTitle>
        <CardDescription>
          Each turn adds a node. When the AI returns branches, you&apos;ll see
          alternate routes and consequences sketched here—drag nodes to tidy up.
        </CardDescription>
        {isSimulating ? (
          <p className="text-xs text-muted-foreground">Updating graph…</p>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[min(22rem,55vh)] w-full [&_.react-flow\_\_attribution]:hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.35}
            maxZoom={1.75}
            proOptions={{ hideAttribution: true }}
            className="bg-muted/30"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="var(--border)"
            />
            <Controls className="rounded-lg border border-border bg-card shadow-sm" />
            <MiniMap
              className="rounded-lg border border-border bg-card"
              nodeColor={nodeColor}
            />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  )
}
