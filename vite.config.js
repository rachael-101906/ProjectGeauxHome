import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Server-side proxy for ElevenLabs so the API key never reaches the browser.
// POST /api/tts { text, voiceId } -> { audio_base64, alignment }
// Works in `npm run dev` and `npm run preview`. A static deploy needs an
// equivalent serverless function (same request/response shape).
function elevenLabsProxy(apiKey) {
  const cache = new Map()
  const handler = async (req, res, next) => {
    if (req.url !== '/api/tts' || req.method !== 'POST') return next()
    res.setHeader('Content-Type', 'application/json')
    if (!apiKey) {
      res.statusCode = 503
      return res.end(JSON.stringify({ error: 'ELEVENLABS_API_KEY not set' }))
    }
    let body = ''
    for await (const chunk of req) body += chunk
    try {
      const { text, voiceId, modelId = 'eleven_flash_v2_5' } = JSON.parse(body)
      const key = `${voiceId}|${modelId}|${text}`
      if (!cache.has(key)) {
        const upstream = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps`,
          {
            method: 'POST',
            headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, model_id: modelId }),
          },
        )
        if (!upstream.ok) {
          res.statusCode = upstream.status
          return res.end(JSON.stringify({ error: await upstream.text() }))
        }
        cache.set(key, await upstream.text())
      }
      res.end(cache.get(key))
    } catch (error) {
      res.statusCode = 500
      res.end(JSON.stringify({ error: String(error) }))
    }
  }
  return {
    name: 'elevenlabs-proxy',
    configureServer(server) { server.middlewares.use(handler) },
    configurePreviewServer(server) { server.middlewares.use(handler) },
  }
}

// Server-side proxies for NASA APIs (the key stays out of the browser).
// Each route caches its cleaned-up JSON for an hour; DEMO_KEY allows ~30 requests/hour.
function nasaProxy(apiKey) {
  const CACHE_MS = 60 * 60 * 1000
  const nasa = async (path) => {
    const sep = path.includes('?') ? '&' : '?'
    const res = await fetch(`https://api.nasa.gov${path}${sep}api_key=${encodeURIComponent(apiKey)}`)
    if (!res.ok) throw new Error(`NASA ${path} -> HTTP ${res.status}`)
    return res.json()
  }
  const routes = {
    '/api/mars-weather': marsWeather,
    '/api/space-weather': spaceWeather,
  }
  const cache = {}

  // InSight lander weather -> { source, sol, utc, season, northernSeason, southernSeason, temp, wind, pressure, windFrom }
  // temp/wind/pressure are { av, mn, mx } or null when NASA has no reading for them.
  async function marsWeather() {
    const data = await nasa('/insight_weather/?feedtype=json&ver=1.0')
    const sols = Object.keys(data).filter((k) => /^\d+$/.test(k)).sort((a, b) => a - b)
    if (!sols.length) throw new Error('No sols in InSight response')
    // Newest sol that actually has a reading for this sensor.
    const latest = (field, valid) => {
      for (let i = sols.length - 1; i >= 0; i--) {
        const reading = data[sols[i]]?.[field]
        if (reading && valid(reading)) return reading
      }
      return null
    }
    const stat = (field) => {
      const r = latest(field, (x) => Number.isFinite(x.av))
      return r && { av: r.av, mn: r.mn, mx: r.mx }
    }
    const wd = latest('WD', (x) => x.most_common)?.most_common
    const newest = data[sols[sols.length - 1]]
    return {
      source: 'nasa-insight',
      sol: Number(sols[sols.length - 1]),
      utc: newest.First_UTC ?? null,
      season: newest.Season ?? null,
      northernSeason: newest.Northern_season ?? null,
      southernSeason: newest.Southern_season ?? null,
      temp: stat('AT'), // air temperature, °C
      wind: stat('HWS'), // horizontal wind speed, m/s
      pressure: stat('PRE'), // pressure, Pa
      // Most common wind direction: compass point + east/west component (-1..1).
      windFrom: wd ? { point: wd.compass_point, right: wd.compass_right } : null,
    }
  }

  // DONKI space weather, last 3 days -> { strongestFlare, flareCount, sepCount, radiation }
  async function spaceWeather() {
    const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10)
    const range = `startDate=${day(-3)}&endDate=${day(0)}`
    const [flareRes, sepRes] = await Promise.allSettled([nasa(`/DONKI/FLR?${range}`), nasa(`/DONKI/SEP?${range}`)])
    // Both down = report an error (game shows OFFLINE), never a fake "quiet sun".
    if (flareRes.status === 'rejected' && sepRes.status === 'rejected') throw flareRes.reason
    const flares = flareRes.status === 'fulfilled' ? flareRes.value : []
    const seps = sepRes.status === 'fulfilled' ? sepRes.value : []
    const list = Array.isArray(flares) ? flares : []
    // Flare classes: A < B < C < M < X, then the number (M2.3 > M1.1).
    const rank = (c = '') => 'ABCMX'.indexOf(c[0]) * 100 + (parseFloat(c.slice(1)) || 0)
    const strongest = list.reduce((best, f) => (!best || rank(f.classType) > rank(best.classType) ? f : best), null)
    const sepCount = Array.isArray(seps) ? seps.length : 0
    const strongClass = strongest?.classType?.[0]
    return {
      source: 'nasa-donki',
      strongestFlare: strongest && { classType: strongest.classType, peakTime: strongest.peakTime },
      flareCount: list.length,
      sepCount, // solar energetic particle events = real radiation storms
      radiation: sepCount > 0 || strongClass === 'X' ? 'severe' : strongClass === 'M' ? 'elevated' : 'none',
    }
  }

  const handler = async (req, res, next) => {
    const route = routes[req.url]
    if (!route || req.method !== 'GET') return next()
    res.setHeader('Content-Type', 'application/json')
    try {
      const hit = cache[req.url]
      if (!hit || Date.now() - hit.at > CACHE_MS) {
        cache[req.url] = { at: Date.now(), body: JSON.stringify(await route()) }
      }
      res.end(cache[req.url].body)
    } catch (error) {
      res.statusCode = 502
      res.end(JSON.stringify({ error: String(error) }))
    }
  }
  return {
    name: 'nasa-proxy',
    configureServer(server) { server.middlewares.use(handler) },
    configurePreviewServer(server) { server.middlewares.use(handler) },
  }
}

export default defineConfig(({ mode }) => {
  // '' prefix = also load non-VITE_ vars; they stay server-side.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      elevenLabsProxy(env.ELEVENLABS_API_KEY),
      nasaProxy(env.NASA_API_KEY || 'DEMO_KEY'),
    ],
  }
})