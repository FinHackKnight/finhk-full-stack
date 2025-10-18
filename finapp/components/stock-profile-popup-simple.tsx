"use client"

import React, { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StockProfilePopupProps {
  stock: {
    symbol: string
    name: string
    changePercent: number
  }
  isOpen: boolean
  onClose: () => void
}

export function StockProfilePopup({ stock, isOpen, onClose }: StockProfilePopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Panel */}
      <div className="w-full max-w-2xl bg-background border-l border-border shadow-2xl">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-mono font-semibold text-primary">
                  {stock.symbol.slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{stock.name}</h2>
                <p className="text-sm text-muted-foreground font-mono">{stock.symbol}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-4">Stock Profile</h3>
              <p className="text-muted-foreground">
                Stock profile for {stock.name} ({stock.symbol})
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Change: {stock.changePercent > 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
