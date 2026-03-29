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
        <span className="font-semibold text-primary">Green</span> is your learner—profile, start,
        and each choice.{" "}
        <span className="font-semibold text-accent">Gold</span> is where we weave the next story
        beat and picture.{" "}
        <span className="font-semibold text-destructive">Red</span> is how wins, losses, and
        wrap-ups close the loop.
      </p>
      <div className="flex min-w-[min(100%,920px)] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <PipelineNode
            title="Learner profile"
            subtitle="Age, goal, tone"
            className="border-primary/30"
          />
          <Connector variant="user" />
          <PipelineNode
            title="Start session"
            subtitle="New story, saved state"
            className="border-primary/30"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <PipelineNode
            title="Next story beat"
            subtitle="Script, choices, numbers"
            className="border-accent/40 bg-accent/5"
          />
          <Connector variant="internal" />
          <PipelineNode
            title="Scene illustration"
            subtitle="Art matched to the moment"
            className="border-accent/40 bg-accent/5"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <PipelineNode
            title="Player choice"
            subtitle="Tap → next scene"
            className="border-primary/30"
          />
          <Connector variant="decision" />
          <PipelineNode
            title="Win, learn, or retry"
            subtitle="Tree empty or story done"
            className="border-destructive/35 bg-destructive/5"
          />
        </div>
      </div>
    </div>
  )
}
