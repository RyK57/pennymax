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
          Ready to see{" "}
          <span className="font-tertiary-inline text-[#fff8e1]">agents on the story beat</span>?
        </h2>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
          Judges can step through onboarding, watch payloads move across the Flask boundary, and
          inspect how JSON + image channels stay in sync turn by turn.
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
            <Link href={FREE_PLAY_HREF}>Free-form map</Link>
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
        Tell us about your <span className="font-tertiary-inline text-primary">pilot cohort</span>{" "}
        and stack.
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        For hackathon Q&amp;A we&apos;re happy to walk through{" "}
        <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">api/agents</code>,{" "}
        provider keys, and how we keep kid-facing copy age-banded in the prompt layer.
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
