import { NextRequest, NextResponse } from 'next/server';
import { getStockNews } from '@/lib/stock-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    const limit = searchParams.get('limit');

    const symbolArray = symbols ? symbols.split(',').map(s => s.trim().toUpperCase()) : undefined;
    const limitNumber = limit ? parseInt(limit) : 20;

    const data = await getStockNews(symbolArray, limitNumber);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('Stock news API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock news',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
