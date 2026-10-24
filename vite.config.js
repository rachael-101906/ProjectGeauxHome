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

export default defineConfig(({ mode }) => {
  // '' prefix = also load non-VITE_ vars; they stay server-side.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), elevenLabsProxy(env.ELEVENLABS_API_KEY)],
  }
})
