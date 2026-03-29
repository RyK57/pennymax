import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface PipelineNodeProps {
  title: string
  subtitle: string
  className?: string
}

function PipelineNode({ title, subtitle, className }: PipelineNodeProps) {
  return (
    <div
      className={cn(
        "min-w-[140px] max-w-[180px] rounded-xl border bg-card px-3 py-3 text-center shadow-sm",
        className
      )}
    >
      <p className="text-xs font-semibold text-card-foreground">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function Connector({
  variant,
}: {
  variant: "user" | "internal" | "decision"
}) {
  const cls =
    variant === "user"
      ? "text-primary"
      : variant === "internal"
        ? "text-accent"
        : "text-destructive"
  return (
    <div className="hidden shrink-0 items-center justify-center lg:flex">
      <ArrowRight className={cn("h-5 w-8", cls)} strokeWidth={2} aria-hidden />
    </div>
  )
}

export function LanderPipeline() {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-primary">Green</span> arrows trace the learner&apos;s
        path through onboarding and turns.{" "}
        <span className="font-semibold text-accent">Gold</span> marks synthesis inside the Flask
        engine (prompt assembly + image).{" "}
        <span className="font-semibold text-destructive">Red</span> highlights terminal outcomes
        (won / lost) and letter generation.
      </p>
      <div className="flex min-w-[min(100%,920px)] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <PipelineNode
            title="Profile JSON"
            subtitle="Age band, goal, tone"
            className="border-primary/30"
          />
          <Connector variant="user" />
          <PipelineNode
            title="POST /api/guided/start"
            subtitle="New session in SESSIONS dict"
            className="border-primary/30"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <PipelineNode
            title="OpenAI JSON"
            subtitle="message_json_object script + state"
            className="border-accent/40 bg-accent/5"
          />
          <Connector variant="internal" />
          <PipelineNode
            title="Gemini image"
            subtitle="generate_guided_scene_image_data_url"
            className="border-accent/40 bg-accent/5"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <PipelineNode
            title="POST /api/guided/step"
            subtitle="Kid line → next scene payload"
            className="border-primary/30"
          />
          <Connector variant="decision" />
          <PipelineNode
            title="Outcome gate"
            subtitle="treeHealth ≤ 0 → lost; script complete → won"
            className="border-destructive/35 bg-destructive/5"
          />
        </div>
      </div>
    </div>
  )
}
