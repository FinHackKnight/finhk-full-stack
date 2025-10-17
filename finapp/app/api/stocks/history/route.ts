import { NextRequest, NextResponse } from 'next/server';
import { getStockHistory } from '@/lib/stock-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const data = await getStockHistory(symbol.toUpperCase(), dateFrom || undefined, dateTo || undefined);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('Stock history API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock history',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
