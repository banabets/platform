// api/chat.ts
export const config = { runtime: 'edge' }   // ← Edge everywhere, no region pin

import { kv } from '@vercel/kv'

type Msg = { user: string; text: string; ts: number; replyTo?: Msg }
const KEY = 'trollbox'

/** Validaciones del lado del servidor */
function validateMessage(text: string): { isValid: boolean; error?: string } {
  const clean = String(text ?? '').trim()

  // Longitud
  if (!clean) return { isValid: false, error: 'Mensaje vacío' }
  if (clean.length > 600) return { isValid: false, error: 'Mensaje demasiado largo' }

  // Contenido peligroso
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /Function\(/i
  ]

  for (const pattern of harmfulPatterns) {
    if (pattern.test(clean)) {
      return { isValid: false, error: 'Contenido no permitido' }
    }
  }

  // Usuario válido
  if (!clean.match(/^[a-zA-Z0-9_.\-\s]{1,50}$/)) {
    return { isValid: false, error: 'Nombre de usuario inválido' }
  }

  return { isValid: true }
}

/** Rate limiting simple */
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minuto
  const maxRequests = 10 // máximo 10 mensajes por minuto

  const userLimit = rateLimit.get(ip)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

export default async function handler(req: Request): Promise<Response> {
  try {
    // Obtener IP para rate limiting
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               'unknown'

    if (req.method === 'GET') {
      const list = (await kv.lrange<Msg>(KEY, 0, 19)) ?? []
      return new Response(JSON.stringify(list.reverse()), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      })
    }

    if (req.method === 'POST') {
      // Rate limiting
      if (!checkRateLimit(ip)) {
        return new Response(JSON.stringify({
          error: 'Demasiados mensajes. Espera un minuto.'
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { user = 'anon', text, replyTo } = (await req.json()) as Partial<Msg>

      // Validar mensaje
      const validation = validateMessage(text || '')
      if (!validation.isValid) {
        return new Response(JSON.stringify({
          error: validation.error
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const cleanText = String(text).trim()
      const cleanUser = String(user).trim().substring(0, 50) || 'anon'

      const msg: Msg = {
        user: cleanUser,
        text: cleanText,
        ts: Date.now(),
        replyTo: replyTo || undefined
      }

      await kv.lpush(KEY, msg)
      await kv.ltrim(KEY, 0, 19)

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error('[chat API error]', err);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
