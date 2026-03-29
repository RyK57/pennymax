const phases = [
  {
    phase: "Now · hackathon",
    title: "Guided shell + dual provider stack",
    body: "Flask blueprints for /api/guided/start|step, in-memory SESSIONS, OpenAI JSON schema for narrative + mechanics, Gemini for scene art. Next.js client with Zustand hydration.",
  },
  {
    phase: "Next",
    title: "Persistence + classroom mode",
    body: "Postgres session store, educator dashboards, anonymized telemetry on choice patterns, and scripted curriculum packs aligned to grade bands.",
  },
  {
    phase: "Stretch",
    title: "Free-form world mesh",
    body: "Wire the same prompt builders into simulate_turn and npc_chat routes so the map experience shares compaction, ledger, and tree health semantics with guided mode.",
  },
] as const

export function LanderRoadmap() {
  return (
    <ol className="relative mx-auto max-w-3xl space-y-10 border-l border-border pl-8">
      {phases.map((p, i) => (
        <li key={p.phase} className="relative">
          <span className="absolute -left-[39px] top-1 flex h-[11px] w-[11px] rounded-full border-2 border-primary bg-background" />
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {p.phase}
          </p>
          <h3 className="font-primary mt-1 text-xl font-semibold tracking-tight text-foreground">
            {p.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          {i < phases.length - 1 ? (
            <div className="mt-8 border-t border-dashed border-border/80" />
          ) : null}
        </li>
      ))}
    </ol>
  )
}
