"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { NewsTicker } from "@/components/news-ticker";
import { MapView } from "@/components/map-view";
import { MarketView } from "@/components/market-view";
import { DashboardView } from "@/components/dashboard-view";

type ViewType = "map" | "market" | "news";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("map");
  const router = useRouter();

  const handleStockClick = (stock: {
    symbol: string;
    name: string;
    changePercent: number;
  }) => {
    // Navigate to the full-screen stock profile page
    router.push(`/stock/${stock.symbol}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <NewsTicker />

      <main className="flex-1 overflow-hidden">
        {currentView === "map" && <MapView onStockClick={handleStockClick} />}
        {currentView === "market" && (
          <MarketView onStockClick={handleStockClick} />
        )}
        {currentView === "dashboard" && (
          <DashboardView onStockClick={handleStockClick} />
        )}
      </main>
    </div>
  );
}
