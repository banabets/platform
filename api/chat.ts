// api/chat.ts
export const config = { runtime: 'edge' } // ← Edge everywhere

import { Redis } from '@upstash/redis'

// Inicializa conexión con Upstash Redis usando variables de entorno
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

type Msg = { user: string; text: string; ts: number }
const KEY = 'trollbox'

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === 'GET') {
      const list = (await redis.lrange<Msg>(KEY, 0, 19)) ?? []
      return new Response(JSON.stringify(list.reverse()), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const { user = 'anon', text } = (await req.json()) as Partial<Msg>
      const clean = String(text ?? '').trim()
      if (!clean) return new Response('Empty', { status: 400 })

      const msg: Msg = { user, text: clean, ts: Date.now() }

      await redis.lpush(KEY, msg)
      await redis.ltrim(KEY, 0, 19)

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method Not Allowed', { status: 405 })
  } catch (err: any) {
    console.error('[chat API error]', err)
    return new Response('Internal Error', { status: 500 })
  }
}
 
