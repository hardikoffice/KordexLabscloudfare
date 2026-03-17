import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign, verify } from 'hono/jwt'
import { R2Service } from './lib/r2'
import { hashPassword, verifyPassword } from './lib/auth'

type Bindings = {
  DB: D1Database
  IMAGES: R2Bucket
  JWT_SECRET: string
  POLYGON_API_KEY: string
  PUBLIC_BUCKET_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Add CORS middleware
app.use('*', cors())

// Global Error Handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ 
    error: 'Internal Server Error',
    message: err.message,
    stack: err.stack 
  }, 500)
})

// --- Utilities & Middleware ---
const DEFAULT_SECRET = 'kordexlabs_very_secret_key_change_in_production'

const getSecret = (env: Bindings) => env.JWT_SECRET || DEFAULT_SECRET

const authMiddleware = async (c: any, next: any) => {
  const secret = getSecret(c.env)
  return jwt({ secret, alg: 'HS256' })(c, next)
}

// --- Health Check ---
app.get('/', (c) => c.text('KordexLabs API (Hono Worker) is running!'))
app.get('/health', (c) => c.json({ status: 'ok', stack: 'Cloudflare Workers + Hono' }))

// --- Auth Routes ---
app.post('/api/auth/signup', async (c) => {
  const { email, password, full_name } = await c.req.json()
  
  const existing = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
  if (existing) return c.json({ error: 'Email already registered' }, 400)

  const hashedPassword = await hashPassword(password)
  const result = await c.env.DB.prepare(
    'INSERT INTO users (email, hashed_password, full_name) VALUES (?, ?, ?) RETURNING id, email, full_name'
  ).bind(email, hashedPassword, full_name).first()

  return c.json(result)
})

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<any>()

  if (!user || !(await verifyPassword(password, user.hashed_password))) {
    return c.json({ error: 'Incorrect email or password' }, 401)
  }

  const payload = {
    sub: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  }
  const token = await sign(payload, getSecret(c.env), 'HS256')
  return c.json({ access_token: token, token_type: 'bearer' })
})

app.get('/api/auth/me', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  const user = await c.env.DB.prepare('SELECT id, email, full_name, is_active FROM users WHERE email = ?').bind(payload.sub).first()
  return c.json(user)
})

// --- Blogs Routes ---
app.get('/api/blogs', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM blogs ORDER BY created_at DESC').all<any>()
  results.forEach(b => b.tags = b.tags ? b.tags.split(',') : [])
  return c.json(results)
})

app.get('/api/blogs/trending', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM blogs ORDER BY created_at DESC LIMIT 3').all<any>()
  results.forEach(b => b.tags = b.tags ? b.tags.split(',') : [])
  return c.json(results)
})

app.get('/api/blogs/:id', async (c) => {
  const id = c.req.param('id')
  const blog = await c.env.DB.prepare('SELECT * FROM blogs WHERE id = ?').bind(id).first<any>()
  if (!blog) return c.json({ error: 'Blog not found' }, 404)
  blog.tags = blog.tags ? blog.tags.split(',') : []
  return c.json(blog)
})

app.post('/api/blogs', async (c) => {
  const body = await c.req.json()
  const id = crypto.randomUUID()
  const tagsStr = Array.isArray(body.tags) ? body.tags.join(',') : ''
  
  const result = await c.env.DB.prepare(
    'INSERT INTO blogs (id, title, author, read_time_minutes, hero_image_url, tags, published_at, content_markdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
  ).bind(id, body.title, body.author, body.read_time_minutes, body.hero_image_url, tagsStr, body.published_at, body.content_markdown).first<any>()

  result.tags = result.tags ? result.tags.split(',') : []
  return c.json(result)
})

app.delete('/api/blogs/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM blogs WHERE id = ?').bind(id).run()
  return c.json({ message: 'Blog deleted successfully' })
})

// --- Favorites Routes ---
app.get('/api/favorites', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  const { results } = await c.env.DB.prepare(
    'SELECT f.id, f.ticker FROM user_favorites f JOIN users u ON f.user_id = u.id WHERE u.email = ?'
  ).bind(payload.sub).all()
  return c.json(results)
})

app.post('/api/favorites', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  const { ticker } = await c.req.json()
  
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(payload.sub).first<any>()
  
  const existing = await c.env.DB.prepare('SELECT id FROM user_favorites WHERE user_id = ? AND ticker = ?')
    .bind(user.id, ticker).first()
  if (existing) return c.json({ error: 'Stock already in favorites' }, 400)

  const result = await c.env.DB.prepare(
    'INSERT INTO user_favorites (user_id, ticker) VALUES (?, ?) RETURNING *'
  ).bind(user.id, ticker).first()
  
  return c.json(result)
})

