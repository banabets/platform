// api/chat.ts

export const config = {
  runtime: 'edge', // Ensure this runs as an edge function
}

import { kv } from '@vercel/kv/edge' // ✅ Correct import

type Msg = {
  user: string
  text: string
  ts: number
}

const KEY = 'trollbox'

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === 'GET') {
      const list = (await kv.lrange<Msg>(KEY, 0, 19)) ?? []
      return new Response(JSON.stringify(list.reverse()), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const { user = 'anon', text } = (await req.json()) as Partial<Msg>
      const clean = String(text ?? '').trim()
      if (!clean) {
        return new Response('Empty', { status: 400 })
      }

      const msg: Msg = {
        user,
        text: clean,
        ts: Date.now(),
      }

      await kv.lpush(KEY, msg)
      await kv.ltrim(KEY, 0, 19)

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method Not Allowed', { status: 405 })
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
