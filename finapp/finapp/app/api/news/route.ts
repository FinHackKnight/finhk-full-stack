import { NextRequest, NextResponse } from 'next/server';
import { marketAuxService, NewsQueryParams } from '@/lib/marketaux-news';

// GET ALL LATEST NEWS using MarketAux API only
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const symbols = searchParams.get('symbols')?.split(',').filter(Boolean);
    const exchanges = searchParams.get('exchanges')?.split(',').filter(Boolean);
    const countries = searchParams.get('countries')?.split(',').filter(Boolean);
    const sentiment = searchParams.get('sentiment') as 'positive' | 'negative' | 'neutral' | null;
    const must_have_entities = searchParams.get('must_have_entities');
    const published_after = searchParams.get('published_after');
    const published_before = searchParams.get('published_before');
    const sort = searchParams.get('sort') as NewsQueryParams['sort'];

    // Advanced filters from query (optional overrides)
    const search = searchParams.get('search') || undefined;
    const industries = searchParams.get('industries')?.split(',').filter(Boolean);
    const domains = searchParams.get('domains')?.split(',').filter(Boolean);
    const group_similar = searchParams.get('group_similar');
    const min_match_score = searchParams.get('min_match_score');

    // Strong defaults for market-moving articles
    const defaultKeywords = '("earnings"|"guidance"|"acquisition"|"tariff"|"sanctions"|"data breach"|"recall"|"profit warning")';
    const defaultIndustries = ['Technology','Energy','Financial Services','Healthcare','Industrials'];
    const defaultDomains = ['bloomberg.com','reuters.com','wsj.com','cnbc.com'];

    // Build query parameters for MarketAux
    const queryParams: NewsQueryParams = {
      limit,
      page,
      sort: sort || 'published_desc',
      languages: ['en'], // Default to English
      // enforce default market-moving filters unless overridden
      must_have_entities: must_have_entities ? must_have_entities === 'true' : true,
      group_similar: group_similar ? group_similar === 'true' : true,
      min_match_score: min_match_score ? parseFloat(min_match_score) : 0.6,
      search: search || defaultKeywords,
      industries: industries?.length ? industries : defaultIndustries,
      domains: domains?.length ? domains : defaultDomains,
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
        filters: queryParams,
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
      limit = 20,
      page = 1,
      symbols,
      exchanges,
      entity_types,
      countries,
      sentiment,
      min_match_score = 0.6,
      must_have_entities = true,
      published_after,
      published_before,
      sort = 'published_desc',
      filter_entities = true,
      // advanced defaults with override support
      search = '("earnings"|"guidance"|"acquisition"|"tariff"|"sanctions"|"data breach"|"recall"|"profit warning")',
      industries = ['Technology','Energy','Financial Services','Healthcare','Industrials'],
      domains = ['bloomberg.com','reuters.com','wsj.com','cnbc.com'],
      group_similar = true,
    } = body || {};

    // Build query parameters
    const queryParams: NewsQueryParams = {
      limit,
      page,
      sort,
      languages: ['en'],
      must_have_entities,
      filter_entities,
      min_match_score,
      search,
      industries,
      domains,
      group_similar,
    };

    // Add optional filters
    if (symbols?.length) queryParams.symbols = symbols;
    if (exchanges?.length) queryParams.exchanges = exchanges;
    if (entity_types?.length) queryParams.entity_types = entity_types;
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
