import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: { ticker: string } | any }
) {
    // Resolve ticker from params (Next.js 15+ params are async, but in edge runtime they might be handled differently depending on version)
    // For compatibility with Next 15, we await if it's a promise, otherwise use as is.
    const resolvedParams = await params;
    const ticker = resolvedParams.ticker;
    
    const { searchParams } = new URL(request.url);
    const resolution = searchParams.get('resolution') || 'D';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

    if (!FINNHUB_API_KEY) {
        return NextResponse.json({ error: 'FINNHUB_API_KEY is not configured' }, { status: 500 });
    }

    if (!from || !to) {
        return NextResponse.json({ error: 'Missing from or to timestamp' }, { status: 400 });
    }

    const finnhubUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

    try {
        const response = await fetch(finnhubUrl);
        const data = await response.json();

        if (data.s === 'no_data') {
            return NextResponse.json([]);
        }

        if (data.s !== 'ok') {
            return NextResponse.json({ error: data.error || 'Finnhub API error' }, { status: 400 });
        }

        // Transform to lightweight-charts format
        const transformed = data.t.map((timestamp: number, index: number) => ({
            time: timestamp,
            open: data.o[index],
            high: data.h[index],
            low: data.l[index],
            close: data.c[index],
        }));

        return NextResponse.json(transformed, {
            headers: {
                'Cache-Control': 'public, max-age=60',
            },
        });
    } catch (error) {
        console.error('Error fetching from Finnhub:', error);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}