app.delete('/api/favorites/:ticker', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  const ticker = c.req.param('ticker')
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(payload.sub).first<any>()
  
  await c.env.DB.prepare('DELETE FROM user_favorites WHERE user_id = ? AND ticker = ?')
    .bind(user.id, ticker).run()
  
  return c.json({ message: 'Favorite removed' })
})

// --- Saved Blogs Routes ---
app.get('/api/saved-blogs', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  const { results } = await c.env.DB.prepare(
    'SELECT s.id, s.blog_id FROM user_saved_blogs s JOIN users u ON s.user_id = u.id WHERE u.email = ?'
  ).bind(payload.sub).all()
  return c.json(results)
})

app.post('/api/saved-blogs', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  const { blog_id } = await c.req.json()
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(payload.sub).first<any>()
  
  const existing = await c.env.DB.prepare('SELECT id FROM user_saved_blogs WHERE user_id = ? AND blog_id = ?')
    .bind(user.id, blog_id).first()
  if (existing) return c.json({ error: 'Blog already saved' }, 400)

  const result = await c.env.DB.prepare(
    'INSERT INTO user_saved_blogs (user_id, blog_id) VALUES (?, ?) RETURNING *'
  ).bind(user.id, blog_id).first()
  
  return c.json(result)
})

app.delete('/api/saved-blogs/:blog_id', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  const blog_id = c.req.param('blog_id')
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(payload.sub).first<any>()
  
  await c.env.DB.prepare('DELETE FROM user_saved_blogs WHERE user_id = ? AND blog_id = ?')
    .bind(user.id, blog_id).run()
  
  return c.json({ message: 'Blog removed from saved list' })
})

// --- Stocks Routes ---
const SYNC_TICKERS = ["NVDA", "MSFT", "GOOGL", "META", "AMZN", "AMD", "TSM", "PLTR", "I:NSEI", "I:IXIC"]

