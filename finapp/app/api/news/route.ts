import { NextRequest, NextResponse } from 'next/server';
import { marketAuxService, NewsQueryParams } from '@/lib/marketaux-news';

// GET ALL LATEST NEWS using MarketAux API only
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const symbols = searchParams.get('symbols')?.split(',').filter(Boolean);
    const exchanges = searchParams.get('exchanges')?.split(',').filter(Boolean);
    const countries = searchParams.get('countries')?.split(',').filter(Boolean);
    const sentiment = searchParams.get('sentiment') as 'positive' | 'negative' | 'neutral' | null;
    const must_have_entities = searchParams.get('must_have_entities') === 'true';
    const published_after = searchParams.get('published_after');
    const published_before = searchParams.get('published_before');
    const sort = searchParams.get('sort') as NewsQueryParams['sort'];

    // Build query parameters for MarketAux
    const queryParams: NewsQueryParams = {
      limit,
      page,
      sort: sort || 'published_desc',
      languages: ['en'], // Default to English
      must_have_entities,
    };

    // Add optional filters
    if (symbols?.length) queryParams.symbols = symbols;
    if (exchanges?.length) queryParams.exchanges = exchanges;
    if (countries?.length) queryParams.countries = countries;
    if (sentiment) queryParams.sentiment = sentiment;
    if (published_after) queryParams.published_after = published_after;
    if (published_before) queryParams.published_before = published_before;

    // Fetch news from MarketAux
    const news = await marketAuxService.fetchNews(queryParams);

    return NextResponse.json({
      success: true,
      data: news,
      meta: {
        found: news.length,
        returned: news.length,
        limit,
        page,
        source: 'marketaux',
        filters: {
          symbols,
          exchanges,
          countries,
          sentiment,
          must_have_entities,
        },
      },
    });
  } catch (error: any) {
    console.error('MarketAux news API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error while fetching news',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST method for complex news queries (MarketAux only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      limit = 50,
      page = 1,
      symbols,
      exchanges,
      entity_types,
      countries,
      sentiment,
      min_match_score,
      must_have_entities = false,
      published_after,
      published_before,
      sort = 'published_desc',
      filter_entities = true,
    } = body || {};

    // Build query parameters
    const queryParams: NewsQueryParams = {
      limit,
      page,
      sort,
      languages: ['en'],
      must_have_entities,
      filter_entities,
    };

    // Add optional filters
    if (symbols?.length) queryParams.symbols = symbols;
    if (exchanges?.length) queryParams.exchanges = exchanges;
    if (entity_types?.length) queryParams.entity_types = entity_types;
    if (countries?.length) queryParams.countries = countries;
    if (sentiment) queryParams.sentiment = sentiment;
    if (min_match_score !== undefined) queryParams.min_match_score = min_match_score;
    if (published_after) queryParams.published_after = published_after;
    if (published_before) queryParams.published_before = published_before;

    // Fetch news from MarketAux
    const news = await marketAuxService.fetchNews(queryParams);

    return NextResponse.json({
      success: true,
      data: news,
      meta: {
        found: news.length,
        returned: news.length,
        limit,
        page,
        source: 'marketaux',
        filters: queryParams,
      },
    });
  } catch (error: any) {
    console.error('MarketAux news POST error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error while fetching news',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
