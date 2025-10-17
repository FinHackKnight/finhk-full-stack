"use client"

import { StatsOverview } from "@/components/stats-overview"
import { ActivityFeed } from "@/components/activity-feed"
import { MarketChart } from "@/components/market-chart"
import { EventImpactList } from "@/components/event-impact-list"

// Generate sample data
const generateData = (base: number, volatility: number, points = 24) => {
  const data = []
  let value = base
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * volatility
    data.push({
      time: `${i}:00`,
      value: value,
    })
  }
  return data
}

const globalIndexData = generateData(3200, 15)

export function DashboardView() {
  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Insights Dashboard</h2>
          <p className="text-sm text-muted-foreground">Comprehensive overview of global events and market impacts</p>
        </div>

        <StatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MarketChart
              title="Global Market Index"
              data={globalIndexData}
              change={32.5}
              changePercent={1.03}
              color="hsl(var(--chart-1))"
            />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </div>

        <div>
          <EventImpactList />
        </div>
      </div>
    </div>
  )
}
