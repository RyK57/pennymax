/** Theme-aware silhouettes (currentColor) — swap for real art later. */

interface NpcPortraitProps {
  npcId: string
  className?: string
}

export function NpcPortrait({ npcId, className }: NpcPortraitProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      role="img"
    >
      <title>{npcId}</title>
      <rect
        width="120"
        height="120"
        rx="16"
        className="fill-muted/50 stroke-border"
        strokeWidth="2"
      />
      {npcId === "grandpa" ? (
        <g className="text-primary">
          <circle cx="60" cy="44" r="18" fill="currentColor" opacity="0.35" />
          <path
            d="M36 96c4-22 16-32 24-32s20 10 24 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M42 38c6-10 18-14 18-14s12 4 18 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.6"
          />
        </g>
      ) : null}
      {npcId === "friend" ? (
        <g className="text-accent">
          <circle cx="60" cy="46" r="20" fill="currentColor" opacity="0.4" />
          <ellipse cx="60" cy="88" rx="28" ry="18" fill="currentColor" opacity="0.25" />
          <path
            d="M44 52h32M52 62h16"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      ) : null}
      {npcId === "shopkeeper" ? (
        <g className="text-primary">
          <rect
            x="34"
            y="36"
            width="52"
            height="40"
            rx="6"
            fill="currentColor"
            opacity="0.2"
          />
          <rect
            x="28"
            y="78"
            width="64"
            height="22"
            rx="4"
            fill="currentColor"
            opacity="0.35"
          />
          <path
            d="M48 52h24M48 60h18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      ) : null}
      {npcId === "coach" ? (
        <g className="text-secondary">
          <circle cx="60" cy="42" r="17" fill="currentColor" opacity="0.35" />
          <path
            d="M40 72h40l-6 28H46l-6-28z"
            fill="currentColor"
            opacity="0.3"
          />
          <path
            d="M52 30l8-8 8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      ) : null}
      {npcId === "cousin" ? (
        <g className="text-accent">
          <circle cx="60" cy="44" r="18" fill="currentColor" opacity="0.38" />
          <path
            d="M38 88c6-16 18-24 22-24s16 8 22 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="78" cy="36" r="5" fill="currentColor" opacity="0.5" />
        </g>
      ) : null}
      {npcId === "librarian" ? (
        <g className="text-primary">
          <rect
            x="38"
            y="34"
            width="44"
            height="58"
            rx="4"
            fill="currentColor"
            opacity="0.22"
          />
          <path
            d="M46 46h28M46 56h28M46 66h20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.65"
          />
          <circle cx="60" cy="102" r="6" fill="currentColor" opacity="0.35" />
        </g>
      ) : null}
    </svg>
  )
}
