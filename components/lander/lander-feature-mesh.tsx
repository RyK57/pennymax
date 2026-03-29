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
    title: "Story engine",
    tag: "Age-smart narration",
    icon: Bot,
    detail:
      "Each beat knows your learner's band, goals, and tone—so choices, hints, and consequences read like a coach, not a textbook.",
  },
  {
    id: "image",
    title: "Scene art",
    tag: "Illustrated every turn",
    icon: ImageIcon,
    detail:
      "Every decision gets a fresh cartoon-style frame so kids see the market, the jar, and the Money Tree—not just numbers on a screen.",
  },
  {
    id: "api",
    title: "Session brain",
    tag: "Remembers the story",
    icon: Server,
    detail:
      "Your playthrough stays consistent: balance, tree health, and story step advance together so nothing “resets” mid-lesson by accident.",
  },
  {
    id: "client",
    title: "Play surface",
    tag: "HUD & choices",
    icon: LayoutGrid,
    detail:
      "The screen shows balance, tree vitality, and what to do next—kids tap a path; you see the lesson land in real time.",
  },
  {
    id: "free",
    title: "Guided + open play",
    tag: "Same world, two modes",
    icon: Workflow,
    detail:
      "Follow a scripted Money Tree arc or roam the map—both modes share the same money rules so skills transfer naturally.",
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
            Pennymax
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
          Tap another piece
        </p>
        <h3 className="font-primary mt-2 text-xl font-semibold">{selected.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.detail}</p>
      </div>
    </div>
  )
}
