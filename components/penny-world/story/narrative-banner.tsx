"use client"

import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

interface NarrativeBannerProps {
  text: string | null
  tone?: "default" | "pax"
}

export function NarrativeBanner({ text, tone = "default" }: NarrativeBannerProps) {
  const isPax = tone === "pax"

  return (
    <div
      className={cn(
        "min-h-[3rem] rounded-xl border px-4 py-3 shadow-sm ring-1",
        isPax
          ? "border-background/15 bg-background/10 text-background ring-background/10"
          : "border-border bg-muted/40 text-foreground ring-foreground/5"
      )}
    >
      <AnimatePresence mode="wait">
        {text ? (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "text-sm leading-relaxed",
              isPax ? "text-background/95" : "text-foreground"
            )}
          >
            {text}
          </motion.p>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "text-sm",
              isPax ? "text-background/55" : "text-muted-foreground"
            )}
          >
            Your story will appear here after the first beat.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
