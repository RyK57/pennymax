import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface GameHeaderProps {
  title: string
  scenarioLabel: string
}

export function GameHeader({ title, scenarioLabel }: GameHeaderProps) {
  return (
    <Card size="sm" className="border-border shadow-sm">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{scenarioLabel}</CardDescription>
      </CardHeader>
    </Card>
  )
}
