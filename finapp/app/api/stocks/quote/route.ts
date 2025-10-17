import { NextRequest, NextResponse } from 'next/server';
import { getStockQuote, getMultipleStockQuotes } from '@/lib/stock-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');

    if (!symbols) {
      return NextResponse.json(
        { error: 'Symbols parameter is required' },
        { status: 400 }
      );
    }

    const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());
    
    let data;
    if (symbolArray.length === 1) {
      data = await getStockQuote(symbolArray[0]);
    } else {
      data = await getMultipleStockQuotes(symbolArray);
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('Stock quote API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock quotes',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json();

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    const data = await getMultipleStockQuotes(symbols.map(s => s.toUpperCase()));

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('Stock quote API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock quotes',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
