"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { paxFloatingPanelClass } from "@/lib/pax-panel"
import { cn } from "@/lib/utils"
import { useGameStore } from "@/lib/stores/use-game-store"

import { ActionPanel } from "../actions/action-panel"
import { BalanceHud } from "../hud/balance-hud"
import { GoalHud } from "../hud/goal-hud"
import { TreeHealthBadge } from "../hud/tree-health-badge"
import { EventFeed } from "../story/event-feed"
import { NpcChatDock } from "../npc/npc-chat-dock"

export function PaxTopPill() {
  const scenarioLabel = useGameStore((s) => s.scenarioLabel)
  const balanceCents = useGameStore((s) => s.balanceCents)
  const goalAmountCents = useGameStore((s) => s.goalAmountCents)
  const treeHealth = useGameStore((s) => s.treeHealth)

  return (
    <div
      className={cn(
        paxFloatingPanelClass(),
        "pointer-events-auto fixed left-1/2 top-3 z-20 max-w-[min(42rem,calc(100vw-1.25rem))] -translate-x-1/2 flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2.5 px-5 py-2.5 text-sm"
      )}
    >
      <span className="font-semibold tracking-tight text-background">
        Penny&apos;s World
      </span>
      <span className="hidden text-background/50 sm:inline" aria-hidden>
        ·
      </span>
      <span className="max-w-[14rem] truncate text-center text-xs font-medium leading-snug text-background/90 sm:max-w-[min(20rem,40vw)]">
        {scenarioLabel}
      </span>
      <span
        className="hidden h-5 w-px shrink-0 bg-background/25 sm:block"
        aria-hidden
      />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <TreeHealthBadge treeHealth={treeHealth} tone="pax" />
        <div className="hidden scale-90 sm:block sm:origin-center">
          <BalanceHud balanceCents={balanceCents} tone="pax" />
        </div>
        <div className="hidden w-28 scale-90 md:block md:origin-center">
          <GoalHud
            goalAmountCents={goalAmountCents}
            balanceCents={balanceCents}
            tone="pax"
          />
        </div>
      </div>
    </div>
  )
}

export function PaxLeftDock() {
  const open = useGameStore((s) => s.uiLeftPanelOpen)
  const setOpen = useGameStore((s) => s.setUiLeftPanelOpen)

  return (
    <div
      className={cn(
        paxFloatingPanelClass(),
        "pointer-events-auto fixed z-20 flex min-h-0 flex-col transition-all duration-200 ease-out",
        "md:left-3 md:top-[5.25rem] md:bottom-6 md:w-[min(19rem,calc(100vw-1.25rem))]",
        "max-md:left-2 max-md:right-2 max-md:top-28 max-md:max-h-[min(48dvh,480px)] max-md:w-auto",
        !open &&
          "pointer-events-none opacity-0 max-md:translate-y-8 md:-translate-x-[calc(100%+2rem)]"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-background/20 px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-background">
          Actions
        </h2>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="rounded-md text-background hover:bg-background/15"
          onClick={() => setOpen(false)}
          aria-label="Close actions panel"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-3">
        <ActionPanel tone="pax" />
      </div>
    </div>
  )
}

export function PaxRightDock() {
  const open = useGameStore((s) => s.uiRightPanelOpen)
  const setOpen = useGameStore((s) => s.setUiRightPanelOpen)

  return (
    <div
      className={cn(
        paxFloatingPanelClass(),
        "pointer-events-auto fixed z-20 flex min-h-0 flex-col transition-all duration-200 ease-out",
        "md:right-3 md:top-[5.25rem] md:bottom-6 md:w-[min(22rem,calc(100vw-1.25rem))]",
        "max-md:left-2 max-md:right-2 max-md:top-28 max-md:max-h-[min(52dvh,520px)] max-md:w-auto",
        !open &&
          "pointer-events-none opacity-0 max-md:translate-y-8 md:translate-x-[calc(100%+2rem)]"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-background/20 px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-background">
          Story &amp; people
        </h2>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="rounded-md text-background hover:bg-background/15"
          onClick={() => setOpen(false)}
          aria-label="Close story panel"
        >
          <X className="size-4" />
        </Button>
      </div>
      <Tabs
        defaultValue="story"
        className="flex min-h-0 flex-1 flex-col gap-0 px-3 pb-3 pt-3"
      >
        <TabsList
          className={cn(
            "grid h-10 w-full shrink-0 grid-cols-2 gap-1 rounded-xl bg-background/14 p-1",
            /* Base TabsTrigger uses text-foreground/60 — unreadable on dark Pax glass */
            "[&_[data-slot=tabs-trigger]]:!text-background/88 [&_[data-slot=tabs-trigger]:hover]:!text-background",
            "[&_[data-slot=tabs-trigger][data-state=active]]:!text-background [&_[data-slot=tabs-trigger][data-state=active]]:shadow-sm"
          )}
        >
          <TabsTrigger
            value="story"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-background/24 sm:text-sm"
          >
            Story log
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-background/24 sm:text-sm"
          >
            Chats
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="story"
          className="mt-3 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
        >
          <EventFeed tone="pax" />
        </TabsContent>
        <TabsContent
          value="chat"
          className="mt-3 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
        >
          <NpcChatDock tone="pax" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
