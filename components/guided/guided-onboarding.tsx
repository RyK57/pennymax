"use client"

import { useCallback, useMemo, useState } from "react"

import { postGuidedStart } from "@/lib/api/guided-client"
import { useGuidedStore } from "@/lib/stores/use-guided-store"
import {
  deriveGuidedPersonalityType,
  type GuidedDifficulty,
  type GuidedDifficultySetting,
  type GuidedProfile,
  type GuidedSpenderStyle,
} from "@/lib/types/guided"
import { cn } from "@/lib/utils"

const BG = "bg-[#f9f9f7]"
const CARD = "rounded-2xl border border-[#e5e5e0] bg-white"
const TEXT = "text-[#1a1a1a]"
const MUTED = "text-[#888888]"
const BLUE = "#378ADD"
const GREEN = "#1D9E75"

const INTEREST_CHIPS: { id: string; icon: string; label: string }[] = [
  { id: "sports", icon: "⚽", label: "Sports" },
  { id: "art", icon: "🎨", label: "Art & drawing" },
  { id: "music", icon: "🎵", label: "Music" },
  { id: "gaming", icon: "🎮", label: "Gaming" },
  { id: "animals", icon: "🐾", label: "Animals" },
  { id: "cooking", icon: "🍳", label: "Cooking & baking" },
  { id: "outdoors", icon: "🌲", label: "Outdoors & nature" },
  { id: "reading", icon: "📚", label: "Books & reading" },
  { id: "dancing", icon: "💃", label: "Dancing" },
]

const PERSONALITY_CHIPS: { id: string; icon: string; label: string }[] = [
  { id: "leader", icon: "👑", label: "I like being in charge" },
  { id: "helper", icon: "🤝", label: "I love helping others" },
  { id: "creator", icon: "✨", label: "I'm super creative" },
  { id: "explorer", icon: "🗺️", label: "I love adventures" },
  { id: "thinker", icon: "🧠", label: "I like to think things through" },
  { id: "funny", icon: "😄", label: "I'm really funny" },
]

const SPENDER_CHIPS: { id: GuidedSpenderStyle; icon: string; label: string }[] =
  [
    { id: "spend", icon: "🛍️", label: "I spend it right away" },
    { id: "saver", icon: "🐷", label: "I save it for later" },
    { id: "split", icon: "⚖️", label: "A little of both" },
  ]

const TEMPTATION_CHIPS: { id: string; icon: string; label: string }[] = [
  { id: "sneakers", icon: "👟", label: "New sneakers" },
  { id: "toy", icon: "🧸", label: "A cool toy or game" },
  { id: "food", icon: "🍕", label: "Tons of food & snacks" },
  { id: "gear", icon: "🏅", label: "Sports gear" },
  { id: "craft", icon: "🖌️", label: "Art or craft supplies" },
  { id: "tech", icon: "🎧", label: "Tech & gadgets" },
  { id: "pet", icon: "🐶", label: "Stuff for a pet" },
  { id: "accessories", icon: "💎", label: "Jewelry & accessories" },
]

const DIFFICULTY_CHIPS: { id: GuidedDifficultySetting; icon: string; label: string }[] =
  [
    { id: "easy", icon: "🌱", label: "Easy — just learning" },
    { id: "medium", icon: "🌿", label: "Medium — some challenge" },
    { id: "hard", icon: "🌳", label: "Hard — I'm ready!" },
  ]

function formatInterestLabels(ids: string[]): string {
  return ids
    .map((id) => INTEREST_CHIPS.find((c) => c.id === id)?.label ?? id)
    .join(", ")
}

function formatPersonalityLabels(ids: string[]): string {
  return ids
    .map((id) => PERSONALITY_CHIPS.find((c) => c.id === id)?.label ?? id)
    .join(", ")
}

function formatTemptationLabels(ids: string[]): string {
  return ids
    .map((id) => TEMPTATION_CHIPS.find((c) => c.id === id)?.label ?? id)
    .join(", ")
}

function grandpaSummaryLine(spender: GuidedSpenderStyle): string {
  if (spender === "saver")
    return `"I can already tell you're a natural saver. Let's make that tree shine."`
  if (spender === "spend")
    return `"It's okay if spending feels easy — that's exactly why we're here."`
  if (spender === "split")
    return `"A little save, a little spend — that balance is where wisdom grows."`
  return `"Your tree is ready. Let's see what you're made of."`
}

