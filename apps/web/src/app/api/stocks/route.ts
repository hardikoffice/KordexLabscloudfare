import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';
    const workerUrl = `${API_URL}/stocks`;

    try {
        console.log(`[API Proxy] Fetching bulk stocks from Worker DB...`);
        const response = await fetch(workerUrl);
        
        if (!response.ok) {
            const error = await response.text();
            console.error('[API Proxy] Worker error:', error);
            return NextResponse.json({ error: 'Worker API error' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=60', // Cache for 1 min
            },
        });
    } catch (error: any) {
        console.error('[API Proxy] Fatal error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}
