"use client";

import { useState } from "react";
import { MarketChart } from "@/components/market-chart";
import { MarketIndicators } from "@/components/market-indicators";
import { EventImpactList } from "@/components/event-impact-list";
import { Globe3D } from "@/components/globe-3d";
import { EventCard } from "@/components/event-card";
import { mockEventsWithMarkets } from "@/lib/mock-data";
import type { EventWithMarkets } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

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

export function MarketView() {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventWithMarkets | null>(
    null
  );

  // Get recent events (last 10)
  const recentEvents = mockEventsWithMarkets.slice(0, 10);

  const handleEventClick = (event: EventWithMarkets) => {
    setSelectedEvent(event);
  };

  const hoveredEvent = hoveredEventId
    ? recentEvents.find((e) => e.id === hoveredEventId) || null
    : null;

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Market Overview</h2>
          <p className="text-sm text-muted-foreground">
            Real-time market data and event-driven insights
          </p>
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

        {/* Global Events Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <h3 className="text-lg font-semibold mb-4">
                Global Events Impact Map
              </h3>
              <div className="h-[400px] rounded-lg overflow-hidden">
                <Globe3D
                  events={recentEvents}
                  hoveredEventId={hoveredEventId}
                  onEventHover={setHoveredEventId}
                  onEventClick={handleEventClick}
                />
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border h-[468px]">
              <h3 className="text-sm font-semibold mb-4">
                Recent Global Events
              </h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onHover={setHoveredEventId}
                      onClick={handleEventClick}
                    />
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
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
  );
}
