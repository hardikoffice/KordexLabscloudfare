export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const ticker = url.pathname.split('/').pop();
  const resolution = url.searchParams.get('resolution') || 'D';
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const FINNHUB_API_KEY = env.FINNHUB_API_KEY;

  if (!FINNHUB_API_KEY) {
    return new Response(JSON.stringify({ error: 'FINNHUB_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!from || !to) {
    return new Response(JSON.stringify({ error: 'Missing from or to timestamp' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const finnhubUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

  try {
    const response = await fetch(finnhubUrl);
    const data = await response.json();

    if (data.s === 'no_data') {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (data.s !== 'ok') {
      return new Response(JSON.stringify({ error: data.error || 'Finnhub API error' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Transform to lightweight-charts format
    const transformed = data.t.map((timestamp, index) => ({
      time: timestamp, // Finnhub returns unix timestamp in seconds
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
    }));

    return new Response(JSON.stringify(transformed), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch stock data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
