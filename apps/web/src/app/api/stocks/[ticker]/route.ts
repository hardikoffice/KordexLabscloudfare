import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await context.params;
    const tickerUpper = ticker.toUpperCase();
    
    const { searchParams } = new URL(request.url);
    const resolution = searchParams.get('resolution') || 'D';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Note: In Next.js Edge runtime on Cloudflare, use process.env
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

    if (!FINNHUB_API_KEY) {
        console.error('[API Proxy] FINNHUB_API_KEY is missing');
        return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }

    if (!from || !to) {
        return NextResponse.json({ error: 'Missing time range parameters' }, { status: 400 });
    }

    const finnhubUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${tickerUpper}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

    try {
        console.log(`[API Proxy] Fetching ${tickerUpper} from Finnhub...`);
        const response = await fetch(finnhubUrl);
        const data = await response.json();

        // Finnhub specific error messages
        if (data.error) {
            console.error(`[API Proxy] Finnhub error for ${tickerUpper}:`, data.error);
            return NextResponse.json({ error: `Finnhub: ${data.error}` }, { status: response.status || 400 });
        }

        if (data.s === 'no_data') {
            return NextResponse.json([]);
        }

        if (data.s !== 'ok') {
            return NextResponse.json({ error: 'Unexpected response from data provider' }, { status: 400 });
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
    } catch (error: any) {
        console.error('[API Proxy] Fatal error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}
