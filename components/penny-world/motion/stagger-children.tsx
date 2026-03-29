"use client"

import { motion } from "framer-motion"

interface StaggerChildrenProps {
  children: React.ReactNode
  stagger?: number
  className?: string
}

export function StaggerChildren({
  children,
  stagger = 0.06,
  className,
}: StaggerChildrenProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: { duration: 0.24 } },
      }}
    >
      {children}
    </motion.div>
  )
}
