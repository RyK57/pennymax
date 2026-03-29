import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const LOCATIONS = ["Home", "Market", "Bank", "Park"] as const

export function WorldMapPlaceholder() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>World</CardTitle>
        <CardDescription>Tap a place in your head—Penny travels between these spots.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((name) => (
            <Badge
              key={name}
              variant="secondary"
              className="rounded-md px-3 py-1 text-sm"
            >
              {name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
