import { NextRequest, NextResponse } from 'next/server';

const STOCK_DATA_API_KEY = process.env.STOCK_DATA_API_KEY;
const STOCK_DATA_BASE_URL = process.env.STOCK_DATA_BASE_URL || 'https://api.stockdata.org/v1';

// GET ALL LATEST NEWS
export async function GET(request: NextRequest) {
  try {
    if (!STOCK_DATA_API_KEY) {
      return NextResponse.json(
        { error: 'Stock Data API key is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    const symbols = searchParams.get('symbols');
    const language = searchParams.get('language') || 'en';
    const sentiment = searchParams.get('sentiment');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Build API URL with parameters
    const apiUrl = new URL(`${STOCK_DATA_BASE_URL}/news/all`);
    apiUrl.searchParams.append('api_token', STOCK_DATA_API_KEY);
    apiUrl.searchParams.append('limit', limit);
    apiUrl.searchParams.append('offset', offset);
    apiUrl.searchParams.append('language', language);

    // Add optional parameters if provided
    if (symbols) {
      apiUrl.searchParams.append('symbols', symbols);
    }
    if (sentiment) {
      apiUrl.searchParams.append('sentiment', sentiment);
    }
    if (dateFrom) {
      apiUrl.searchParams.append('date_from', dateFrom);
    }
    if (dateTo) {
      apiUrl.searchParams.append('date_to', dateTo);
    }

    // Fetch news from Stock Data API
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinApp/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Stock Data API error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch news from Stock Data API',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    const newsData = await response.json();

    return NextResponse.json({
      success: true,
      data: newsData.data || newsData,
      meta: newsData.meta || {
        found: newsData.data?.length || 0,
        returned: newsData.data?.length || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error: any) {
    console.error('News API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching news',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST method for more complex news queries
export async function POST(request: NextRequest) {
  try {
    if (!STOCK_DATA_API_KEY) {
      return NextResponse.json(
        { error: 'Stock Data API key is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      limit = 50,
      offset = 0,
      symbols,
      language = 'en',
      sentiment,
      date_from,
      date_to
    } = body;

    // Build API URL
    const apiUrl = new URL(`${STOCK_DATA_BASE_URL}/news/all`);
    apiUrl.searchParams.append('api_token', STOCK_DATA_API_KEY);
    apiUrl.searchParams.append('limit', limit.toString());
    apiUrl.searchParams.append('offset', offset.toString());
    apiUrl.searchParams.append('language', language);

    // Add optional parameters
    if (symbols && Array.isArray(symbols)) {
      apiUrl.searchParams.append('symbols', symbols.join(','));
    }
    if (sentiment) {
      apiUrl.searchParams.append('sentiment', sentiment);
    }
    if (date_from) {
      apiUrl.searchParams.append('date_from', date_from);
    }
    if (date_to) {
      apiUrl.searchParams.append('date_to', date_to);
    }

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinApp/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Stock Data API error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch news from Stock Data API',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    const newsData = await response.json();

    return NextResponse.json({
      success: true,
      data: newsData.data || newsData,
      meta: newsData.meta || {
        found: newsData.data?.length || 0,
        returned: newsData.data?.length || 0,
        limit,
        offset
      }
    });

  } catch (error: any) {
    console.error('News API POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching news',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
