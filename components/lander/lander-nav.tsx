"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { DEMO_HREF, FREE_PLAY_HREF, SECTION_IDS } from "./lander-constants"

const links = [
  { href: `#${SECTION_IDS.demo}`, label: "Live demo" },
  { href: `#${SECTION_IDS.pipeline}`, label: "Pipeline" },
  { href: `#${SECTION_IDS.architecture}`, label: "Architecture" },
  { href: `#${SECTION_IDS.roadmap}`, label: "Roadmap" },
  { href: `#${SECTION_IDS.mesh}`, label: "Stack mesh" },
  { href: `#${SECTION_IDS.contact}`, label: "Contact" },
] as const

export function LanderNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5">
      <div className="pointer-events-auto w-full max-w-5xl">
        <p className="mb-2 text-center font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground sm:text-[11px]">
          /// alternate financial literacy sandbox &gt;&gt;&gt;
        </p>
        <nav
          className={cn(
            "flex items-center justify-between gap-3 rounded-full border border-border/80 bg-background/80 px-4 py-2 shadow-lg backdrop-blur-xl",
            "sm:px-5"
          )}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/full.png"
              alt="Penny's World"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-primary text-sm font-semibold tracking-tight text-foreground sm:text-base">
              Pennymax
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="rounded-full px-4" asChild>
              <Link href="https://github.com/RyK57/pennymax/tree/main">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="h-4 w-4" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
              </svg>
              Github
              </Link>
            </Button>
            <Button size="sm" className="rounded-full px-4" asChild>
              <Link href={DEMO_HREF}>Try demo</Link>
            </Button>
            <button
              type="button"
              className="inline-flex rounded-full p-2 text-foreground md:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open ? (
          <div className="mt-2 rounded-2xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <Link
                href={FREE_PLAY_HREF}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                Free form map
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
