"use client"

import { motion, AnimatePresence } from "framer-motion"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { NpcMessage } from "@/lib/types/game"
import { cn } from "@/lib/utils"

interface NpcMessageListProps {
  messages: NpcMessage[]
  tone?: "default" | "pax"
}

export function NpcMessageList({
  messages,
  tone = "default",
}: NpcMessageListProps) {
  const isPax = tone === "pax"

  return (
    <ScrollArea
      className={cn(
        "h-[min(14rem,36vh)] rounded-lg border",
        isPax
          ? "border-background/15 bg-background/5"
          : "border-border bg-background/60"
      )}
    >
      <ul className="space-y-2 p-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.li
              key={m.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                m.role === "user"
                  ? isPax
                    ? "ml-5 border-background/20 bg-background/10 text-background/95"
                    : "ml-6 border-border bg-muted/60 text-foreground"
                  : isPax
                    ? "mr-5 border-background/20 bg-background/15 text-background shadow-sm"
                    : "mr-6 border-border bg-card text-foreground shadow-sm"
              )}
            >
              {m.content}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </ScrollArea>
  )
}
