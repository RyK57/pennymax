import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"

import { DEMO_HREF, SECTION_IDS } from "./lander-constants"

export function LanderHero() {
  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-32">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/bg.png"
          alt=""
          fill
          className="object-cover object-center opacity-10"
          priority
          sizes="100vw"
        />
        {/* Light scrim so type stays readable; image stays clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/15 to-background/55" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center [text-shadow:0_1px_2px_color-mix(in_srgb,var(--background)_85%,transparent),0_0_24px_color-mix(in_srgb,var(--background)_40%,transparent)]">
        <div className="mb-10 flex h-40 w-40 items-center justify-center rounded-3xl border-2 border-primary/25 bg-primary/10 shadow-lg">
          <Image src="/full.png" alt="" width={240} height={240} />
        </div>
        <h1 className="font-primary text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Simulate money choices
        </h1>
        <p className="font-tertiary mt-3 text-3xl text-primary sm:text-4xl md:text-5xl">
          scene by scene.
        </p>
        {/* <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Pennymax pairs a{" "}
          <span className="font-tertiary-inline text-foreground">guided narrative engine</span>{" "}
          (structured JSON from OpenAI) with{" "}
          <span className="font-tertiary-inline text-foreground">illustrated scenes</span>{" "}
          (Gemini image generation) and a Flask session orchestrator—so kids steer Penny
          through saving, spending, and the Money Tree health loop in real time.
        </p> */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href={DEMO_HREF}>Try demo</Link>
          </Button>
          <Button
            size="lg"
            variant="default"
            className="rounded-full"
            asChild
          >
            <a href={`#${SECTION_IDS.architecture}`} className="gap-1">
              How it works
              <ChevronDown className="h-4 w-4" />
            </a>
          </Button>
        </div>
        <p className="font-mono mt-16 text-[10px] uppercase tracking-[0.6em] text-muted-foreground/70">
          Guided stories · open-ended play
        </p>
      </div>
    </section>
  )
}
