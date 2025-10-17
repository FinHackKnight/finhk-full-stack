"use client"

import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface Indicator {
  name: string
  value: string
  change: number
  trend: "up" | "down" | "neutral"
}

const INDICATORS: Indicator[] = [
  { name: "VIX", value: "18.42", change: -2.3, trend: "down" },
  { name: "Gold", value: "$2,045", change: 1.2, trend: "up" },
  { name: "Oil (WTI)", value: "$78.32", change: 0.8, trend: "up" },
  { name: "USD Index", value: "103.45", change: -0.4, trend: "down" },
  { name: "Bitcoin", value: "$43,210", change: 3.5, trend: "up" },
  { name: "10Y Treasury", value: "4.23%", change: 0.0, trend: "neutral" },
]

export function MarketIndicators() {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
      <h3 className="text-sm font-semibold mb-4">Market Indicators</h3>
      <div className="grid grid-cols-2 gap-3">
        {INDICATORS.map((indicator) => (
          <div key={indicator.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <div>
              <div className="text-xs text-muted-foreground">{indicator.name}</div>
              <div className="text-sm font-semibold mt-0.5">{indicator.value}</div>
            </div>
            <div
              className={`flex items-center gap-1 text-xs ${
                indicator.trend === "up"
                  ? "text-green-500"
                  : indicator.trend === "down"
                    ? "text-red-500"
                    : "text-muted-foreground"
              }`}
            >
              {indicator.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
              {indicator.trend === "down" && <ArrowDownRight className="w-3 h-3" />}
              {indicator.trend === "neutral" && <Minus className="w-3 h-3" />}
              <span>
                {indicator.change > 0 ? "+" : ""}
                {indicator.change.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
