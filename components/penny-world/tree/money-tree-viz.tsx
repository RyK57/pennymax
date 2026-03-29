"use client"

import { motion } from "framer-motion"

interface MoneyTreeVizProps {
  treeHealth: number
  className?: string
}

export function MoneyTreeViz({ treeHealth, className }: MoneyTreeVizProps) {
  const t = Math.min(1, Math.max(0, treeHealth / 100))
  const leafCount = Math.round(6 + t * 14)
  const leaves = Array.from({ length: leafCount }, (_, i) => ({
    key: i,
    x: 50 + Math.sin(i * 1.7) * (18 + t * 12),
    y: 28 + (i % 5) * 8 + (i % 3) * 3,
    r: 3 + (i % 4),
    delay: i * 0.03,
  }))

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      role="img"
    >
      <title>Money tree</title>
      <rect
        width="100"
        height="100"
        rx="12"
        className="fill-muted/40 stroke-border"
        strokeWidth="1"
      />
      <path
        d="M50 88 L50 52 Q48 40 50 32 Q52 40 50 52"
        className="fill-none stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {leaves.map((leaf) => (
        <motion.circle
          key={leaf.key}
          cx={leaf.x}
          cy={leaf.y}
          r={leaf.r}
          className="fill-primary"
          initial={{ opacity: 0.2, scale: 0.6 }}
          animate={{
            opacity: 0.35 + t * 0.55,
            scale: 0.85 + t * 0.2,
          }}
          transition={{
            duration: 0.35,
            delay: leaf.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
      <motion.circle
        cx="50"
        cy="24"
        r={4 + t * 6}
        className="fill-accent/80 stroke-accent-foreground/20"
        strokeWidth="0.5"
        animate={{ scale: 0.95 + t * 0.08 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
    </svg>
  )
}
