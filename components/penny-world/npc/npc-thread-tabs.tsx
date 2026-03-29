"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NPC_BY_ID } from "@/lib/npc-catalog"
import { cn } from "@/lib/utils"

interface NpcThreadTabsProps {
  npcIds: string[]
  activeNpcId: string
  onNpcChange: (id: string) => void
  children: (npcId: string) => React.ReactNode
  tone?: "default" | "pax"
}

export function NpcThreadTabs({
  npcIds,
  activeNpcId,
  onNpcChange,
  children,
  tone = "default",
}: NpcThreadTabsProps) {
  const isPax = tone === "pax"

  return (
    <Tabs
      value={activeNpcId}
      onValueChange={onNpcChange}
      className="flex min-h-0 flex-1 flex-col gap-2"
    >
      <TabsList
        variant="line"
        className={cn(
          "max-h-40 w-full flex-wrap justify-start gap-1 overflow-y-auto rounded-lg",
          isPax && "bg-background/12",
          isPax &&
            "[&_[data-slot=tabs-trigger]]:!text-background/88 [&_[data-slot=tabs-trigger]:hover]:!text-background",
          isPax &&
            "[&_[data-slot=tabs-trigger][data-state=active]]:!text-background [&_[data-slot=tabs-trigger][data-state=active]]:font-semibold"
        )}
      >
        {npcIds.map((id) => (
          <TabsTrigger
            key={id}
            value={id}
            className={cn(
              "rounded-md text-xs sm:text-sm",
              isPax
                ? "data-[state=active]:bg-background/18 data-[state=active]:after:!bg-background"
                : "data-[state=active]:bg-muted"
            )}
          >
            {NPC_BY_ID[id]?.displayName ?? id}
          </TabsTrigger>
        ))}
      </TabsList>
      {npcIds.map((id) => (
        <TabsContent
          key={id}
          value={id}
          className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
        >
          {children(id)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
