"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ACTION_PRESET_GROUPS } from "@/lib/action-presets"
import { cn } from "@/lib/utils"

interface ActionChoiceButtonsProps {
  disabled?: boolean
  onChoose: (label: string) => void
  tone?: "default" | "pax"
}

export function ActionChoiceButtons({
  disabled,
  onChoose,
  tone = "default",
}: ActionChoiceButtonsProps) {
  const defaultId = ACTION_PRESET_GROUPS[0]?.id ?? "save"
  const isPax = tone === "pax"
  const [paxCategoryId, setPaxCategoryId] = useState(defaultId)

  const activePaxGroup =
    ACTION_PRESET_GROUPS.find((g) => g.id === paxCategoryId) ??
    ACTION_PRESET_GROUPS[0]

  if (isPax) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-background/55">
            Category
          </p>
          <div className="flex max-h-[9.5rem] flex-col gap-1.5 overflow-y-auto pr-0.5">
            {ACTION_PRESET_GROUPS.map((g) => {
              const selected = g.id === paxCategoryId
              return (
                <button
                  key={g.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setPaxCategoryId(g.id)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left text-sm font-medium leading-snug transition-colors",
                    selected
                      ? "border-background/45 bg-background/18 text-background shadow-sm ring-1 ring-background/25"
                      : "border-background/12 bg-background/5 text-background/85 hover:border-background/25 hover:bg-background/12"
                  )}
                >
                  {g.label}
                </button>
              )
            })}
          </div>
        </div>
        {activePaxGroup ? (
          <div className="space-y-2">
            <p className="text-xs leading-relaxed text-background/70">
              {activePaxGroup.description}
            </p>
            <ScrollArea className="h-[min(13rem,32vh)] rounded-xl border border-background/20 bg-background/8">
              <div className="flex flex-col gap-2 p-2.5">
                {activePaxGroup.actions.map((label) => (
                  <Button
                    key={label}
                    type="button"
                    variant="secondary"
                    className="h-auto min-h-10 w-full justify-start whitespace-normal rounded-xl border border-background/18 bg-background/12 px-3 py-2.5 text-left text-xs leading-snug text-background hover:bg-background/22"
                    disabled={disabled}
                    onClick={() => onChoose(label)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <Tabs defaultValue={defaultId} className="w-full gap-3">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-lg bg-muted/80 p-1.5">
        {ACTION_PRESET_GROUPS.map((g) => (
          <TabsTrigger
            key={g.id}
            value={g.id}
            className="flex-none px-3 py-2 text-xs data-[state=active]:bg-background sm:text-sm"
          >
            {g.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {ACTION_PRESET_GROUPS.map((g) => (
        <TabsContent
          key={g.id}
          value={g.id}
          className="mt-0 space-y-2 data-[state=inactive]:hidden"
        >
          <p className="text-xs text-muted-foreground">{g.description}</p>
          <ScrollArea className="h-[min(14rem,40vh)] rounded-lg border border-border">
            <div className="flex flex-col gap-2 p-2 sm:flex-row sm:flex-wrap">
              {g.actions.map((label) => (
                <Button
                  key={label}
                  type="button"
                  variant="secondary"
                  className="h-auto min-h-8 w-full justify-center whitespace-normal rounded-lg px-3 py-2 text-left text-xs leading-snug sm:w-[calc(50%-0.25rem)] lg:w-[calc(33.333%-0.35rem)]"
                  disabled={disabled}
                  onClick={() => onChoose(label)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  )
}
