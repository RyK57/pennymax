import Link from "next/link"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

import { DEMO_HREF, FREE_PLAY_HREF } from "./lander-constants"

export function LanderCtaBand() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/90 via-primary to-[#0f2918] px-6 py-16 text-center text-primary-foreground shadow-xl sm:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,248,225,0.12),transparent_50%)]" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="font-primary text-3xl font-bold tracking-tight sm:text-4xl">
          See every choice play out{" "}
          <span className="font-tertiary-inline text-[#fff8e1]">in a living scene</span>
        </h2>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
          Jump into a guided story or explore the open map—saving, spending, and caring for the
          Money Tree all stay connected, turn after turn.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full bg-[#fff8e1] text-primary hover:bg-white"
            asChild
          >
            <Link href={DEMO_HREF}>Try demo</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-[#fff8e1]/50 bg-transparent text-[#fff8e1] hover:bg-white/10"
            asChild
          >
            <Link href={FREE_PLAY_HREF}>Open map</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function LanderContact() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
        Contact
      </p>
      <h2 className="font-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Schools, parents, or partners—{" "}
        <span className="font-tertiary-inline text-primary">we&apos;d love to hear from you</span>
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Ask about classroom pilots, age bands, or bringing Pennymax to your learners. We read every
        message and reply from a real inbox—not a form bot.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button className="rounded-full" size="lg" asChild>
          <a href="mailto:rithvik_sabnekar@berkeley.edu" className="gap-2">
            <Mail className="h-4 w-4" />
            rithvik_sabnekar@berkeley.edu
          </a>
        </Button>
        <Button size="lg" variant="outline" className="rounded-full border-primary/30" asChild>
          <Link href={DEMO_HREF}>Try demo</Link>
        </Button>
      </div>
    </div>
  )
}
