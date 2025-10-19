"use client";

import {
  Globe,
  TrendingUp,
  LayoutDashboard,
  Newspaper,
  BookOpen,
  Moon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type ViewType = "map" | "market" | "news" | "tutorials";

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Global Insight
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={currentView === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("map")}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            Map View
          </Button>
          <Button
            variant={currentView === "market" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("market")}
            className="gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Market View
          </Button>
          <Button
            variant={currentView === "news" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("news")}
            className="gap-2"
          >
            <Newspaper className="w-4 h-4" />
            News
          </Button>
          <Button
            variant={currentView === "tutorials" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("tutorials")}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Tutorials
          </Button>
        </div>
      </div>

      <ThemeToggle />
    </nav>
  );
}
