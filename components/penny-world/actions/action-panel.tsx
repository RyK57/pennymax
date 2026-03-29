"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { persistTurnSnapshot } from "@/db/game/events"
import { postJson } from "@/lib/api/flask-client"
import { paxOnDarkInputSlot } from "@/lib/pax-panel"
import { STORY_FLOW_ROOT_ID } from "@/lib/story-flow"
import { useGameStore } from "@/lib/stores/use-game-store"
import type { SimulateTurnResponse } from "@/lib/types/game"
import { cn } from "@/lib/utils"

import { ActionChoiceButtons } from "./action-choice-buttons"
import { CurrentMission } from "./current-mission"
import { CustomActionForm } from "./custom-action-form"

interface ActionPanelProps {
  tone?: "default" | "pax"
}

export function ActionPanel({ tone = "default" }: ActionPanelProps) {
  const balanceCents = useGameStore((s) => s.balanceCents)
  const goalAmountCents = useGameStore((s) => s.goalAmountCents)
  const treeHealth = useGameStore((s) => s.treeHealth)
  const tags = useGameStore((s) => s.tags)
  const scenarioLabel = useGameStore((s) => s.scenarioLabel)
  const events = useGameStore((s) => s.events)
  const flowTailNodeId = useGameStore((s) => s.flowTailNodeId)
  const flowNodes = useGameStore((s) => s.flowNodes)
  const isSimulating = useGameStore((s) => s.isSimulating)
  const applySimulateTurnResult = useGameStore((s) => s.applySimulateTurnResult)
  const setSimulating = useGameStore((s) => s.setSimulating)
  const setError = useGameStore((s) => s.setError)

  const flowRecentLabels = flowNodes
    .filter((n) => n.id !== STORY_FLOW_ROOT_ID)
    .slice(-10)
    .map((n) => String((n.data as { title?: string })?.title ?? ""))
    .filter(Boolean)

  const nextFlowIndex = events.length

  async function runTurn(actionDescription: string) {
    setError(null)
    setSimulating(true)
    try {
      const recentNarratives = events.slice(0, 12).map((e) => e.narrative)
      const payload = {
        actionDescription,
        gameState: {
          balanceCents,
          goalAmountCents,
          treeHealth,
          tags,
          scenarioLabel,
          recentNarratives,
          eventSummaries: [] as string[],
          flowTailNodeId,
          flowRecentLabels,
          nextFlowIndex,
        },
      }
      const data = await postJson<SimulateTurnResponse>(
        "/api/simulate-turn",
        payload
      )
      applySimulateTurnResult({
        narrative: data.narrative,
        stateDelta: data.stateDelta ?? {},
        newTags: data.newTags ?? {},
        actionLabel: actionDescription,
        flowUpdate: data.flowUpdate,
      })
      await persistTurnSnapshot({
        actionDescription,
        narrative: data.narrative,
        stateAfter: {
          balanceCents:
            data.stateDelta?.balanceCents ?? balanceCents,
          goalAmountCents:
            data.stateDelta?.goalAmountCents ?? goalAmountCents,
          treeHealth:
            data.stateDelta?.treeHealth ?? treeHealth,
          tags: { ...tags, ...(data.newTags ?? {}) },
        },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSimulating(false)
    }
  }

  const isPax = tone === "pax"

  return (
    <Card
      className={cn(
        "shadow-sm",
        isPax && "border-0 bg-transparent text-background shadow-none"
      )}
    >
      <CardHeader className={cn(isPax && "px-0 pt-0")}>
        <CardTitle className={cn(isPax && "text-background")}>
          This turn
        </CardTitle>
        <CardDescription
          className={cn(isPax ? "text-sm leading-relaxed text-background/78" : undefined)}
        >
          Submit actions for Penny—each choice updates the story log and the
          path map behind everything.
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          "space-y-4",
          isPax && "px-0 pb-0",
          isPax && paxOnDarkInputSlot()
        )}
      >
        <CurrentMission
          tone={tone}
          disabled={isSimulating}
          onChooseAction={(label) => void runTurn(label)}
        />
        <ActionChoiceButtons
          tone={tone}
          disabled={isSimulating}
          onChoose={(label) => void runTurn(label)}
        />
        <Separator
          className={cn(isPax ? "bg-background/15" : "bg-border")}
        />
        <CustomActionForm
          tone={tone}
          disabled={isSimulating}
          onSubmitAction={(text) => void runTurn(text)}
        />
      </CardContent>
    </Card>
  )
}
