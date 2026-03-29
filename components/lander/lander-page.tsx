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
          <SectionLabel>/// live surface mock &gt;&gt;&gt;</SectionLabel>
          <h2 className="font-primary text-center text-3xl font-bold tracking-tight sm:text-4xl">
           Example of the guided experience.
            <span className="mt-2 block font-secondary text-2xl text-primary sm:text-3xl">
              Where is the runnable HUD?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            Below is an example of the guided experience.
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
            <SectionLabel>/// guided pipeline &gt;&gt;&gt;</SectionLabel>
            <h2 className="font-primary text-center text-3xl font-bold tracking-tight sm:text-4xl">
              One flow from{" "}
              <span className="font-tertiary-inline text-primary">profile JSON</span> to{" "}
              <span className="font-tertiary-inline text-primary">scene payload</span>
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
          <SectionLabel>/// system architecture &gt;&gt;&gt;</SectionLabel>
          <h2 className="font-primary text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Pictorial backend + frontend contract
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
            Embedded diagrams from our planning repo—same boxes we use to explain SESSIONS,
            compaction, and dual-model generation to stakeholders.
          </p>
          <div className="mt-14">
            <LanderDiagrams />
          </div>
        </section>

        <section id={SECTION_IDS.roadmap} className="bg-muted/15 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionLabel>/// roadmap &gt;&gt;&gt;</SectionLabel>
            <h2 className="font-primary mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Shipping path after the hackathon
            </h2>
            <LanderRoadmap />
          </div>
        </section>

        <section
          id={SECTION_IDS.mesh}
          className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6"
        >
          <SectionLabel>/// under the hood &gt;&gt;&gt;</SectionLabel>
          <h2 className="font-primary text-center text-3xl font-bold tracking-tight sm:text-4xl">
            A mesh of services around every turn
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
            Tap a node—mirrors how we narrate the system in live demos (mobile-friendly).
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
