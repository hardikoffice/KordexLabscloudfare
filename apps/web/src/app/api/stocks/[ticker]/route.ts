import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await context.params;
    const tickerUpper = ticker.toUpperCase();
    
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from'); // Date string
    const to = searchParams.get('to');     // Date string

    // Convert dates to Unix timestamps (s) for the worker
    const fromTs = from ? Math.floor(new Date(from).getTime() / 1000) : null;
    const toTs = to ? Math.floor(new Date(to).getTime() / 1000) : null;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';
    
    let workerUrl = `${API_URL}/stocks/${tickerUpper}/history`;
    const params = new URLSearchParams();
    if (fromTs) params.append('from', fromTs.toString());
    if (toTs) params.append('to', toTs.toString());
    
    if (params.toString()) workerUrl += `?${params.toString()}`;

    try {
        console.log(`[API Proxy] Fetching ${tickerUpper} from Worker DB...`);
        const response = await fetch(workerUrl);
        
        if (!response.ok) {
            const error = await response.text();
            console.error('[API Proxy] Worker error:', error);
            return NextResponse.json({ error: 'Worker API error' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour since DB updates daily
            },
        });
    } catch (error: any) {
        console.error('[API Proxy] Fatal error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}
