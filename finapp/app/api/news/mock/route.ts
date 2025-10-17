import { NextRequest, NextResponse } from 'next/server';

// Mock news data for testing when API key is not available
const MOCK_NEWS = [
  {
    uuid: "1",
    title: "Apple Reports Strong Q4 Earnings, Stock Surges",
    description: "Apple Inc. reported better-than-expected fourth quarter earnings, driven by strong iPhone sales and services revenue growth.",
    url: "https://example.com/apple-earnings",
    published_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    source: "Financial Times",
    symbols: ["AAPL"],
    sentiment: "positive"
  },
  {
    uuid: "2", 
    title: "Federal Reserve Signals Potential Rate Cut",
    description: "Fed officials hint at possible interest rate reduction in upcoming meeting as inflation shows signs of cooling.",
    url: "https://example.com/fed-rates",
    published_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    source: "Reuters",
    symbols: [],
    sentiment: "neutral"
  },
  {
    uuid: "3",
    title: "Tesla Stock Volatile Amid Production Concerns",
    description: "Tesla shares fluctuate as analysts question production targets for upcoming quarter amid supply chain challenges.",
    url: "https://example.com/tesla-production",
    published_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    source: "Bloomberg",
    symbols: ["TSLA"],
    sentiment: "negative"
  },
  {
    uuid: "4",
    title: "Gold Prices Reach New Monthly High",
    description: "Gold futures climb to highest level this month as investors seek safe haven assets amid market uncertainty.",
    url: "https://example.com/gold-prices",
    published_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    source: "MarketWatch",
    symbols: [],
    sentiment: "positive"
  },
  {
    uuid: "5",
    title: "Microsoft Azure Revenue Growth Accelerates",
    description: "Microsoft reports accelerating growth in Azure cloud services, outpacing competitor Amazon Web Services.",
    url: "https://example.com/microsoft-azure",
    published_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    source: "TechCrunch",
    symbols: ["MSFT"],
    sentiment: "positive"
  },
  {
    uuid: "6",
    title: "Oil Prices Decline on Oversupply Concerns",
    description: "Crude oil futures drop as OPEC+ production increases raise concerns about global oversupply.",
    url: "https://example.com/oil-prices",
    published_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    source: "Energy News",
    symbols: [],
    sentiment: "negative"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const slicedData = MOCK_NEWS.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: slicedData,
      meta: {
        found: MOCK_NEWS.length,
        returned: slicedData.length,
        limit,
        offset
      }
    });

  } catch (error: any) {
    console.error('Mock news API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching mock news',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
