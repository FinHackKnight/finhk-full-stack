"use client";

import type { EventWithMarkets } from "@/lib/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FixedEventPopupProps {
  event: EventWithMarkets | null;
}

export function FixedEventPopup({ event }: FixedEventPopupProps) {
  if (!event) return null;

  const impactColors = {
    low: "bg-amber-500/20 text-emerald-400 border-emerald-500/50",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    high: "bg-amber-500/20 text-rose-400 border-rose-500/50",
  };

  const impactBadgeColors = {
    low: "bg-emerald-500 text-emerald-950",
    medium: "bg-amber-500 text-amber-950",
    high: "bg-rose-500 text-rose-950",
  };

  return (
    <div
      className={`w-80 rounded-lg border bg-card/90 backdrop-blur-sm shadow-2xl pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200 ${
        impactColors[event.impactLevel]
      }`}
      style={{
        position: "fixed",
        top: "8rem",
        left: "25rem",
        zIndex: 99999,
      }}
    >
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight">
              {event.title}
            </h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium uppercase shrink-0 ${
                impactBadgeColors[event.impactLevel]
              }`}
            >
              {event.impactLevel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {event.location.country}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium font-bold text-muted-foreground uppercase tracking-wide">
            Affected Markets
          </p>
          <div className="space-y-1.5">
            {event.affectedMarkets.map((market) => (
              <div
                key={market.symbol}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono font-medium text-white">
                  {market.symbol}
                </span>
                <div className="flex items-center gap-1.5">
                  {market.changePercent > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  )}
                  <span
                    className={`font-mono font-semibold ${
                      market.changePercent > 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
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
  );
}
