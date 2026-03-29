import Image from "next/image"

export function LanderDiagrams() {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <figure className="space-y-3">
        <figcaption className="font-primary text-lg font-semibold tracking-tight">
          Backend architecture
        </figcaption>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Player actions, world state, prompt assembly, dual-model calls (OpenAI + optional Gemini),
          and compaction loops—mapped the same way we ship in{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">api/</code>.
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
          Next.js surface area
        </figcaption>
        <p className="text-sm leading-relaxed text-muted-foreground">
          How the App Router client talks to route handlers and the Python sidecar—mirrors the
          structure in <code className="rounded bg-muted px-1 font-mono text-xs">app/</code> and{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">components/guided/</code>.
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
