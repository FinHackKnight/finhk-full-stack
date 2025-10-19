export interface MarketData {
  time: string;
  value: number;
}

export interface MockStock {
  ticker: string;
  chartData: MarketData[];
  change: number;
  changePercent: number;
}

const timeframeVolatilityMap = {
  "1D": 4, // smallest fluctuations
  "1W": 6, // bigger fluctuations
  "1M": 10, // even bigger
  "3M": 12, // largest fluctuations
};

// Generate random stock tickers (2-4 letters)
function generateTicker(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const length = Math.floor(Math.random() * 3) + 2; // 2 to 4 letters
  let ticker = "";
  for (let i = 0; i < length; i++) {
    ticker += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return ticker;
}

// Generate chart points
export function generateMockChartData(
  base: number = 100,
  volatility: number = 5,
  points: number = 24
): MarketData[] {
  const data: MarketData[] = [];
  let value = base;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * volatility;
    data.push({
      time: `${i}:00`,
      value: parseFloat(value.toFixed(2)),
    });
  }
  return data;
}

export function generateMockStocks(
  count: number = 9,
  timeframe: "1D" | "1W" | "1M" | "3M" = "1D"
): MockStock[] {
  const pointsMap = { "1D": 24, "1W": 7, "1M": 30, "3M": 90 };
  const stocks: MockStock[] = [];

  const volatility = timeframeVolatilityMap[timeframe]; // scale volatility

  for (let i = 0; i < count; i++) {
    const ticker = generateTicker();
    const changePercent = parseFloat(((Math.random() - 0.5) * 10).toFixed(2));
    stocks.push({
      ticker,
      chartData: generateMockChartData(
        100 + i * 10,
        volatility,
        pointsMap[timeframe]
      ),
      change: changePercent,
      changePercent: changePercent,
    });
  }
  return stocks;
}
