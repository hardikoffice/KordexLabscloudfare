import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await context.params;
    const tickerUpper = ticker.toUpperCase();
    
    const { searchParams } = new URL(request.url);
    const multiplier = searchParams.get('multiplier') || '1';
    const timespan = searchParams.get('timespan') || 'day';
    const from = searchParams.get('from'); // Expecting format YYYY-MM-DD
    const to = searchParams.get('to');     // Expecting format YYYY-MM-DD

    const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

    if (!POLYGON_API_KEY) {
        console.error('[API Proxy] POLYGON_API_KEY is missing');
        return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }

    if (!from || !to) {
        return NextResponse.json({ error: 'Missing from or to date' }, { status: 400 });
    }

    // Polygon URL: /v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}
    const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${tickerUpper}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;

    try {
        console.log(`[API Proxy] Fetching ${tickerUpper} from Polygon (${from} to ${to})...`);
        const response = await fetch(polygonUrl);
        const data = await response.json();

        if (data.status === 'ERROR') {
            return NextResponse.json({ error: data.error || 'Polygon API error' }, { status: 400 });
        }

        if (!data.results || data.results.length === 0) {
            return NextResponse.json([]);
        }

        // Transform Polygon's format to lightweight-charts format
        // Polygon: { c, h, l, o, t, v, vw, n }
        // Lightweight: { time, open, high, low, close }
        const transformed = data.results.map((bar: any) => ({
            time: Math.floor(bar.t / 1000), // Convert ms to s
            open: bar.o,
            high: bar.h,
            low: bar.l,
            close: bar.c,
        }));

        return NextResponse.json(transformed, {
            headers: {
                'Cache-Control': 'public, max-age=300', // Cache for 5 mins
            },
        });
    } catch (error: any) {
        console.error('[API Proxy] Fatal error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}
