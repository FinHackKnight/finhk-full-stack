"use client"

import { Globe, TrendingUp, LayoutDashboard, Moon, Sun, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

type ViewType = "map" | "market" | "dashboard"

interface NavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="sticky top-0 z-50">
      {/* Main Navigation */}
      <nav className={`h-20 border-b shadow-2xl ${
        isDark 
          ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700/50" 
          : "bg-gradient-to-r from-white via-slate-50 to-white border-slate-200/50"
      }`}>
        <div className="flex items-center justify-between px-8 h-full">
          {/* Left Section - Brand & Navigation */}
          <div className="flex items-center gap-12">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-clip-text text-transparent ${
                  isDark 
                    ? "bg-gradient-to-r from-white to-slate-300" 
                    : "bg-gradient-to-r from-slate-900 to-slate-600"
                }`}>
                  Global Insight
                </h1>
                <p className={`text-xs -mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>Financial Intelligence Platform</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex items-center gap-1 rounded-xl p-1 backdrop-blur-sm ${
              isDark ? "bg-slate-800/50" : "bg-slate-100/80"
            }`}>
              <Button
                variant={currentView === "map" ? "default" : "ghost"}
                size="lg"
                onClick={() => onViewChange("map")}
                className={`gap-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                  currentView === "map" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25" 
                    : isDark 
                      ? "text-slate-300 hover:text-white hover:bg-slate-700/50" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                }`}
              >
                <Globe className="w-5 h-5" />
                Map View
              </Button>
              <Button
                variant={currentView === "market" ? "default" : "ghost"}
                size="lg"
                onClick={() => onViewChange("market")}
                className={`gap-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                  currentView === "market" 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25" 
                    : isDark 
                      ? "text-slate-300 hover:text-white hover:bg-slate-700/50" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Market View
              </Button>
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                size="lg"
                onClick={() => onViewChange("dashboard")}
                className={`gap-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                  currentView === "dashboard" 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                    : isDark 
                      ? "text-slate-300 hover:text-white hover:bg-slate-700/50" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Button>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`relative w-12 h-12 rounded-xl transition-all duration-300 ${
                isDark 
                  ? "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white" 
                  : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className={`w-12 h-12 rounded-xl transition-all duration-300 ${
                isDark 
                  ? "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white" 
                  : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900"
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* User Profile */}
            <Button 
              variant="ghost" 
              size="icon"
              className={`w-12 h-12 rounded-xl transition-all duration-300 shadow-lg ${
                isDark 
                  ? "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white" 
                  : "bg-gradient-to-br from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-700"
              }`}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

    </div>
  )
}
