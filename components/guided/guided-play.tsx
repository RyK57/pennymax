"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { postGuidedStep } from "@/lib/api/guided-client"
import { useGuidedStore } from "@/lib/stores/use-guided-store"
import { cn } from "@/lib/utils"

import { GuidedTopBar } from "./guided-top-bar"

export function GuidedPlay() {
  const sessionId = useGuidedStore((s) => s.sessionId)
  const question = useGuidedStore((s) => s.question)
  const imageUrl = useGuidedStore((s) => s.imageUrl)
  const sceneDescription = useGuidedStore((s) => s.sceneDescription)
  const suggestedActions = useGuidedStore((s) => s.suggestedActions)
  const balanceCents = useGuidedStore((s) => s.balanceCents)
  const goalAmountCents = useGuidedStore((s) => s.goalAmountCents)
  const score = useGuidedStore((s) => s.score)
  const treeHealth = useGuidedStore((s) => s.treeHealth)
  const outcome = useGuidedStore((s) => s.outcome)
  const phase = useGuidedStore((s) => s.phase)
  const scriptStep = useGuidedStore((s) => s.scriptStep)
  const stepTitle = useGuidedStore((s) => s.stepTitle)
  const grandpaHint = useGuidedStore((s) => s.grandpaHint)
  const pennyLetter = useGuidedStore((s) => s.pennyLetter)
  const isLoading = useGuidedStore((s) => s.isLoading)
  const setLoading = useGuidedStore((s) => s.setLoading)
  const setError = useGuidedStore((s) => s.setError)
  const applyScene = useGuidedStore((s) => s.applyScene)
  const profile = useGuidedStore((s) => s.profile)
  const reset = useGuidedStore((s) => s.reset)

  const [draft, setDraft] = useState("")

  async function submitKidLine(text: string) {
    const line = text.trim()
    if (!line || !sessionId || isLoading) return
    setError(null)
    setLoading(true)
    try {
      const data = await postGuidedStep(sessionId, line)
      applyScene(data)
      setDraft("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (phase === "ended") {
    return (
      <div className="font-primary relative min-h-dvh bg-zinc-950 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/90 to-zinc-950" />
        </div>

        <GuidedTopBar
          balanceCents={balanceCents}
          goalAmountCents={goalAmountCents}
          score={score}
          treeHealth={treeHealth}
          title="Penny & the Money Tree"
          scriptStep={scriptStep}
          stepTitle={stepTitle}
        />

        <main className="relative z-10 mx-auto flex max-w-lg flex-col gap-6 px-4 pb-12 pt-28">
          {pennyLetter && outcome === "won" ? (
            <section className="rounded-2xl border border-white/20 bg-black/55 p-5 shadow-xl backdrop-blur-md">
              <h2 className="text-lg font-semibold text-amber-200">
                A letter from Penny
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                {pennyLetter}
              </p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-white/20 bg-black/55 p-5 text-center shadow-xl backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white">
              {outcome === "won" ? "Golden tree!" : "Story pause"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              {outcome === "won"
                ? "The Money Tree shone bright because of the choices you helped Penny make."
                : "Every great saver has rough days—the tree can sleep, but what you learned stays."}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                type="button"
                className="rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400"
                onClick={() => reset()}
              >
                Play again
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/play/free">Free form world</Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-lg text-white hover:bg-white/10"
                asChild
              >
                <Link href="/">Home</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="font-primary fixed inset-0 min-h-dvh overflow-hidden bg-zinc-950">
      <div className="absolute inset-0">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-emerald-900 to-zinc-950" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/60"
          aria-hidden
        />
      </div>

      {isLoading ? (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          aria-busy
          aria-live="polite"
        >
          <p className="rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-sm text-white">
            Growing the next scene…
          </p>
        </div>
      ) : null}

      <GuidedTopBar
        balanceCents={balanceCents}
        goalAmountCents={goalAmountCents}
        score={score}
        treeHealth={treeHealth}
        title={`Penny & the Money Tree · ${profile?.childName ?? "friend"}`}
        scriptStep={scriptStep}
        stepTitle={stepTitle}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-20 flex flex-col justify-end pb-6 pt-32 sm:pt-40">
        <div className="pointer-events-auto mx-auto w-full max-w-lg px-3 sm:max-w-xl">
          {grandpaHint ? (
            <div className="mb-2 rounded-xl border border-amber-400/40 bg-amber-950/80 px-3 py-2 text-sm text-amber-100 backdrop-blur-md">
              <span className="font-semibold text-amber-200">Grandpa Sam · </span>
              {grandpaHint}
            </div>
          ) : null}

          <div className="max-h-[min(52vh,28rem)] overflow-hidden rounded-2xl border border-white/20 bg-black/50 shadow-2xl backdrop-blur-md">
            <div className="space-y-3 p-4 text-white">
              {sceneDescription ? (
                <p className="text-sm leading-relaxed text-white/85">
                  {sceneDescription}
                </p>
              ) : null}

              <h2 className="text-base font-semibold leading-snug text-white sm:text-lg">
                {question}
              </h2>
              <p className="text-xs text-white/60">
                ⭐ smart money moves · ❌ tempting choices — tap one or type your own
              </p>

              <ScrollArea className="h-[min(11rem,28vh)] sm:h-[min(12rem,30vh)]">
                <div className="flex flex-col gap-2 pr-3">
                  {suggestedActions.map((label) => (
                    <Button
                      key={label}
                      type="button"
                      variant="secondary"
                      disabled={isLoading}
                      className={cn(
                        "h-auto min-h-10 w-full justify-start whitespace-normal rounded-xl border border-white/15 bg-white/12 px-3 py-2 text-left text-sm leading-snug text-white hover:bg-white/20"
                      )}
                      onClick={() => void submitKidLine(label)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              {/* Added extra margin below the input bar for more space so it doesn't look cut off */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch mb-36">
                <Input
                  placeholder="What should Penny do or say?"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      void submitKidLine(draft)
                    }
                  }}
                  className="rounded-xl border-white/20 bg-black/35 text-white placeholder:text-white/40"
                />
                <Button
                  type="button"
                  className="shrink-0 rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400"
                  disabled={isLoading || !draft.trim()}
                  onClick={() => void submitKidLine(draft)}
                >
                  Send
                </Button>
              </div>

              <div className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-3 text-xs">
                <Link
                  href="/"
                  className="text-white/55 underline-offset-2 hover:text-white hover:underline"
                >
                  ← Home
                </Link>
                <Link
                  href="/play/free"
                  className="text-white/55 underline-offset-2 hover:text-white hover:underline"
                >
                  Free form →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
