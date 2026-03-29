"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Coins, Sparkles, TreeDeciduous } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { DEMO_HREF } from "./lander-constants"

const MOCK_CHOICES = [
  "Put $2 in the savings jar",
  "Buy a small treat at the market",
  "Water the Money Tree first",
] as const

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

export function LanderInteractiveMock() {
  const [choiceIdx, setChoiceIdx] = useState(0)
  const [tree, setTree] = useState(72)
  const [balance, setBalance] = useState(1240)

  const blurb = useMemo(() => {
    switch (choiceIdx) {
      case 0:
        return "Saving bumps the jar and steadies the tree—kids feel the tradeoff without a lecture."
      case 1:
        return "A small treat costs cash and stresses the tree—quick feedback on impulse vs. plan."
      default:
        return "Watering first protects long-term health—same lesson, shown through play, not a slide deck."
    }
  }, [choiceIdx])

  function applyChoice(i: number) {
    setChoiceIdx(i)
    if (i === 0) {
      setBalance((b) => b + 200)
      setTree((t) => Math.min(100, t + 6))
    } else if (i === 1) {
      setBalance((b) => Math.max(0, b - 150))
      setTree((t) => Math.max(8, t - 4))
    } else {
      setTree((t) => Math.min(100, t + 10))
      setBalance((b) => Math.max(0, b - 40))
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="game-floating-panel relative overflow-hidden rounded-3xl p-1 text-white shadow-2xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.35rem] bg-zinc-900">
          <Image
            src="/guided.png"
            alt="Guided play mock"
            fill
            className="object-cover opacity-90"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium backdrop-blur-md">
              Sample scene
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 font-medium text-emerald-100 ring-1 ring-emerald-400/40">
              <TreeDeciduous className="h-3.5 w-3.5" />
              tree {tree}%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 space-y-3 p-4">
            <p className="text-sm font-medium leading-snug text-white/95">
              Penny pauses at the market stall. What should she do next?
            </p>
            <div className="flex flex-col gap-2">
              {MOCK_CHOICES.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => applyChoice(i)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                    choiceIdx === i
                      ? "border-amber-300/80 bg-amber-400/20 text-white"
                      : "border-white/20 bg-black/40 text-white/90 hover:border-white/40"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-white/75">
          {blurb}
        </p>
      </div>

      <aside className="space-y-4 rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-primary text-lg font-semibold tracking-tight">
            At a glance
          </h3>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <Coins className="h-4 w-4" />
              Balance
            </dt>
            <dd className="font-mono font-medium text-foreground">
              {formatCents(balance)}
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
            <dt className="text-muted-foreground">Money Tree</dt>
            <dd className="font-mono font-medium text-foreground">{tree}</dd>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
            <dt className="text-muted-foreground">Story progress</dt>
            <dd className="font-mono font-medium text-foreground">
              {4 + choiceIdx} / 10
            </dd>
          </div>
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">
          In the live app, these numbers update every turn so families and teachers can see cause
          and effect without digging through menus.
        </p>
        <Button className="w-full rounded-full" asChild>
          <Link href={DEMO_HREF}>Try the full experience</Link>
        </Button>
      </aside>
    </div>
  )
}
