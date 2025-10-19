"use client"

import type { EventWithMarkets } from "@/lib/mock-data"
import { Calendar, MapPin } from "lucide-react"

interface EventCardProps {
  event: EventWithMarkets
  onHover?: (eventId: string | null) => void
  onClick?: (event: EventWithMarkets) => void
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

export function EventCard({ event, onHover, onClick }: EventCardProps) {
  const impactColors = {
    low: "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20",
    medium: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20",
    high: "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20",
  }

  const handleMouseEnter = () => {
    onHover?.(event.id)
  }

  const handleMouseLeave = () => {
    onHover?.(null)
  }

  const handleClick = () => {
    onClick?.(event)
  }

  const countryDisplay = getCountryName(event.location.country);

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${impactColors[event.impactLevel]}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="space-y-2">
        <h3 className="font-medium text-sm leading-tight line-clamp-2">{event.title}</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className="font-mono">{event.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{countryDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
