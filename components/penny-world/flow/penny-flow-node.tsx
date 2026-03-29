"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"

export interface PennyFlowNodeData {
  title: string
  subtitle?: string
  kind?: string
}

export function PennyFlowNode({ data }: NodeProps) {
  const d = data as unknown as Partial<PennyFlowNodeData>
  const title = d.title ?? "Beat"
  const subtitle = d.subtitle
  const kind = d.kind
  return (
    <div className="min-w-[12rem] max-w-[min(28rem,42vw)] rounded-xl border border-border bg-card px-3 py-2.5 text-left shadow-sm ring-1 ring-foreground/5">
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2 !border-border !bg-muted-foreground/40"
      />
      {kind ? (
        <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          {kind}
        </p>
      ) : null}
      <p className="break-words text-sm font-semibold leading-snug text-foreground">
        {title}
      </p>
      {subtitle ? (
        <p className="mt-1.5 break-words text-xs leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !border-border !bg-primary/60"
      />
    </div>
  )
}
