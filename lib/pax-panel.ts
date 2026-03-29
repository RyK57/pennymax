import { cn } from "@/lib/utils"

/** Shared classes for Pax-style floating panels (dark glass over the map). */
export function paxFloatingPanelClass() {
  return cn(
    "game-floating-panel flex max-h-[min(100dvh-5rem,calc(100dvh-5rem))] flex-col overflow-hidden shadow-2xl"
  )
}

export function paxOnDarkSurface() {
  return cn(
    "rounded-2xl border border-background/15 bg-background/10 text-background",
    "ring-1 ring-background/10"
  )
}

export function paxOnDarkMuted() {
  return "text-background/70"
}

export function paxOnDarkInputSlot() {
  return cn(
    "[&_textarea]:border-background/20 [&_textarea]:bg-background/10 [&_textarea]:text-background",
    "[&_textarea]:placeholder:text-background/40",
    "[&_input]:border-background/20 [&_input]:bg-background/10 [&_input]:text-background",
    "[&_input]:placeholder:text-background/40"
  )
}
