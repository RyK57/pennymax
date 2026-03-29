import { LanderNav } from "./lander-nav"
import { LanderHero } from "./lander-hero"
import { LanderInteractiveMock } from "./lander-interactive-mock"
import { LanderPipeline } from "./lander-pipeline"
import { LanderDiagrams } from "./lander-diagrams"
import { LanderRoadmap } from "./lander-roadmap"
import { LanderFeatureMesh } from "./lander-feature-mesh"
import { LanderCtaBand, LanderContact } from "./lander-cta-contact"
import { LanderFooter } from "./lander-footer"
import { SECTION_IDS } from "./lander-constants"

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
      {children}
    </p>
  )
}

export function LanderPage() {
  return (
    <div className="lander-grid-bg min-h-dvh">
      <LanderNav />
      <main>
        <LanderHero />

        <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-border to-transparent" />

        <section
          id={SECTION_IDS.demo}
          className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6"
        >
          <SectionLabel>Try it on the page</SectionLabel>
          <h2 className="font-primary text-center text-3xl font-bold tracking-tight sm:text-4xl">
            A guided moment with Penny
            <span className="mt-2 block font-tertiary text-2xl text-primary sm:text-3xl">
              Tap a choice—watch balance and tree shift
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            This preview shows how each decision nudges savings, spending, and the Money Tree in
            one place—no signup required to get the feel.
          </p>
          <div className="mt-14">
            <LanderInteractiveMock />
          </div>
        </section>

        <section
          id={SECTION_IDS.pipeline}
          className="border-y border-border/80 bg-muted/20 py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionLabel>From first tap to next scene</SectionLabel>
            <h2 className="font-primary text-center text-3xl font-bold tracking-tight sm:text-4xl">
              One flow from{" "}
              <span className="font-tertiary-inline text-primary">who is playing</span> to{" "}
              <span className="font-tertiary-inline text-primary">what they see next</span>
            </h2>
            <div className="mt-12">
              <LanderPipeline />
            </div>
          </div>
        </section>

        <section
          id={SECTION_IDS.architecture}
          className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6"
        >
          <SectionLabel>How the pieces connect</SectionLabel>
          <h2 className="font-primary text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Simple diagrams, serious care for kid data
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
            Sketches of how play moves from the browser to the story engine and back—handy for
            parents, schools, and anyone reviewing safety and flow.
          </p>
          <div className="mt-14">
            <LanderDiagrams />
          </div>
        </section>

        <section id={SECTION_IDS.roadmap} className="bg-muted/15 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionLabel>Where we&apos;re headed</SectionLabel>
            <h2 className="font-primary mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              What ships now—and what comes next
            </h2>
            <LanderRoadmap />
          </div>
        </section>

        <section
          id={SECTION_IDS.mesh}
          className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6"
        >
          <SectionLabel>What makes each turn feel alive</SectionLabel>
          <h2 className="font-primary text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Story, art, and state—working together
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
            Tap a bubble to see what that layer does for your player—plain language, works on a
            phone.
          </p>
          <div className="mt-14">
            <LanderFeatureMesh />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <LanderCtaBand />
        </section>

        <section
          id={SECTION_IDS.contact}
          className="scroll-mt-28 px-4 py-20 sm:px-6"
        >
          <LanderContact />
        </section>
      </main>
      <LanderFooter />
    </div>
  )
}
