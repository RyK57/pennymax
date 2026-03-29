"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Sparkles, Map, Image as ImageIcon, MessageCircle } from "lucide-react"
import Image from "next/image"

// Demo UI images for illustration-style snapshots (replace src as needed)
const exampleGuidedImg = "/guided.png"
const exampleFreeFormImg = "/freeform.png"

export function ExperienceHome() {
  return (
    <div className="font-primary min-h-dvh bg-gradient-to-b from-primary/10 via-background to-muted/30 px-0 py-0 flex flex-col">
      <header className="text-center py-10 px-4">
        <div className="flex flex-col items-center justify-center mb-2">
          <Image
            src="/full.png"
            alt="Penny's World"
            width={100}
            height={100}
            className="mb-1"
          />
          <p className="text-lg font-bold uppercase tracking-widest text-primary drop-shadow-sm mt-2">
            Penny&apos;s World
          </p>
        </div>
        <h1 className="mt-4 font-primary text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl drop-shadow-lg text-center">
          Where will your journey begin?
        </h1>
        <div className="mx-auto mt-6 max-w-xl w-full px-0">
          <div className="flex flex-row gap-2 justify-center items-stretch">
            {/* Guided Story */}
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-primary/20 bg-white/80 p-3 min-w-[140px] max-w-[220px] transition-shadow hover:shadow-md">
              <Sparkles className="text-primary w-6 h-6 mb-1" />
              <span className="font-semibold text-primary text-base">Guided Story</span>
              <span className="text-xs text-muted-foreground text-center mt-1 leading-snug">
                Step-by-step, visual, pick choices.
              </span>
            </div>
            <span className="flex items-center font-semibold text-primary/30 text-sm px-2 select-none">or</span>
            {/* Free Form World */}
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-primary/20 bg-white/80 p-3 min-w-[140px] max-w-[220px] transition-shadow hover:shadow-md">
              <Map className="text-primary w-6 h-6 mb-1" />
              <span className="font-semibold text-primary text-base">Free Form</span>
              <span className="text-xs text-muted-foreground text-center mt-1 leading-snug">
                Open-ended, imagine &amp; play.
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Use whole viewport space, centered and pictorial */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 pb-12">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
          {/* Guided experience card */}
          <Card
            className={cn(
              "border-primary/20 shadow-2xl transition-transform hover:scale-[1.025] hover:shadow-3xl bg-white/85 h-full flex flex-col",
              "ring-2 ring-primary/15"
            )}
          >
            <CardHeader className="flex flex-row gap-3 items-center pb-2">
              <div className="rounded-xl bg-primary/10 p-3 flex items-center justify-center">
                <Sparkles className="text-primary w-8 h-8" />
              </div>
              <div>
                <CardTitle className="font-primary text-2xl mb-0 tracking-tight">
                  Guided Story Mode
                </CardTitle>
                <CardDescription className="font-medium mt-0.5">
                  Your adventure, step by step—see art, pick choices, and create the story!
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-1 justify-between">
              {/* UI snapshot area */}
              <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/0 via-background to-primary/5 shadow-inner relative aspect-[16/8] mb-3 w-full max-w-[625px] mx-auto">
                <img
                  src={exampleGuidedImg}
                  alt="Guided Story Example UI"
                  className="object-cover w-full h-full brightness-95"
                  style={{ maxHeight: "340px", minHeight: "240px" }}
                />
                <div className="absolute bottom-4 left-4 flex gap-4">
                  <div className="flex items-center gap-1 bg-white/80 p-3 rounded-lg text-base shadow">
                    <ImageIcon className="w-5 h-5 text-primary/65" /> Scene Art
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 p-3 rounded-lg text-base shadow">
                    <MessageCircle className="w-5 h-5 text-primary/65" /> Choices &amp; Chat
                  </div>
                </div>
              </div>
              <ul className="text-base text-muted-foreground space-y-2 px-1">
                <li>
                  <b>Short onboarding</b> builds your profile.
                </li>
                <li>
                  <b>Original scene art</b> with every story moment.
                </li>
                <li>
                  <b>Guided prompts</b>: Pick a suggestion or type your own.
                </li>
                <li>
                  <b>Immediate feedback</b>: Watch your choices shape the outcome.
                </li>
              </ul>
              <Button className="w-full rounded-lg mt-4" size="lg" asChild>
                <Link href="/play/guided">Start Guided</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Free form world card */}
          <Card
            className={cn(
              "border-border/80 shadow-2xl transition-transform hover:scale-[1.025] hover:shadow-3xl bg-white/85 h-full flex flex-col"
            )}
          >
            <CardHeader className="flex flex-row gap-3 items-center pb-2">
              <div className="rounded-xl bg-muted/10 p-3 flex items-center justify-center">
                <Map className="text-green-600 w-8 h-8" />
              </div>
              <div>
                <CardTitle className="font-primary text-2xl mb-0 tracking-tight">
                  Free Form World
                </CardTitle>
                <CardDescription className="font-medium mt-0.5">
                  Total sandbox—explore, chat, pick missions, set the pace!
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-1 justify-between">
              {/* UI snapshot area */}
              <div className="overflow-hidden rounded-3xl border border-green-300 bg-gradient-to-br from-green-50 via-background to-green-100 shadow-inner relative aspect-[16/8] mb-3 w-full max-w-[625px] mx-auto">
                <img
                  src={exampleFreeFormImg}
                  alt="Free Form World Example UI"
                  className="object-cover w-full h-full brightness-95"
                  style={{ maxHeight: "340px", minHeight: "240px" }}
                />
                <div className="absolute bottom-4 left-4 flex gap-4">
                  <div className="flex items-center gap-1 bg-white/80 p-3 rounded-lg text-base shadow">
                    <Map className="w-5 h-5 text-green-500" /> Map
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 p-3 rounded-lg text-base shadow">
                    <MessageCircle className="w-5 h-5 text-green-500" /> NPC Chats
                  </div>
                </div>
              </div>
              <ul className="text-base text-muted-foreground space-y-2 px-1">
                <li>
                  <b>Full open map</b>—go anywhere, anytime.
                </li>
                <li>
                  <b>Story log</b> to track your own adventures.
                </li>
                <li>
                  <b>Talk to characters</b> &amp; take on missions.
                </li>
                <li>
                  <b>Choose any approach</b>: save, spend, explore!
                </li>
              </ul>
              <Button
                className="w-full rounded-lg mt-4"
                size="lg"
                variant="secondary"
                asChild
              >
                <Link href="/play/free">Enter Free Form</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
