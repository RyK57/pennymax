"use client"

import { cn } from "@/lib/utils"

function formatUsd(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

interface GuidedTopBarProps {
  balanceCents: number
  goalAmountCents: number
  score: number
  treeHealth: number
  title?: string
  scriptStep?: number
  stepTitle?: string
}

export function GuidedTopBar({
  balanceCents,
  goalAmountCents,
  score,
  treeHealth,
  title = "Penny & the Money Tree",
  scriptStep,
  stepTitle,
}: GuidedTopBarProps) {
  const pct = goalAmountCents
    ? Math.min(100, Math.round((balanceCents / goalAmountCents) * 100))
    : 0

  const stepLine =
    stepTitle ||
    (scriptStep != null ? `Step ${scriptStep} of 10` : null)

  return (
    <header
      className={cn(
        "font-primary pointer-events-none fixed left-1/2 top-3 z-40 max-w-[min(44rem,calc(100vw-1rem))] -translate-x-1/2",
        "flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-white/25 bg-black/45 px-3 py-2.5 text-sm text-white shadow-lg backdrop-blur-md sm:px-4"
      )}
    >
      <div className="pointer-events-auto flex min-w-0 flex-col items-center gap-0.5 sm:items-start">
        <span className="max-w-[14rem] truncate font-semibold tracking-tight sm:max-w-[18rem]">
          {title}
        </span>
        {stepLine ? (
          <span className="text-[0.7rem] font-medium text-white/75">{stepLine}</span>
        ) : null}
      </div>
      <span className="pointer-events-auto hidden text-white/40 sm:inline" aria-hidden>
        ·
      </span>
      <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/95">
        <span className="tabular-nums">Tree {treeHealth}/100</span>
      </div>
      <span
        className="pointer-events-auto hidden h-5 w-px shrink-0 bg-white/25 sm:block"
        aria-hidden
      />
      <div className="pointer-events-auto text-xs tabular-nums text-white/90">
        Balance {formatUsd(balanceCents)}
      </div>
      <div className="pointer-events-auto flex w-[6.5rem] flex-col gap-0.5 text-xs text-white/85">
        <div className="flex justify-between text-[0.65rem] uppercase tracking-wide text-white/55">
          <span>Goal</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-amber-400 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[0.65rem] text-white/70">
          {formatUsd(goalAmountCents)}
        </span>
      </div>
      <div className="pointer-events-auto rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium tabular-nums text-white">
        Score {score}
      </div>
    </header>
  )
}
