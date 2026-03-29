"use client"

import dynamic from "next/dynamic"

import { GameHydration } from "./game-hydration"
import {
  PaxLeftDock,
  PaxRightDock,
  PaxTopPill,
} from "./pax-floating-chrome"

const PennyStoryFlowCanvas = dynamic(
  () =>
    import("@/components/penny-world/flow/penny-story-flow-canvas").then(
      (m) => m.PennyStoryFlowCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-muted/30" aria-hidden />
    ),
  }
)

export function GamePageShell() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <GameHydration />
      <div className="absolute inset-0 z-0">
        <PennyStoryFlowCanvas />
      </div>
      <PaxTopPill />
      <PaxLeftDock />
      <PaxRightDock />
    </div>
  )
}
