import Image from "next/image"
import Link from "next/link"

import { DEMO_HREF, FREE_PLAY_HREF, SECTION_IDS } from "./lander-constants"

const footerLinks = [
  { href: `#${SECTION_IDS.demo}`, label: "Demo" },
  { href: `#${SECTION_IDS.pipeline}`, label: "Pipeline" },
  { href: `#${SECTION_IDS.architecture}`, label: "Architecture" },
  { href: `#${SECTION_IDS.mesh}`, label: "Stack" },
] as const

export function LanderFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/full.png" alt="" width={40} height={40} />
            <span className="font-primary text-lg font-semibold">Pennymax</span>
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Alternate financial literacy sandbox—guided narrative engine plus open map play.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Product
            </p>
            <ul className="space-y-1.5">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-foreground hover:text-primary">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Play
            </p>
            <ul className="space-y-1.5">
              <li>
                <Link href={DEMO_HREF} className="text-foreground hover:text-primary">
                  Try demo
                </Link>
              </li>
              <li>
                <Link href={FREE_PLAY_HREF} className="text-foreground hover:text-primary">
                  Free form
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-5xl text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pennymax · Penny&apos;s World
      </p>
    </footer>
  )
}
