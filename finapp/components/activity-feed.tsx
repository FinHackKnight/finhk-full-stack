"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"

interface Activity {
  id: string
  title: string
  description: string
  time: string
  category: string
}

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Market Alert Triggered",
    description: "S&P 500 crossed 4,500 threshold",
    time: "5 minutes ago",
    category: "Market",
  },
  {
    id: "2",
    title: "New Event Detected",
    description: "Political summit scheduled in Brussels",
    time: "12 minutes ago",
    category: "Political",
  },
  {
    id: "3",
    title: "Volatility Spike",
    description: "VIX increased by 15% in last hour",
    time: "23 minutes ago",
    category: "Market",
  },
  {
    id: "4",
    title: "Economic Data Release",
    description: "US unemployment figures published",
    time: "1 hour ago",
    category: "Economic",
  },
  {
    id: "5",
    title: "Currency Movement",
    description: "EUR/USD breaks key resistance level",
    time: "2 hours ago",
    category: "Forex",
  },
  {
    id: "6",
    title: "Commodity Update",
    description: "Gold prices reach new monthly high",
    time: "3 hours ago",
    category: "Commodities",
  },
]

export function ActivityFeed() {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border h-full">
      <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium leading-tight">{activity.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{activity.category}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
