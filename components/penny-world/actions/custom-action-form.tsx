"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CustomActionFormProps {
  disabled?: boolean
  onSubmitAction: (text: string) => void
  tone?: "default" | "pax"
}

export function CustomActionForm({
  disabled,
  onSubmitAction,
  tone = "default",
}: CustomActionFormProps) {
  const [value, setValue] = useState("")
  const isPax = tone === "pax"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmitAction(trimmed)
    setValue("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <div className="grid w-full gap-1.5 sm:flex-1">
        <label htmlFor="penny-action" className="sr-only">
          Describe Penny&apos;s action
        </label>
        <Input
          id="penny-action"
          placeholder="Enter your action…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          className={cn(
            "rounded-lg",
            isPax
              ? "border-background/20 bg-background/10 text-background placeholder:text-background/40"
              : "border-border bg-background"
          )}
        />
      </div>
      <Button
        type="submit"
        className={cn("rounded-lg", isPax && "shrink-0")}
        disabled={disabled || !value.trim()}
      >
        Simulate turn
      </Button>
    </form>
  )
}
