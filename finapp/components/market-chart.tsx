"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface MarketData {
  time: string;
  value: number;
}

interface MarketChartProps {
  title: string;
  data: MarketData[];
  change: number;
  changePercent: number;
  color: string;
}

export function MarketChart({
  title,
  data,
  change,
  changePercent,
  color,
}: MarketChartProps) {
  const isPositive = change >= 0;

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {title}
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-semibold">
                {data[data.length - 1].value.toFixed(2)}
              </span>
              <div
                className={`flex items-center gap-1 text-sm ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)} ({changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id={`gradient-${title.replace(/\W+/g, "-").toLowerCase()}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`url(#gradient-${title
                  .replace(/\W+/g, "-")
                  .toLowerCase()})`}
                strokeWidth={2}
                baseValue="dataMin"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
