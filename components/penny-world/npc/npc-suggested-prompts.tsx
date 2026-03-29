"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NpcSuggestedPromptsProps {
  prompts: string[]
  disabled?: boolean
  onPick: (text: string) => void
  tone?: "default" | "pax"
}

export function NpcSuggestedPrompts({
  prompts,
  disabled,
  onPick,
  tone = "default",
}: NpcSuggestedPromptsProps) {
  const isPax = tone === "pax"

  if (!prompts.length) return null

  return (
    <div className="space-y-2">
      <p
        className={cn(
          "text-xs font-medium",
          isPax ? "text-background/65" : "text-muted-foreground"
        )}
      >
        Tap a conversation starter
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <Button
            key={p}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-auto max-w-full whitespace-normal rounded-lg px-2.5 py-1.5 text-left text-xs leading-snug",
              isPax
                ? "border-background/20 bg-background/5 text-background hover:bg-background/15"
                : "border-border"
            )}
            disabled={disabled}
            onClick={() => onPick(p)}
          >
            {p}
          </Button>
        ))}
      </div>
    </div>
  )
}
