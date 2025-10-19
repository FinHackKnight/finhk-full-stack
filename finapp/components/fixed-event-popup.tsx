"use client";

import type { EventWithMarkets } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, MapPin } from "lucide-react";

interface FixedEventPopupProps {
  event: EventWithMarkets | null;
}

// Helper to get country name from code
const getCountryName = (code: string): string => {
  const countryNames: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'FR': 'France',
    'DE': 'Germany',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'KR': 'South Korea',
    'AU': 'Australia',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'SG': 'Singapore',
    'HK': 'Hong Kong',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'NO': 'Norway',
  };
  return countryNames[code.toUpperCase()] || code || 'Unknown';
};

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

  const countryDisplay = getCountryName(event.location.country);

  return (
    <div
      className={`w-80 rounded-lg border bg-card/90 backdrop-blur-sm shadow-2xl pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200 ${
        impactColors[event.impactLevel]
      }`}
      style={{
        position: "fixed",
        top: "8rem",
        right: "2rem",
        bottom: '32rem',
        zIndex: 99999,
      }}
    >
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight text-foreground">
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
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{countryDisplay}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium font-bold text-muted-foreground uppercase tracking-wide">
            Affected Markets
          </p>
          <div className="space-y-1.5">
            {event.affectedMarkets.map((market, index) => (
              <div
                key={`${market.symbol}-${index}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono font-medium text-foreground">
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
