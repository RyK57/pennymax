"use client"

import { Button } from "@/components/ui/button"
import { getActiveStoryBeat, STORY_BEATS } from "@/lib/story-beats"
import { useGameStore } from "@/lib/stores/use-game-store"
import { cn } from "@/lib/utils"

interface CurrentMissionProps {
  disabled?: boolean
  onChooseAction: (label: string) => void
  tone?: "default" | "pax"
}

export function CurrentMission({
  disabled,
  onChooseAction,
  tone = "default",
}: CurrentMissionProps) {
  const guidanceBeatIndex = useGameStore((s) => s.guidanceBeatIndex)
  const beat = getActiveStoryBeat(guidanceBeatIndex)
  const isPax = tone === "pax"
  const total = STORY_BEATS.length
  const step = Math.min(guidanceBeatIndex + 1, total)

  if (!beat) return null

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border px-3 py-3",
        isPax
          ? "border-background/22 bg-background/10 ring-1 ring-background/10"
          : "border-border bg-muted/30 ring-1 ring-foreground/5"
      )}
    >
      <div className="space-y-1">
        <p
          className={cn(
            "text-[0.65rem] font-semibold uppercase tracking-wide",
            isPax ? "text-background/55" : "text-muted-foreground"
          )}
        >
          Current mission
        </p>
        <h3
          className={cn(
            "text-sm font-semibold leading-snug",
            isPax ? "text-background" : "text-foreground"
          )}
        >
          {beat.title}
        </h3>
        <p
          className={cn(
            "text-xs leading-relaxed",
            isPax ? "text-background/78" : "text-muted-foreground"
          )}
        >
          {beat.blurb}
        </p>
        <p
          className={cn(
            "text-[0.7rem] tabular-nums",
            isPax ? "text-background/50" : "text-muted-foreground"
          )}
        >
          Step {step} of {total}
        </p>
      </div>
      <div>
        <p
          className={cn(
            "mb-2 text-xs font-medium",
            isPax ? "text-background/65" : "text-muted-foreground"
          )}
        >
          Try one of these
        </p>
        <div className="flex flex-col gap-2">
          {beat.suggestedActions.map((label) => (
            <Button
              key={label}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-auto min-h-9 w-full justify-start whitespace-normal rounded-lg px-3 py-2 text-left text-xs leading-snug",
                isPax
                  ? "border-background/25 bg-background/8 text-background hover:bg-background/18"
                  : "border-border"
              )}
              disabled={disabled}
              onClick={() => onChooseAction(label)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
