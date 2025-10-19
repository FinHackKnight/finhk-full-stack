"use client";

import { useState, useEffect } from "react";
import { MarketChart, MarketData } from "@/components/market-chart";
import { MarketIndicators } from "@/components/market-indicators";
import { EventImpactList } from "@/components/event-impact-list";
import { EventCard } from "@/components/event-card";
import { mockEventsWithMarkets } from "@/lib/mock-data";
import type { EventWithMarkets } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateMockStocks } from "@/lib/stock-data";
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
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Stock {
  ticker: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  volume: number;
  chartData?: MarketData[];
}
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
  const [activeType, setActiveType] = useState<"gainers" | "losers" | "active">(
    "gainers"
  );
  const [stocks, setStocks] = useState(generateMockStocks(9));
  //const [data, setData] = useState<MarketData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventWithMarkets | null>(
    null
  );
  const [activeTimeframe, setActiveTimeframe] = useState<
    "1D" | "1W" | "1M" | "3M"
  >("1D");
  const [searchSymbol, setSearchSymbol] = useState<string>("");

  // Simple refresh using mocks for the selected timeframe
  const refreshStocks = () => {
    setStocks(generateMockStocks(9, activeTimeframe));
  };

  // Get recent events (last 10)
  const recentEvents = mockEventsWithMarkets.slice(0, 10);

  const handleEventClick = (event: EventWithMarkets) => {
    setSelectedEvent(event);
  };

  function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`; // random hue, 70% saturation, 50% lightness
  }

  const hoveredEvent = hoveredEventId
    ? recentEvents.find((e) => e.id === hoveredEventId) || null
    : null;

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <button
        onClick={refreshStocks}
        className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
      >
        Refresh Data
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

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks (e.g., AAPL, NVDA, TSLA)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchSymbol.trim()) {
                  }
                }}
                className="pl-9 w-64 bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all"
              />
            </div>
            <Button
              onClick={() => searchSymbol.trim()}
              disabled={!searchSymbol.trim()}
              className="shrink-0"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8 space-y-8">
        {/* Market Performance Section */}
        <div className="space-y-4">
          {/* Header with filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Top Stocks
              </h2>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              {/* Type buttons */}
              <div className="flex gap-2">
                {(["gainers", "losers", "active"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-3 py-1.5 text-sm rounded-md capitalize ${
                      activeType === type
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Timeframe buttons */}
              <div className="flex gap-2 mt-2 md:mt-0">
                {(["1D", "1W", "1M", "3M"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setActiveTimeframe(tf); // update state
                      setStocks(generateMockStocks(9, tf)); // regenerate mock stocks
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      activeTimeframe === tf
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Data grid */}
          {stocks && stocks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((s, i) => (
                <MarketChart
                  key={`${s.ticker}-${i}`}
                  title={s.ticker}
                  data={s.chartData || []}
                  change={s.change}
                  changePercent={s.changePercent}
                  color={getRandomColor()}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Loading top stocks...
            </p>
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onStockClick={onStockClick}
        />
      )}
    </div>
  );
}
