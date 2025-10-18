"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { NewsTicker } from "@/components/news-ticker"
import { MapView } from "@/components/map-view"
import { MarketView } from "@/components/market-view"
import { DashboardView } from "@/components/dashboard-view"

type ViewType = "map" | "market" | "news"

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("news")

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <NewsTicker />

      <main className="flex-1 overflow-hidden">
        {currentView === "map" && <MapView />}
        {currentView === "market" && <MarketView />}
        {currentView === "news" && <DashboardView />}
      </main>
    </div>
  )
}
