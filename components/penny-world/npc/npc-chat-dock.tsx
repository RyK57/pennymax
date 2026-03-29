"use client"

import { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { persistNpcChatSnapshot } from "@/db/game/events"
import { postJson } from "@/lib/api/flask-client"
import { NPC_BY_ID, NPC_ORDER } from "@/lib/npc-catalog"
import { useGameStore } from "@/lib/stores/use-game-store"
import type { NpcChatResponse, NpcMessage } from "@/lib/types/game"
import { cn } from "@/lib/utils"

import { NpcComposer } from "./npc-composer"
import { NpcIntroCard } from "./npc-intro-card"
import { NpcMessageList } from "./npc-message-list"
import { NpcSuggestedPrompts } from "./npc-suggested-prompts"
import { NpcThreadTabs } from "./npc-thread-tabs"

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `msg-${Date.now()}`
}

interface NpcChatDockProps {
  tone?: "default" | "pax"
}

export function NpcChatDock({ tone = "default" }: NpcChatDockProps) {
  const [activeNpcId, setActiveNpcId] = useState<string>(NPC_ORDER[0])
  const [draftByNpc, setDraftByNpc] = useState<Record<string, string>>({})

  const npcThreads = useGameStore((s) => s.npcThreads)
  const appendNpcMessage = useGameStore((s) => s.appendNpcMessage)
  const recordNpcExchange = useGameStore((s) => s.recordNpcExchange)
  const isNpcSending = useGameStore((s) => s.isNpcSending)
  const setNpcSending = useGameStore((s) => s.setNpcSending)
  const setError = useGameStore((s) => s.setError)

  const isPax = tone === "pax"

  async function sendForNpc(npcId: string, text: string) {
    const def = NPC_BY_ID[npcId]
    if (!def) {
      setError("Unknown character.")
      return
    }

    const thread = npcThreads[npcId] ?? { npcId, messages: [] }
    const prior = thread.messages
    const userMsg: NpcMessage = {
      id: newId(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    }
    appendNpcMessage(npcId, userMsg)

    const history = [...prior, userMsg].slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    setError(null)
    setNpcSending(true)
    try {
      const data = await postJson<NpcChatResponse>("/api/npc-chat", {
        npcId,
        persona: def.persona,
        messages: history,
      })
      const assistantMsg: NpcMessage = {
        id: newId(),
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
      }
      appendNpcMessage(npcId, assistantMsg)

      const exchangeId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `npc-${Date.now()}`
      const narrative = `${def.displayName}: “${data.message.slice(0, 220)}${data.message.length > 220 ? "…" : ""}”`
      const actionLabel = `You said: “${text.slice(0, 56)}${text.length > 56 ? "…" : ""}”`

      recordNpcExchange({
        exchangeId,
        npcId,
        displayName: def.displayName,
        userText: text,
        assistantText: data.message,
      })

      await persistNpcChatSnapshot({
        eventId: exchangeId,
        npcId,
        displayName: def.displayName,
        userText: text,
        assistantText: data.message,
        narrative,
        actionLabel,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "NPC chat failed")
    } finally {
      setNpcSending(false)
    }
  }

  const threadArea = (
    <NpcThreadTabs
        npcIds={[...NPC_ORDER]}
        activeNpcId={activeNpcId}
        onNpcChange={setActiveNpcId}
        tone={tone}
      >
        {(npcId) => {
          const def = NPC_BY_ID[npcId]
          const messages = npcThreads[npcId]?.messages ?? []
          if (!def) {
            return (
              <p
                className={cn(
                  "text-sm",
                  isPax ? "text-background/70" : "text-muted-foreground"
                )}
              >
                Unknown NPC.
              </p>
            )
          }
          return (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <NpcIntroCard npc={def} tone={tone} />
              <NpcSuggestedPrompts
                prompts={def.suggestedPrompts}
                disabled={isNpcSending}
                tone={tone}
                onPick={(t) => {
                  setDraftByNpc((m) => ({ ...m, [npcId]: "" }))
                  void sendForNpc(npcId, t)
                }}
              />
              <NpcMessageList messages={messages} tone={tone} />
              <NpcComposer
                inputId={`npc-reply-${npcId}`}
                value={draftByNpc[npcId] ?? ""}
                onValueChange={(v) =>
                  setDraftByNpc((m) => ({ ...m, [npcId]: v }))
                }
                disabled={isNpcSending}
                tone={tone}
                onSend={(t) => void sendForNpc(npcId, t)}
              />
            </div>
          )
        }}
      </NpcThreadTabs>
  )

  if (isPax) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 text-background">
        <div className="shrink-0">
          <h3 className="text-sm font-semibold text-background">
            Conversations
          </h3>
          <p className="text-xs text-background/65">
            Every reply also drops into the story log and the path map.
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3">{threadArea}</div>
      </div>
    )
  }

  return (
    <Card className="flex min-h-0 flex-col border-border shadow-sm">
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
        <CardDescription>
          Each person has their own vibe—starters below. NPCs never see your
          simulation numbers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        {threadArea}
      </CardContent>
    </Card>
  )
}
