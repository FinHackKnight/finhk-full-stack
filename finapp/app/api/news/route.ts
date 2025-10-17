import { NextRequest, NextResponse } from 'next/server';
import { newsAggregator, NewsItem } from '@/lib/news-aggregation';

// GET ALL LATEST NEWS using RSS2JSON, Reddit, and Hacker News
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const sources = searchParams.get('sources')?.split(',') as ('rss' | 'reddit' | 'hackernews')[] || ['rss', 'reddit', 'hackernews'];
    
    console.log('Fetching news with params:', { limit, offset, category, sources });

    // Fetch news from aggregation service
    const allNews = await newsAggregator.aggregateNews({
      limit: limit + offset, // Get more items to account for offset
      sources,
      category: category || undefined
    });

    // Apply pagination
    const paginatedNews = allNews.slice(offset, offset + limit);

    // Filter by category if specified
    const filteredNews = category 
      ? paginatedNews.filter(item => item.category.toLowerCase().includes(category.toLowerCase()))
      : paginatedNews;

    return NextResponse.json({
      success: true,
      data: filteredNews,
      meta: {
        found: allNews.length,
        returned: filteredNews.length,
        limit,
        offset,
        sources: sources,
        category: category || 'all'
      }
    });

  } catch (error: any) {
    console.error('News aggregation API error:', error);
    
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
    const body = await request.json();
    const {
      limit = 50,
      offset = 0,
      sources = ['rss', 'reddit', 'hackernews'],
      category,
      symbols
    } = body;

    console.log('POST: Fetching news with body:', { limit, offset, sources, category, symbols });

    // Fetch news from aggregation service
    const allNews = await newsAggregator.aggregateNews({
      limit: limit + offset,
      sources: sources as ('rss' | 'reddit' | 'hackernews')[],
      category
    });

    // Apply pagination
    const paginatedNews = allNews.slice(offset, offset + limit);

    // Filter by symbols if specified
    let filteredNews = paginatedNews;
    if (symbols && Array.isArray(symbols) && symbols.length > 0) {
      filteredNews = paginatedNews.filter(item => 
        item.symbols?.some(symbol => 
          symbols.some(requestedSymbol => 
            symbol.toLowerCase().includes(requestedSymbol.toLowerCase())
          )
        )
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredNews,
      meta: {
        found: allNews.length,
        returned: filteredNews.length,
        limit,
        offset,
        sources,
        category: category || 'all',
        symbols_filter: symbols || null
      }
    });

  } catch (error: any) {
    console.error('News aggregation POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching news',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
