"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketData } from "@/components/market-chart";

interface SimpleChartProps {
  symbol: string;
  stockData?: {
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
    volume?: number; // Made optional
    marketCap?: number; // Made optional
    pe?: number; // Made optional
  } | null;
  activeTimeframe: "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y";
  setActiveTimeframe: any;
}

type DateRange = "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y";

// Tooltip component for financial terms
const FinancialTooltip = ({
  term,
  description,
  children,
}: {
  term: string;
  description: string;
  children: React.ReactNode;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <span
        className="cursor-help border-b border-dotted border-slate-400 dark:border-slate-500"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg shadow-lg z-50 min-w-64 max-w-96">
          <div className="flex flex-col space-y-1">
            <div className="font-semibold text-center">{term}</div>
            <div className="text-xs opacity-90 text-center leading-relaxed">
              {description}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
        </div>
      )}
    </div>
  );
};

export function SimpleChart({
  symbol,
  stockData,
  activeTimeframe,
  setActiveTimeframe,
}: SimpleChartProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>("1D");
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real data when timeframe changes
  useEffect(() => {
    if (symbol) {
      //handleFetch(symbol, selectedRange);
    }
  }, [symbol, selectedRange]);

  if (!stockData) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20">
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    );
  }

  // Use real data if available, otherwise fall back to mock data
  const chartData = data.length > 0 ? data : generateMockData();
  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const priceRange = maxPrice - minPrice;

  // Generate simple mock data for visualization based on date range
  function generateMockData(): MarketData[] {
    const data = [];
    const basePrice = stockData.previousClose;
    const currentPrice = stockData.price;
    const priceRange = stockData.high - stockData.low;

    // Determine number of data points based on selected range
    let dataPoints = 20;
    let timeFormat = "HH:mm";

    switch (selectedRange) {
      case "1D":
        dataPoints = 24; // Hourly data for 1 day
        timeFormat = "HH:mm";
        break;
      case "5D":
        dataPoints = 5; // Daily data for 5 days
        timeFormat = "MM/DD";
        break;
      case "1M":
        dataPoints = 30; // Daily data for 1 month
        timeFormat = "MM/DD";
        break;
      case "6M":
        dataPoints = 26; // Weekly data for 6 months
        timeFormat = "MM/DD";
        break;
      case "1Y":
        dataPoints = 12; // Monthly data for 1 year
        timeFormat = "MM/YY";
        break;
      case "5Y":
        dataPoints = 20; // Quarterly data for 5 years
        timeFormat = "MM/YY";
        break;
    }

    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1);
      const volatility = (Math.random() - 0.5) * 0.01;
      const trend = ((currentPrice - basePrice) / basePrice) * progress;
      const price = basePrice * (1 + trend + volatility);

      // Generate time labels based on range
      let timeLabel = "";
      if (selectedRange === "1D") {
        timeLabel = `${i.toString().padStart(2, "0")}:00`;
      } else if (selectedRange === "5D") {
        const date = new Date();
        date.setDate(date.getDate() - (dataPoints - 1 - i));
        timeLabel = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
          .getDate()
          .toString()
          .padStart(2, "0")}`;
      } else {
        const date = new Date();
        date.setMonth(date.getMonth() - (dataPoints - 1 - i));
        timeLabel = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
          .getFullYear()
          .toString()
          .slice(-2)}`;
      }

      data.push({
        time: timeLabel,
        price: Math.max(stockData.low, Math.min(stockData.high, price)),
      });
    }

    return data;
  }

  const dateRanges: DateRange[] = ["1D", "5D", "1M", "6M", "1Y", "5Y"];

  /*
  async function handleFetch(
    symbol: string,
    timeframe: "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y"
  ) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/stocks/quote?symbol=${symbol}&interval=${timeframe}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const fetchedData = await res.json();
      setData(fetchedData);
    } catch (err) {
      console.error("Fetch error:", err);
      // Keep using mock data on error
      setData([]);
    } finally {
      setLoading(false);
    }
  }
*/

  // Financial term descriptions
  const financialTerms = {
    "Previous Close":
      "The closing price of the stock from the previous trading day",
    Open: "The price at which the stock opened for trading today",
    Bid: "The highest price a buyer is willing to pay for the stock",
    Ask: "The lowest price a seller is willing to accept for the stock",
    "Day's Range": "The highest and lowest prices the stock traded at today",
    "52W Range":
      "The highest and lowest prices the stock traded at over the past 52 weeks",
    Volume: "The number of shares traded today",
    "Avg. Volume":
      "The average number of shares traded per day over the past 3 months",
    "Market Cap":
      "The total value of all company shares (price × shares outstanding)",
    Beta: "Measures how much the stock price moves relative to the overall market",
    "PE Ratio":
      "Price-to-Earnings ratio - stock price divided by earnings per share",
    EPS: "Earnings Per Share - company's profit divided by number of shares",
    Earnings: "The date of the next earnings report",
    Dividend: "Regular payments made to shareholders from company profits",
    "Ex-Div":
      "Ex-Dividend date - last day to buy stock and still receive dividend",
    "1y Target": "Analyst's average price target for the stock in one year",
  };

  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 hover:border-slate-500/40 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
          {symbol} Price Chart
        </h3>
        <div className="flex items-center gap-2">
          {stockData.changePercent > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span
            className={`text-sm font-semibold ${
              stockData.changePercent > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {stockData.changePercent > 0 ? "+" : ""}
            {stockData.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap gap-1 mb-4">
        {dateRanges.map((range) => (
          <Button
            key={range}
            variant={selectedRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedRange(range);
              setActiveTimeframe(range);
            }}
            disabled={loading}
            className={`text-xs px-2 py-1 h-7 ${
              selectedRange === range
                ? "bg-primary text-primary-foreground"
                : "bg-transparent hover:bg-muted/50"
            }`}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Simple Chart */}
      <div className="relative h-48 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 cursor-pointer">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid Lines */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Price Line */}
          <polyline
            fill="none"
            stroke={stockData.changePercent > 0 ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            points={chartData
              .map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = 100 - ((point.price - minPrice) / priceRange) * 100;
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Data Points */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - ((point.price - minPrice) / priceRange) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={stockData.changePercent > 0 ? "#10b981" : "#ef4444"}
                opacity="0.8"
              />
            );
          })}
        </svg>

        {/* Price Labels */}
        <div className="absolute top-2 left-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          ${maxPrice.toFixed(2)}
        </div>
        <div className="absolute bottom-2 left-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          ${minPrice.toFixed(2)}
        </div>

        {/* Current Price */}
        <div className="absolute top-2 right-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          ${stockData.price.toFixed(2)}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        )}
      </div>

      {/* Time Labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {selectedRange === "1D" ? (
          <>
            <span>9:00</span>
            <span>12:00</span>
            <span>15:00</span>
            <span>18:00</span>
          </>
        ) : selectedRange === "5D" ? (
          <>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
          </>
        ) : (
          <>
            <span>Start</span>
            <span>Mid</span>
            <span>End</span>
          </>
        )}
      </div>

      {/* Detailed Table - Always Show */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 shadow-lg">
        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
          Detailed Financial Data
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Previous Close"
                description={financialTerms["Previous Close"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Previous Close:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ${stockData.previousClose.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Open"
                description={financialTerms["Open"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Open:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ${stockData.open.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip term="Bid" description={financialTerms["Bid"]}>
                <span className="text-slate-600 dark:text-slate-400">Bid:</span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ${(stockData.price - 0.1).toFixed(2)} x 500
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip term="Ask" description={financialTerms["Ask"]}>
                <span className="text-slate-600 dark:text-slate-400">Ask:</span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ${(stockData.price + 0.1).toFixed(2)} x 1000
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Day's Range"
                description={financialTerms["Day's Range"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Day's Range:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ${stockData.low.toFixed(2)} - ${stockData.high.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="52W Range"
                description={financialTerms["52W Range"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  52W Range:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ${(stockData.low * 0.3).toFixed(2)} - $
                {(stockData.high * 1.1).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Volume"
                description={financialTerms["Volume"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Volume:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {stockData.volume?.toLocaleString() || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <FinancialTooltip
                term="Avg. Volume"
                description={financialTerms["Avg. Volume"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Avg. Volume:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {stockData.volume
                  ? (stockData.volume * 0.6).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Market Cap"
                description={financialTerms["Market Cap"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Market Cap:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {stockData.marketCap
                  ? `$${(stockData.marketCap / 1_000_000_000).toFixed(2)}B`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Beta"
                description={financialTerms["Beta"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Beta:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                2.25
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="PE Ratio"
                description={financialTerms["PE Ratio"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  PE Ratio:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {stockData.pe?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip term="EPS" description={financialTerms["EPS"]}>
                <span className="text-slate-600 dark:text-slate-400">EPS:</span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {stockData.pe
                  ? (stockData.price / stockData.pe).toFixed(2)
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Earnings"
                description={financialTerms["Earnings"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Earnings:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Nov 3, 2025
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Dividend"
                description={financialTerms["Dividend"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Dividend:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                --
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-500/20">
              <FinancialTooltip
                term="Ex-Div"
                description={financialTerms["Ex-Div"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  Ex-Div:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                --
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <FinancialTooltip
                term="1y Target"
                description={financialTerms["1y Target"]}
              >
                <span className="text-slate-600 dark:text-slate-400">
                  1y Target:
                </span>
              </FinancialTooltip>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ${(stockData.price * 0.8).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
          <div className="text-xs text-muted-foreground">Day High</div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            ${stockData.high.toFixed(2)}
          </div>
        </div>
        <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
          <div className="text-xs text-muted-foreground">Day Low</div>
          <div className="text-sm font-semibold text-red-600 dark:text-red-400">
            ${stockData.low.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
