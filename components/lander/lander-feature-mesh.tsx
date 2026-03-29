"use client"

import { useState } from "react"
import {
  Bot,
  ImageIcon,
  LayoutGrid,
  Server,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface MeshNode {
  id: string
  title: string
  tag: string
  icon: LucideIcon
  detail: string
}

const nodes: MeshNode[] = [
  {
    id: "narrative",
    title: "Structured LLM",
    tag: "OpenAI · JSON object",
    icon: Bot,
    detail:
      "guided_engine calls message_json_object with the DSG Money Tree script, age-aware language notes, and strict keys: scriptStep, balanceCents, treeHealth, suggestedActions[], imagePrompt.",
  },
  {
    id: "image",
    title: "Scene synthesis",
    tag: "Gemini · data URL",
    icon: ImageIcon,
    detail:
      "gemini_image_client prepends a cartoon style prefix, returns a data URL when configured, else deterministic placeholder—keeps the UI always visual.",
  },
  {
    id: "api",
    title: "Flask orchestration",
    tag: "SESSIONS dict",
    icon: Server,
    detail:
      "api/routes/guided.py exposes start/step; guided_engine owns validation, clamps, and outcome transitions before JSON responses hit the React client.",
  },
  {
    id: "client",
    title: "Zustand store",
    tag: "useGuidedStore",
    icon: LayoutGrid,
    detail:
      "Client merges payloads into scene state, drives GuidedPlay HUD (balance, tree, step title), and posts kid lines as plain text to the step endpoint.",
  },
  {
    id: "free",
    title: "Shared sim routes",
    tag: "simulate_turn · npc_chat",
    icon: Workflow,
    detail:
      "Same Python app hosts consolidate and free-roam endpoints—future work unifies ledger compaction across guided and map modes.",
  },
]

export function LanderFeatureMesh() {
  const [active, setActive] = useState<string>(nodes[0].id)
  const selected = nodes.find((n) => n.id === active) ?? nodes[0]

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <div className="absolute inset-8 rounded-full border border-dashed border-primary/25 bg-primary/[0.03]" />
        <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-center shadow-sm">
          <span className="font-primary px-2 text-xs font-bold leading-tight text-foreground">
            Penny&apos;s World core
          </span>
        </div>
        {nodes.map((n, i) => {
          const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
          const r = 42
          const x = 50 + r * Math.cos(angle)
          const y = 50 + r * Math.sin(angle)
          const Icon = n.icon
          const isOn = active === n.id
          return (
            <button
              key={n.id}
              type="button"
              style={{ left: `${x}%`, top: `${y}%` }}
              className={cn(
                "absolute z-20 flex w-[min(44vw,160px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl border bg-card px-2 py-2 text-center shadow-md transition-all",
                isOn
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border hover:border-primary/40"
              )}
              onClick={() => setActive(n.id)}
            >
              <Icon className={cn("h-4 w-4", isOn ? "text-primary" : "text-muted-foreground")} />
              <span className="text-[11px] font-semibold leading-tight text-foreground">
                {n.title}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                {n.tag}
              </span>
            </button>
          )
        })}
      </div>
      <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Selected node
        </p>
        <h3 className="font-primary mt-2 text-xl font-semibold">{selected.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.detail}</p>
      </div>
    </div>
  )
}
