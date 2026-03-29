import Link from "next/link"

import { GamePageShell } from "@/components/penny-world/shell/game-page-shell"

export default function FreeFormPlayPage() {
  return (
    <div className="font-primary">
      <div className="pointer-events-auto fixed left-3 top-3 z-[25] sm:left-4">
        <Link
          href="/"
          className="game-floating-panel rounded-lg px-3 py-1.5 text-xs font-medium text-background hover:opacity-95"
        >
          ← Home
        </Link>
      </div>
      <GamePageShell />
    </div>
  )
}
