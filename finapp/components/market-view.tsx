"use client"

import { MarketChart } from "@/components/market-chart"
import { MarketIndicators } from "@/components/market-indicators"
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

const sp500Data = generateData(4500, 20)
const nasdaqData = generateData(14200, 50)
const dowData = generateData(35000, 100)

export function MarketView() {
  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Market Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time market data and event-driven insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MarketChart
            title="S&P 500"
            data={sp500Data}
            change={45.23}
            changePercent={1.02}
            color="hsl(var(--chart-1))"
          />
          <MarketChart
            title="NASDAQ"
            data={nasdaqData}
            change={-28.45}
            changePercent={-0.2}
            color="hsl(var(--chart-2))"
          />
          <MarketChart
            title="DOW JONES"
            data={dowData}
            change={120.5}
            changePercent={0.35}
            color="hsl(var(--chart-3))"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EventImpactList />
          </div>
          <div>
            <MarketIndicators />
          </div>
        </div>
      </div>
    </div>
  )
}
