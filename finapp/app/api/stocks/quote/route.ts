// app/api/stocks/route.ts
import { NextResponse } from "next/server";

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

interface MarketData {
  time: string;
  price: number; // Changed from 'value' to 'price' to match component expectations
}

export async function GET(req: Request) {
  try {
    const urlParams = new URL(req.url).searchParams;
    const symbol = urlParams.get("symbol");
    const interval = urlParams.get("interval") || "1D";

    console.log("Fetching symbol:", symbol, "interval:", interval);

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    let data: any;
    let func = "TIME_SERIES_DAILY";
    let sliceCount = 7;

    // Fixed timeframe mapping
    switch (interval) {
      case "1D":
        func = "TIME_SERIES_INTRADAY";
        sliceCount = 24; // Hourly data for 1 day
        break;
      case "5D":
        func = "TIME_SERIES_DAILY";
        sliceCount = 7;
        break;
      case "1M":
        func = "TIME_SERIES_DAILY";
        sliceCount = 30;
        break;
      case "6M":
        func = "TIME_SERIES_WEEKLY";
        sliceCount = 26;
        break;
      case "1Y":
        func = "TIME_SERIES_WEEKLY";
        sliceCount = 52;
        break;
      case "5Y":
        func = "TIME_SERIES_MONTHLY";
        sliceCount = 60;
        break;
    }

    let alphaUrl: string;
    if (func === "TIME_SERIES_INTRADAY") {
      alphaUrl = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=60min&apikey=${ALPHA_VANTAGE_KEY}`;
    } else {
      alphaUrl = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    }

    try {
      const res = await fetch(alphaUrl);
      const text = await res.text();
      console.log("Raw response:", text);

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

    // Fixed time series key mapping
    const timeSeriesKey =
      func === "TIME_SERIES_INTRADAY"
        ? "Time Series (60min)"
        : func === "TIME_SERIES_WEEKLY"
        ? "Weekly Time Series"
        : func === "TIME_SERIES_MONTHLY"
        ? "Monthly Time Series"
        : "Time Series (Daily)";

    const series = data[timeSeriesKey];
    if (!series) {
      return NextResponse.json(
        { error: "No data found for this symbol" },
        { status: 404 }
      );
    }

    // Sort and limit data
    const entries = Object.entries(series)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-sliceCount);

    const chartData: MarketData[] = entries.map(([time, val]) => {
      const v = val as Record<string, string>;
      return {
        time,
        price: parseFloat(v["4. close"]), // Changed from 'value' to 'price'
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
