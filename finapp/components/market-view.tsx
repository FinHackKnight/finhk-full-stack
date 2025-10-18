"use client";

import { useState, useEffect } from "react";
import { MarketChart, MarketData } from "@/components/market-chart";
import { MarketIndicators } from "@/components/market-indicators";
import { EventImpactList } from "@/components/event-impact-list";
import { EventCard } from "@/components/event-card";
import { mockEventsWithMarkets } from "@/lib/mock-data";
import type { EventWithMarkets } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Zap,
  AlertTriangle,
  DollarSign,
  BarChart3,
} from "lucide-react";

// Generate sample data
const generateData = (base: number, volatility: number, points = 24) => {
  const data = [];
  let value = base;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * volatility;
    data.push({
      time: `${i}:00`,
      value: value,
    });
  }
  return data;
};

const sp500Data = generateData(4500, 20).map((d) => ({
  time: d.time,
  value: ((d.value - 4500) / 4500) * 100, // percent change
}));
const nasdaqData = generateData(14200, 50);
const dowData = generateData(35000, 100);

// Market sentiment data
const marketSentiment = {
  overall: "Bullish",
  score: 72,
  change: 5.2,
  fearGreed: 68,
};

// Sector performance data
const sectorPerformance = [
  { name: "Technology", change: 2.3, color: "text-blue-500" },
  { name: "Healthcare", change: 1.8, color: "text-green-500" },
  { name: "Finance", change: -0.5, color: "text-red-500" },
  { name: "Energy", change: 3.2, color: "text-orange-500" },
  { name: "Consumer", change: 0.9, color: "text-purple-500" },
  { name: "Industrial", change: 1.4, color: "text-cyan-500" },
];

export function MarketView() {
  const [data, setData] = useState<MarketData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventWithMarkets | null>(
    null
  );
  const [activeTimeframe, setActiveTimeframe] = useState<
    "1D" | "1W" | "1M" | "3M"
  >("1D");

  async function handleFetch(
    symbol: string,
    timeframe: "1D" | "1W" | "1M" | "3M"
  ) {
    try {
      const res = await fetch(
        `/api/stocks/quote?symbol=${symbol}&interval=${timeframe}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    }
  }

  // Get recent events (last 10)
  const recentEvents = mockEventsWithMarkets.slice(0, 10);

  const handleEventClick = (event: EventWithMarkets) => {
    setSelectedEvent(event);
  };

  const hoveredEvent = hoveredEventId
    ? recentEvents.find((e) => e.id === hoveredEventId) || null
    : null;

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <button
        onClick={() => handleFetch("NVDA", activeTimeframe)}
        className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
      >
        Fetch Data
      </button>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <Activity className="w-4 h-4" />
              Live Market Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              Market Analysis Hub
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Real-time market data, sector performance, and global events
              impact analysis
            </p>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8 space-y-8">
        {/* Market Performance Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Market Performance
              </h2>
            </div>
            <div className="flex gap-2">
              {(["1D", "1W", "1M", "3M"] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setActiveTimeframe(timeframe)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeTimeframe === timeframe
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>

          {data && data.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <MarketChart
                title="NVIDIA"
                data={data}
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
          )}
        </div>

        {/* Sector Analysis Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Sector Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Sector Performance
                </h3>
              </div>
              <div className="space-y-3">
                {sectorPerformance.map((sector) => (
                  <div
                    key={sector.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {sector.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${sector.color}`}>
                        {sector.change > 0 ? "+" : ""}
                        {sector.change}%
                      </span>
                      {sector.change > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Market Indicators
                </h3>
              </div>
              <MarketIndicators />
            </div>
          </div>
        </div>

        {/* Market Impact Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Market Impact Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Events Impact */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  High-Impact Events
                </h3>
              </div>
              <EventImpactList />
            </div>

            {/* Market Stats */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Market Statistics
                </h3>
              </div>
              <div className="space-y-4">
                <div className="text-center p-6 rounded-xl bg-green-500/10 dark:bg-green-500/5 border border-green-500/20">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    +2.3%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Market Gain Today
                  </div>
                </div>
                <div className="text-center p-6 rounded-xl bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    12
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Active Events
                  </div>
                </div>
                <div className="text-center p-6 rounded-xl bg-orange-500/10 dark:bg-orange-500/5 border border-orange-500/20">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    3
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    High Impact Alerts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
