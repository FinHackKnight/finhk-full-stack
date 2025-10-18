import { NextResponse } from 'next/server';

export const revalidate = 60; // cache for 60s

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'AAPL';
  const key = process.env.ALPHAVANTAGE_KEY!;
  
  if (!key) {
    return NextResponse.json({ error: 'Alpha Vantage API key not configured' }, { status: 500 });
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`;
  
  try {
    const r = await fetch(url);
    const json = await r.json();

    if (json['Error Message']) {
      return NextResponse.json({ error: json['Error Message'] }, { status: 400 });
    }

    if (json['Note']) {
      return NextResponse.json({ error: 'API rate limit exceeded' }, { status: 429 });
    }

    const series = json['Time Series (Daily)'] || {};
    const data = Object.entries(series)
      .map(([date, v]: any) => ({
        time: date,                       // YYYY-MM-DD
        open: parseFloat(v['1. open']),
        high: parseFloat(v['2. high']),
        low:  parseFloat(v['3. low']),
        close:parseFloat(v['4. close']),
      }))
      .sort((a, b) => (a.time < b.time ? -1 : 1));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('OHLC API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch OHLC data' }, { status: 500 });
  }
}
