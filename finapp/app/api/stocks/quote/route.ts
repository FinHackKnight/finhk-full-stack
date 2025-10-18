// app/api/stocks/route.ts
import { NextResponse } from "next/server";

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

interface MarketData {
  time: string;
  value: number; // percent change
}

export async function GET(req: Request) {
  try {
    const urlParams = new URL(req.url).searchParams;
    const symbol = urlParams.get("symbol");
    const interval = urlParams.get("interval") || "daily"; // "daily" or "weekly"

    console.log("Fetching symbol:", symbol, "interval:", interval);

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }
    let data: any;

    // Determine Alpha Vantage function
    const func =
      interval === "weekly" ? "TIME_SERIES_WEEKLY" : "TIME_SERIES_DAILY";
    const alphaUrl = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;

    console.log("Alpha Vantage URL:", alphaUrl);
    try {
      const res = await fetch(alphaUrl);
      const text = await res.text();
      console.log("Raw response:", text);

      // Try parsing JSON safely

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Alpha Vantage returned invalid response:", text);
        return NextResponse.json(
          { error: "Alpha Vantage returned invalid response" },
          { status: 500 }
        );
      }
    } catch (e) {
      console.log(e);
    }

    // Check for API limit or error
    if (data["Note"] || data["Error Message"]) {
      console.error(
        "Alpha Vantage API message:",
        data["Note"] || data["Error Message"]
      );
      return NextResponse.json(
        { error: data["Note"] || data["Error Message"] },
        { status: 429 }
      );
    }

    const timeSeriesKey =
      interval === "weekly" ? "Weekly Time Series" : "Time Series (Daily)";
    const series = data[timeSeriesKey];

    if (!series) {
      return NextResponse.json(
        { error: "No data found for this symbol" },
        { status: 404 }
      );
    }

    // Convert to array sorted by date ascending
    const entries = Object.entries(series)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7);

    const firstClose = parseFloat(entries[0][1]["4. close"]);

    const chartData: MarketData[] = entries.map(([time, val]) => {
      const v = val as Record<string, string>;
      return {
        time,
        value: parseFloat(v["4. close"]), // Return actual price, not percentage
      };
    });

    return NextResponse.json(chartData);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