async function syncStockData(env: Bindings) {
  const apiKey = env.POLYGON_API_KEY
  if (!apiKey) throw new Error("POLYGON_API_KEY missing")

  // Use yesterday's date for daily close (Polygon free tier often has a day delay)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0]

  console.log(`Syncing data for ${dateStr}...`)

  for (const ticker of SYNC_TICKERS) {
    try {
      // Polygon uses different prefixes for indices sometimes, but let's try direct first
      // For indices in free tier, it's often more reliable to fetch daily aggregates
      const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dateStr}/${dateStr}?adjusted=true&sort=asc&apiKey=${apiKey}`
      const resp = await fetch(url)
      const data: any = await resp.json()

      if (data.results && data.results.length > 0) {
        const res = data.results[0]
        const timestamp = Math.floor(new Date(dateStr).getTime() / 1000)
        
        await env.DB.prepare(
          'INSERT OR REPLACE INTO stock_prices (ticker, timestamp, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(ticker, timestamp, res.o, res.h, res.l, res.c, res.v).run()
        
        console.log(`Synced ${ticker}`)
      }
      // Respect rate limit (5/min) - wait 12s between calls if not in a burst
      await new Promise(r => setTimeout(r, 12000))
    } catch (e) {
      console.error(`Failed to sync ${ticker}:`, e)
    }
  }
}

app.get('/api/stocks/sync', async (c) => {
  // Manual trigger (could be protected by a secret header)
  const auth = c.req.header('Authorization')
  if (auth !== `Bearer ${getSecret(c.env)}`) return c.json({ error: 'Unauthorized' }, 401)
  
  // Run sync in background (Cloudflare Workers allow this via waitUntil if needed, but Hono is async)
  c.executionCtx.waitUntil(syncStockData(c.env))
  return c.json({ message: 'Sync started in background' })
})

app.get('/api/stocks', async (c) => {
  // Fetch latest prices and sparkline (last 7 days) from D1
  const { results } = await c.env.DB.prepare(`
    SELECT ticker, close, timestamp 
    FROM stock_prices 
    WHERE timestamp >= ?
    ORDER BY ticker, timestamp ASC
  `).bind(Math.floor(Date.now() / 1000) - 7 * 24 * 3600).all<any>()

  const metadataMap: Record<string, any> = {
    "NVDA": { company_name: "NVIDIA Corporation", exchange: "NASDAQ", asset_type: "Stock" },
    "MSFT": { company_name: "Microsoft Corporation", exchange: "NASDAQ", asset_type: "Stock" },
    "GOOGL": { company_name: "Alphabet Inc.", exchange: "NASDAQ", asset_type: "Stock" },
    "META": { company_name: "Meta Platforms Inc.", exchange: "NASDAQ", asset_type: "Stock" },
    "AMZN": { company_name: "Amazon.com Inc.", exchange: "NASDAQ", asset_type: "Stock" },
    "AMD": { company_name: "Advanced Micro Devices", exchange: "NASDAQ", asset_type: "Stock" },
    "TSM": { company_name: "Taiwan Semiconductor", exchange: "NYSE", asset_type: "Stock" },
    "PLTR": { company_name: "Palantir Technologies", exchange: "NYSE", asset_type: "Stock" },
    "I:NSEI": { company_name: "Nifty 50", exchange: "NSE", asset_type: "Index" },
    "I:IXIC": { company_name: "NASDAQ Composite", exchange: "NASDAQ", asset_type: "Index" },
  }

  // Group by ticker
  const grouped = results.reduce((acc, curr) => {
    if (!acc[curr.ticker]) {
      acc[curr.ticker] = {
        ticker: curr.ticker,
        price: 0,
        history: [],
        ...(metadataMap[curr.ticker] || {})
      }
    }
    acc[curr.ticker].history.push(curr.close)
    acc[curr.ticker].price = curr.close // Updates to last entry
    return acc
  }, {} as Record<string, any>)

  const finalResults = Object.values(grouped).map((r: any) => {
    const first = r.history[0] || r.price
    const change = r.price - first
    return {
      ...r,
      change,
      change_percent: first !== 0 ? (change / first) * 100 : 0
    }
  })

  return c.json(finalResults)
})

app.get('/api/stocks/:ticker/history', async (c) => {
  const ticker = c.req.param('ticker')
  const from = c.req.query('from') // Unix timestamp (s)
  const to = c.req.query('to')     // Unix timestamp (s)

  let query = 'SELECT timestamp as time, open, high, low, close, volume FROM stock_prices WHERE ticker = ?'
  const params: any[] = [ticker]

  if (from) {
    query += ' AND timestamp >= ?'
    params.push(parseInt(from))
  }
  if (to) {
    query += ' AND timestamp <= ?'
    params.push(parseInt(to))
  }

  query += ' ORDER BY timestamp ASC'

  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json(results)
})

const TOOLS = [
  {id:"1", name:"ChatGPT", category:"LLM / Chatbot", pros:["Versatile", "Large plugin ecosystem"], cons:["Can hallucinate", "Expensive at scale"], pricing_tier:"Freemium — $20/mo Pro", logo_url:""},
  {id:"2", name:"Claude", category:"LLM / Chatbot", pros:["Massive context window", "Excellent safety"], cons:["Slower than GPT-5", "Smaller ecosystem"], pricing_tier:"Freemium — $20/mo Pro", logo_url:""},
  {id:"3", name:"Midjourney", category:"Image Generation", pros:["Stunning visual quality", "Strong artistic style"], cons:["Discord-only interface", "No API access"], pricing_tier:"$10–$60/mo", logo_url:""},
  {id:"4", name:"GitHub Copilot", category:"Code Assistant", pros:["Deep IDE integration", "Multi-language support"], cons:["Subscription required", "Can suggest insecure code"], pricing_tier:"$10/mo Individual", logo_url:""},
]

app.get('/api/stocks', (c) => c.json(STOCKS))
app.get('/api/tools', (c) => c.json(TOOLS))
app.get('/api/tools/matrix', (c) => {
  const compare = c.req.query('compare')
  if (!compare) return c.json(TOOLS)
  const names = compare.split(',').map(n => n.trim().toLowerCase())
  return c.json(TOOLS.filter(t => names.includes(t.name.toLowerCase())))
})

// --- Image Upload (Ported from earlier step) ---
app.post('/api/images/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['image'] as File | string
  if (!file || !(file instanceof File)) return c.json({ error: 'No image provided' }, 400)

  const fileData = await file.arrayBuffer()
  const fileName = `${crypto.randomUUID()}-${file.name}`
  const r2Service = new R2Service(c.env)
  const key = await r2Service.uploadBinding(c.env.IMAGES, fileName, fileData, file.type)
  
  const requestUrl = new URL(c.req.url)
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
  const url = c.env.PUBLIC_BUCKET_URL ? `${c.env.PUBLIC_BUCKET_URL}/${key}` : `${baseUrl}/api/images/${key}`
  return c.json({ success: true, url, key })
})

app.get('/api/images/:key', async (c) => {
  const key = c.req.param('key')
  const object = await c.env.IMAGES.get(key)
  if (!object) return c.json({ error: 'Image not found' }, 404)
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  return new Response(object.body, { headers })
})

// --- Export App & Scheduled Handler ---
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(syncStockData(env))
  }
}
