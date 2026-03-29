const phases = [
  {
    phase: "Today",
    title: "Full guided story + illustrated scenes",
    body: "Kids move through the Money Tree arc with choices that change balance and tree health scene by scene—plus an open map for curious explorers.",
  },
  {
    phase: "Next up",
    title: "Classrooms and progress you can trust",
    body: "Saved sessions, simple educator views, and insights into which choices resonate—without losing the playful, low-friction feel.",
  },
  {
    phase: "Later",
    title: "One world, every mode",
    body: "Tighter links between guided lessons and free play so habits from the story show up when kids wander the map on their own.",
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
