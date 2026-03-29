import Image from "next/image"

export function LanderDiagrams() {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <figure className="space-y-3">
        <figcaption className="font-primary text-lg font-semibold tracking-tight">
          How choices become the next scene
        </figcaption>
        <p className="text-sm leading-relaxed text-muted-foreground">
          From a tap in the browser to the story engine, scene art, and saved progress—so every
          turn stays in sync without exposing extra complexity to kids.
        </p>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
          <img
            src="/planning/backend-architecture.svg"
            alt="Penny's World backend architecture diagram"
            className="h-auto w-full bg-[#1a1d24]"
            loading="lazy"
          />
        </div>
      </figure>
      <figure className="space-y-3">
        <figcaption className="font-primary text-lg font-semibold tracking-tight">
          What you interact with
        </figcaption>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The pages and panels learners actually see—wired so guided play and the open map both feel
          fast, familiar, and easy to follow.
        </p>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/planning/nextjs-structure.svg"
            alt="Next.js structure diagram for Penny's World"
            className="h-auto w-full bg-[#1a1d24]"
            loading="lazy"
          />
        </div>
      </figure>
    </div>
  )
}
