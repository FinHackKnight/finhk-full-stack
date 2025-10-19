"use client"

import type { EventWithMarkets } from "@/lib/mock-data"
import { TrendingUp, TrendingDown } from "lucide-react"

interface EventPopupProps {
  event: EventWithMarkets
  className?: string
}

export function EventPopup({ event, className = "" }: EventPopupProps) {
  const impactColors = {
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    high: "bg-rose-500/20 text-rose-400 border-rose-500/50",
  }

  const impactBadgeColors = {
    low: "bg-emerald-500 text-emerald-950",
    medium: "bg-amber-500 text-amber-950",
    high: "bg-rose-500 text-rose-950",
  }

  return (
    <div
      className={`w-72 rounded-lg border bg-card/95 backdrop-blur-sm shadow-2xl pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200 ${impactColors[event.impactLevel]} ${className}`}
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        left: "auto",
        bottom: "auto",
        zIndex: 99999,
      }}
    >
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight">{event.title}</h3>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium uppercase shrink-0 ${impactBadgeColors[event.impactLevel]}`}
            >
              {event.impactLevel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{event.location.country}</p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Affected Markets</p>
          <div className="space-y-1">
            {event.affectedMarkets.map((market) => (
              <div key={market.symbol} className="flex items-center justify-between text-xs">
                <span className="font-mono">{market.symbol}</span>
                <div className="flex items-center gap-1">
                  {market.changePercent > 0 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  )}
                  <span
                    className={`font-mono font-medium ${market.changePercent > 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {market.changePercent > 0 ? "+" : ""}
                    {market.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
