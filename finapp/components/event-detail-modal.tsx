"use client"

import { X, TrendingUp, TrendingDown } from "lucide-react"
import type { EventWithMarkets } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"

interface EventDetailModalProps {
  event: EventWithMarkets
  onClose: () => void
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const impactColor =
    event.impactLevel === "high"
      ? "text-rose-400"
      : event.impactLevel === "medium"
        ? "text-amber-400"
        : "text-emerald-400"

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 animate-in fade-in-0 slide-in-from-left-5 duration-300">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
          <h2 className="text-lg font-semibold">Event Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted/50">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Headline */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{event.location.country}</span>
                <span>•</span>
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Event Picture Placeholder */}
            <div className="aspect-video rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">🌍</div>
                <p className="text-sm">Event Image</p>
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Event Description</h4>
              <p className="text-sm leading-relaxed text-foreground/90">{event.detailedDescription}</p>
            </div>

            {/* Impact Scale */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Impact Level</h4>
              <div className="flex items-center gap-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-8 flex-1 rounded transition-all ${
                      i < event.impact
                        ? event.impact >= 8
                          ? "bg-rose-500"
                          : event.impact >= 5
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        : "bg-muted/30 border border-border/50"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Low Impact</span>
                <span className={`font-semibold ${impactColor}`}>{event.impact}/10</span>
                <span>High Impact</span>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Impact Analysis</h4>
              <div className="rounded-lg bg-muted/20 border border-border/50 p-4">
                <p className="text-sm leading-relaxed text-foreground/90">{event.impactReason}</p>
              </div>
            </div>

            {/* Most Relevant Stocks */}
            <div className="space-y-3 pb-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Most Relevant Stocks
              </h4>
              <div className="space-y-2">
                {event.relevantStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono font-semibold text-primary">{stock.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{stock.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{stock.symbol}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {stock.changePercent > 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      )}
                      <span
                        className={`font-mono font-semibold text-sm ${stock.changePercent > 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {stock.changePercent > 0 ? "+" : ""}
                        {stock.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
