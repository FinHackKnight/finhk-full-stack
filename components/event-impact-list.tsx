"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, Globe, Zap } from "lucide-react"

interface Event {
  id: string
  title: string
  type: "conflict" | "economic" | "political" | "natural"
  impact: "high" | "medium" | "low"
  region: string
  time: string
  affectedMarkets: string[]
}

const RECENT_EVENTS: Event[] = [
  {
    id: "1",
    title: "US Federal Reserve Rate Decision",
    type: "economic",
    impact: "high",
    region: "North America",
    time: "2h ago",
    affectedMarkets: ["USD", "Bonds", "Equities"],
  },
  {
    id: "2",
    title: "EU Energy Policy Announcement",
    type: "political",
    impact: "high",
    region: "Europe",
    time: "4h ago",
    affectedMarkets: ["EUR", "Energy", "Utilities"],
  },
  {
    id: "3",
    title: "China Manufacturing Data Release",
    type: "economic",
    impact: "medium",
    region: "Asia",
    time: "6h ago",
    affectedMarkets: ["CNY", "Commodities"],
  },
  {
    id: "4",
    title: "Middle East Diplomatic Talks",
    type: "political",
    impact: "medium",
    region: "Middle East",
    time: "8h ago",
    affectedMarkets: ["Oil", "Gold"],
  },
]

const typeIcons = {
  conflict: AlertCircle,
  economic: TrendingUp,
  political: Globe,
  natural: Zap,
}

const typeColors = {
  conflict: "text-red-500 bg-red-500/10",
  economic: "text-blue-500 bg-blue-500/10",
  political: "text-purple-500 bg-purple-500/10",
  natural: "text-green-500 bg-green-500/10",
}

const impactColors = {
  high: "border-red-500/50 bg-red-500/5",
  medium: "border-yellow-500/50 bg-yellow-500/5",
  low: "border-green-500/50 bg-green-500/5",
}

export function EventImpactList() {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
      <h3 className="text-sm font-semibold mb-4">Recent High-Impact Events</h3>
      <div className="space-y-3">
        {RECENT_EVENTS.map((event) => {
          const Icon = typeIcons[event.type]
          return (
            <div key={event.id} className={`p-3 rounded-lg border ${impactColors[event.impact]}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${typeColors[event.type]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium leading-tight">{event.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {event.region}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {event.impact} impact
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {event.affectedMarkets.map((market) => (
                      <span key={market} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {market}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
