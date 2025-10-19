import { NextRequest, NextResponse } from "next/server";

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

interface MarketData {
  time: string;
  value: number; // percent change
}

export async function GET(req: Request) {
  try {
    const urlParams = new URL(req.url).searchParams;
    const type = urlParams.get("type") || "gainers"; // gainers | losers | active
    const limit = parseInt(urlParams.get("limit") || "10", 10);
    const timeframe = urlParams.get("timeframe") || "1D"; // 1D, 1W, 1M

    const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_KEY}`;
    const res = await fetch(url, { headers: { "User-Agent": "nextjs-app" } });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Alpha Vantage returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    const key =
      type === "losers"
        ? "top_losers"
        : type === "active"
        ? "most_actively_traded"
        : "top_gainers";

    const list = data[key] || [];

    // 🧠 Simulated timeframe filtering:
    // Alpha Vantage only gives current snapshot data,
    // so we can optionally label based on timeframe
    const filtered = list.slice(0, limit).map((item: any) => ({
      symbol: item.ticker,
      price: parseFloat(item.price),
      changePercent: parseFloat(item.change_percentage),
      volume: parseInt(item.volume, 10),
      timeframe,
    }));

    return NextResponse.json({
      success: true,
      count: filtered.length,
      timeframe,
      data: filtered,
    });
  } catch (err) {
    console.error("Error fetching top gainers:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
