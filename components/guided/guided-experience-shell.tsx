"use client"

import { useEffect } from "react"
import Link from "next/link"

import { useGuidedStore } from "@/lib/stores/use-guided-store"

import { GuidedOnboarding } from "./guided-onboarding"
import { GuidedPlay } from "./guided-play"

export function GuidedExperienceShell() {
  const phase = useGuidedStore((s) => s.phase)
  const reset = useGuidedStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [reset])

  if (phase === "onboarding") {
    return (
      <div className="font-primary min-h-dvh bg-gradient-to-b from-muted/40 to-background px-4 py-8 pb-16">
        <div className="mx-auto mb-6 flex max-w-lg justify-between gap-2">
          <ButtonLink href="/">← Home</ButtonLink>
          <ButtonLink href="/play/free">Free form →</ButtonLink>
        </div>
        <div className="flex justify-center">
          <GuidedOnboarding />
        </div>
      </div>
    )
  }

  return <GuidedPlay />
}

function ButtonLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      {children}
    </Link>
  )
}
