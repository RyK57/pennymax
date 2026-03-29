"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { paxOnDarkInputSlot } from "@/lib/pax-panel"
import { cn } from "@/lib/utils"

interface NpcComposerProps {
  disabled?: boolean
  onSend: (text: string) => void
  value: string
  onValueChange: (v: string) => void
  inputId: string
  tone?: "default" | "pax"
}

export function NpcComposer({
  disabled,
  onSend,
  value,
  onValueChange,
  inputId,
  tone = "default",
}: NpcComposerProps) {
  const isPax = tone === "pax"

  function submit() {
    const t = value.trim()
    if (!t || disabled) return
    onSend(t)
    onValueChange("")
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isPax && paxOnDarkInputSlot()
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        Message to NPC
      </label>
      <Textarea
        id={inputId}
        placeholder="Say something…"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        rows={2}
        className={cn(
          "resize-none rounded-lg",
          isPax
            ? "border-background/20 bg-background/10 text-background placeholder:text-background/40"
            : "border-border bg-background"
        )}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />
      <Button
        type="button"
        className="self-end rounded-lg"
        disabled={disabled || !value.trim()}
        onClick={submit}
      >
        Send
      </Button>
    </div>
  )
}