function ProgressDots({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-all",
            i < current - 1 && "scale-100",
            i === current - 1 && "scale-125",
            i > current - 1 && "scale-100"
          )}
          style={{
            backgroundColor:
              i < current - 1 ? GREEN : i === current - 1 ? BLUE : "#dddddd",
          }}
        />
      ))}
      <span className={cn("ml-1 text-xs", MUTED)}>
        {current} of {total}
      </span>
    </div>
  )
}

export function GuidedOnboarding() {
  const setProfile = useGuidedStore((s) => s.setProfile)
  const setLoading = useGuidedStore((s) => s.setLoading)
  const setError = useGuidedStore((s) => s.setError)
  const applyScene = useGuidedStore((s) => s.applyScene)
  const isLoading = useGuidedStore((s) => s.isLoading)
  const lastError = useGuidedStore((s) => s.lastError)

  const [step, setStep] = useState(0)
  const [childName, setChildName] = useState("")
  const [goalDollars, setGoalDollars] = useState(100)
  const [interests, setInterests] = useState<string[]>([])
  const [personality, setPersonality] = useState<string[]>([])
  const [spender, setSpender] = useState<GuidedSpenderStyle>("")
  const [temptation, setTemptation] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<GuidedDifficulty>("")

  const changeAmt = useCallback((delta: number) => {
    setGoalDollars((a) => Math.max(25, Math.min(500, a + delta)))
  }, [])

  const toggleMulti = useCallback((key: string, arr: string[], setArr: (v: string[]) => void) => {
    const idx = arr.indexOf(key)
    if (idx >= 0) setArr(arr.filter((x) => x !== key))
    else setArr([...arr, key])
  }, [])

  const togglePersonality = useCallback((id: string) => {
    setPersonality((prev) => {
      const i = prev.indexOf(id)
      if (i >= 0) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }, [])

  const buildProfile = useCallback((): GuidedProfile => {
    const personalityType = deriveGuidedPersonalityType(personality)
    const interestStr = interests.length ? formatInterestLabels(interests) : "lots of things"
    const temptStr =
      temptation.length > 0
        ? formatTemptationLabels(temptation)
        : "something tempting at the mall"
    const savingGoalLabel = `Save for a better home — hardest temptation: ${temptStr}`
    const diffSetting: GuidedDifficultySetting =
      difficulty === "easy" || difficulty === "hard" ? difficulty : "medium"
    const extraParts = [
      `Interests: ${interestStr}.`,
      personality.length
        ? `Personality chips: ${formatPersonalityLabels(personality)}.`
        : "",
      spender ? `Money habit: ${spender}.` : "",
      `Difficulty: ${diffSetting}.`,
      `Player chose mall temptation themes: ${temptStr}.`,
    ]
    return {
      childName: childName.trim() || "friend",
      personalityType,
      ageRange: "7-8",
      savingGoalLabel,
      goalAmountCents: Math.round(goalDollars * 100),
      interests: [...interests],
      personalityChipSelections: [...personality],
      spenderStyle: spender,
      temptation: [...temptation],
      difficulty: diffSetting,
      extraNote: extraParts.filter(Boolean).join(" "),
    }
  }, [
    childName,
    goalDollars,
    interests,
    personality,
    spender,
    temptation,
    difficulty,
  ])

  const summaryProfile = useMemo(() => buildProfile(), [buildProfile])

  async function beginAdventure() {
    const profile = buildProfile()
    setProfile(profile)
    setError(null)
    setLoading(true)
    try {
      const data = await postGuidedStart(profile)
      applyScene(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start story")
    } finally {
      setLoading(false)
    }
  }

  function resetAll() {
    setStep(0)
    setChildName("")
    setGoalDollars(100)
    setInterests([])
    setPersonality([])
    setSpender("")
    setTemptation([])
    setDifficulty("")
  }

  const nameOk = childName.trim().length >= 1

  return (
    <div
      className={cn(
        "font-primary flex min-h-dvh items-center justify-center p-4",
        BG,
        TEXT
      )}
    >
      <div className={cn("w-full max-w-[480px] px-8 py-8", CARD, "min-h-[400px]")}>
        {step === 0 ? (
          <div className="py-4 text-center">
            <div className="mb-3 text-[52px] leading-none">🌳</div>
            <h1 className="mb-2 text-[22px] font-semibold leading-tight text-[#1a1a1a]">
              Welcome to Penny&apos;s Money Tree
            </h1>
            <p className={cn("mx-auto mb-8 max-w-[340px] text-sm", MUTED)}>
              Before the adventure begins, let&apos;s make your story just for you!
              Answer a few quick questions.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#378ADD] bg-[#378ADD] px-[22px] py-2.5 text-sm font-medium text-white transition-colors hover:border-[#185FA5] hover:bg-[#185FA5]"
              onClick={() => setStep(1)}
            >
              Let&apos;s go →
            </button>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <ProgressDots current={1} total={6} />
            <p className={cn("mb-1.5 text-xs tracking-wide", MUTED)}>About you</p>
            <h2 className="mb-1 text-xl font-semibold leading-snug text-[#1a1a1a]">
              What&apos;s your name?
            </h2>
            <p className={cn("mb-5 text-[13px]", MUTED)}>
              Penny will call you this throughout the story.
            </p>
            <input
              type="text"
              maxLength={20}
              placeholder="Type your name..."
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="mb-6 w-full max-w-[320px] rounded-lg border-[1.5px] border-[#e0e0da] bg-white px-3.5 py-2.5 text-[15px] text-[#1a1a1a] outline-none transition-colors focus:border-[#378ADD]"
            />
            <h2 className="mb-1 text-xl font-semibold leading-snug text-[#1a1a1a]">
              Pick a savings goal
            </h2>
            <p className={cn("mb-5 text-[13px]", MUTED)}>
              How much does Penny want to save for her family?
            </p>
            <div className="mb-6 flex items-center gap-2.5">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-[#e0e0da] bg-white text-lg transition-colors hover:bg-[#f5f5f0]"
                onClick={() => changeAmt(-25)}
                aria-label="Decrease goal"
              >
                −
              </button>
              <div className="min-w-[5rem] text-center text-[26px] font-semibold text-[#1a1a1a]">
                ${goalDollars}
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-[#e0e0da] bg-white text-lg transition-colors hover:bg-[#f5f5f0]"
                onClick={() => changeAmt(25)}
                aria-label="Increase goal"
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={!nameOk}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-[22px] py-2.5 text-sm font-medium transition-colors",
                nameOk
                  ? "border-[#378ADD] bg-[#378ADD] text-white hover:border-[#185FA5] hover:bg-[#185FA5]"
                  : "cursor-not-allowed border-[#e0e0da] bg-white opacity-40 text-[#1a1a1a]"
              )}
              onClick={() => setStep(2)}
            >
              Next →
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <ProgressDots current={2} total={6} />
            <p className={cn("mb-1.5 text-xs tracking-wide", MUTED)}>Interests</p>
            <h2 className="mb-1 text-xl font-semibold leading-snug">What do you love doing?</h2>
            <p className={cn("mb-5 text-[13px]", MUTED)}>
              Pick as many as you want — your story will match!
            </p>
            <div className="mb-6 flex flex-wrap gap-2.5">
              {INTEREST_CHIPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleMulti(c.id, interests, setInterests)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2.5 text-sm transition-colors select-none",
                    interests.includes(c.id)
                      ? "border-[#378ADD] bg-[#E6F1FB] text-[#0C447C]"
                      : "border-[#e0e0da] bg-white text-[#1a1a1a] hover:border-[#aaaaaa]"
                  )}
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mr-3 inline-flex items-center gap-1.5 rounded-lg border border-[#378ADD] bg-[#378ADD] px-[22px] py-2.5 text-sm font-medium text-white hover:border-[#185FA5] hover:bg-[#185FA5]"
              onClick={() => setStep(3)}
            >
              Next →
            </button>
            <button
              type="button"
              className="text-xs text-[#bbbbbb] underline"
              onClick={() => setStep(3)}
            >
              skip
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <ProgressDots current={3} total={6} />
            <p className={cn("mb-1.5 text-xs tracking-wide", MUTED)}>Personality</p>
            <h2 className="mb-1 text-xl font-semibold leading-snug">
              What kind of person are you?
            </h2>
            <p className={cn("mb-5 text-[13px]", MUTED)}>
              Pick up to 2 — this shapes how Penny earns money.
            </p>
            <div className="mb-6 flex flex-wrap gap-2.5">
              {PERSONALITY_CHIPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => togglePersonality(c.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2.5 text-sm transition-colors select-none",
                    personality.includes(c.id)
                      ? "border-[#378ADD] bg-[#E6F1FB] text-[#0C447C]"
                      : "border-[#e0e0da] bg-white text-[#1a1a1a] hover:border-[#aaaaaa]"
                  )}
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mr-3 inline-flex items-center gap-1.5 rounded-lg border border-[#378ADD] bg-[#378ADD] px-[22px] py-2.5 text-sm font-medium text-white hover:border-[#185FA5] hover:bg-[#185FA5]"
              onClick={() => setStep(4)}
            >
              Next →
            </button>
            <button
              type="button"
              className="text-xs text-[#bbbbbb] underline"
              onClick={() => setStep(4)}
            >
              skip
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <ProgressDots current={4} total={6} />
            <p className={cn("mb-1.5 text-xs tracking-wide", MUTED)}>Money habits</p>
            <h2 className="mb-1 text-xl font-semibold leading-snug">
              When you get money, what do you usually do?
            </h2>
            <p className={cn("mb-5 text-[13px]", MUTED)}>
              Be honest — there&apos;s no wrong answer!
            </p>
            <div className="mb-6 flex flex-wrap gap-2.5">
              {SPENDER_CHIPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSpender(c.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2.5 text-sm transition-colors select-none",
                    spender === c.id
                      ? "border-[#378ADD] bg-[#E6F1FB] text-[#0C447C]"
                      : "border-[#e0e0da] bg-white text-[#1a1a1a] hover:border-[#aaaaaa]"
                  )}
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mr-3 inline-flex items-center gap-1.5 rounded-lg border border-[#378ADD] bg-[#378ADD] px-[22px] py-2.5 text-sm font-medium text-white hover:border-[#185FA5] hover:bg-[#185FA5]"
              onClick={() => setStep(5)}
            >
              Next →
            </button>
            <button
              type="button"
              className="text-xs text-[#bbbbbb] underline"
              onClick={() => setStep(5)}
            >
              skip
            </button>
          </div>
        ) : null}

        {step === 5 ? (
          <div>
            <ProgressDots current={5} total={6} />
            <p className={cn("mb-1.5 text-xs tracking-wide", MUTED)}>The big temptation</p>
            <h2 className="mb-1 text-xl font-semibold leading-snug">
              If you had all your money right now, what would be hardest to say no to?
            </h2>
            <p className={cn("mb-5 text-[13px]", MUTED)}>
              This becomes the item Penny will want to buy at the mall!
            </p>
            <div className="mb-6 flex flex-wrap gap-2.5">
              {TEMPTATION_CHIPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleMulti(c.id, temptation, setTemptation)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2.5 text-sm transition-colors select-none",
                    temptation.includes(c.id)
                      ? "border-[#378ADD] bg-[#E6F1FB] text-[#0C447C]"
                      : "border-[#e0e0da] bg-white text-[#1a1a1a] hover:border-[#aaaaaa]"
                  )}
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mr-3 inline-flex items-center gap-1.5 rounded-lg border border-[#378ADD] bg-[#378ADD] px-[22px] py-2.5 text-sm font-medium text-white hover:border-[#185FA5] hover:bg-[#185FA5]"
              onClick={() => setStep(6)}
            >
              Next →
            </button>
            <button
              type="button"
              className="text-xs text-[#bbbbbb] underline"
              onClick={() => setStep(6)}
            >
              skip
            </button>
          </div>
        ) : null}

        {step === 6 ? (
          <div>
            <ProgressDots current={6} total={6} />
            <p className={cn("mb-1.5 text-xs tracking-wide", MUTED)}>Difficulty</p>
            <h2 className="mb-1 text-xl font-semibold leading-snug">
              How challenging do you want the game to be?
            </h2>
            <p className={cn("mb-5 text-[13px]", MUTED)}>
              Harder means more temptations and trickier choices.
            </p>
            <div className="mb-6 flex flex-wrap gap-2.5">
              {DIFFICULTY_CHIPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDifficulty(c.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2.5 text-sm transition-colors select-none",
                    difficulty === c.id
                      ? "border-[#378ADD] bg-[#E6F1FB] text-[#0C447C]"
                      : "border-[#e0e0da] bg-white text-[#1a1a1a] hover:border-[#aaaaaa]"
                  )}
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#378ADD] bg-[#378ADD] px-[22px] py-2.5 text-sm font-medium text-white hover:border-[#185FA5] hover:bg-[#185FA5]"
              onClick={() => setStep(7)}
            >
              Start the story →
            </button>
          </div>
        ) : null}

        {step === 7 ? (
          <div>
            <div className="mb-6 text-center">
              <div className="mb-2 text-[52px] leading-none">🌳</div>
              <h2 className="mb-1 text-lg font-semibold text-[#1a1a1a]">
                Your story is ready, {summaryProfile.childName}!
              </h2>
              <p className={cn("text-[13px]", MUTED)}>
                Here&apos;s what Grandpa Sam knows about you.
              </p>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-2.5">
              <div className="rounded-lg bg-[#f5f5f0] px-3.5 py-3">
                <div className={cn("mb-1 text-[11px] uppercase tracking-wide", MUTED)}>
                  Savings goal
                </div>
                <div className="text-sm font-medium leading-snug text-[#1a1a1a]">
                  ${goalDollars}
                </div>
              </div>
              <div className="rounded-lg bg-[#f5f5f0] px-3.5 py-3">
                <div className={cn("mb-1 text-[11px] uppercase tracking-wide", MUTED)}>
                  Personality
                </div>
                <div className="text-sm font-medium leading-snug text-[#1a1a1a]">
                  {personality.length
                    ? formatPersonalityLabels(personality)
                    : "not set"}
                </div>
              </div>
              <div className="rounded-lg bg-[#f5f5f0] px-3.5 py-3">
                <div className={cn("mb-1 text-[11px] uppercase tracking-wide", MUTED)}>
                  Interests
                </div>
                <div className="text-sm font-medium leading-snug text-[#1a1a1a]">
                  {interests.length
                    ? `${formatInterestLabels(interests.slice(0, 3))}${interests.length > 3 ? " +more" : ""}`
                    : "not set"}
                </div>
              </div>
              <div className="rounded-lg bg-[#f5f5f0] px-3.5 py-3">
                <div className={cn("mb-1 text-[11px] uppercase tracking-wide", MUTED)}>
                  Big temptation
                </div>
                <div className="text-sm font-medium leading-snug text-[#1a1a1a]">
                  {temptation.length
                    ? formatTemptationLabels(temptation)
                    : "not set"}
                </div>
              </div>
              <div className="rounded-lg bg-[#f5f5f0] px-3.5 py-3">
                <div className={cn("mb-1 text-[11px] uppercase tracking-wide", MUTED)}>
                  Money style
                </div>
                <div className="text-sm font-medium leading-snug text-[#1a1a1a]">
                  {spender === "spend"
                    ? "Spender"
                    : spender === "saver"
                      ? "Saver"
                      : spender === "split"
                        ? "Balanced"
                        : "not set"}
                </div>
              </div>
              <div className="rounded-lg bg-[#f5f5f0] px-3.5 py-3">
                <div className={cn("mb-1 text-[11px] uppercase tracking-wide", MUTED)}>
                  Difficulty
                </div>
                <div className="text-sm font-medium leading-snug text-[#1a1a1a]">
                  {summaryProfile.difficulty === "easy"
                    ? "Easy — just learning"
                    : summaryProfile.difficulty === "hard"
                      ? "Hard — I'm ready!"
                      : "Medium — some challenge"}
                </div>
              </div>
            </div>
            <div className="mb-6 flex gap-3 rounded-xl bg-[#f5f5f0] p-5">
              <span className="flex-shrink-0 text-[28px] leading-none">👴</span>
              <p className="text-[13px] italic leading-relaxed text-[#555555]">
                {grandpaSummaryLine(spender)}
              </p>
            </div>
            {lastError ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {lastError}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#378ADD] bg-[#378ADD] px-[22px] py-2.5 text-sm font-medium text-white hover:border-[#185FA5] hover:bg-[#185FA5] disabled:opacity-50"
                onClick={() => void beginAdventure()}
              >
                {isLoading ? "Starting…" : "Begin the adventure →"}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#e0e0da] bg-white px-[22px] py-2.5 text-sm font-medium text-[#1a1a1a] hover:border-[#bbbbbb] hover:bg-[#f5f5f0]"
                onClick={() => {
                  resetAll()
                  setStep(0)
                }}
              >
                Start over
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
