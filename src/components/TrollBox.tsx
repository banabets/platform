// TrollBox.tsx — emoji-XL para mensajes solo con emojis (resto igual: menciones, preview, título sin sonido)
import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import useSWR from 'swr'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

/** ========= Tipos ========= **/
type Msg = {
  user: string
  text: string
  ts: number
}

/** ========= SWR ========= **/
const fetcher = (u: string) => fetch(u).then(r => r.json())

/** ========= Utils ========= **/
const stringToHslColor = (str: string, s: number, l: number): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${hash % 360}, ${s}%, ${l}%)`
}

// avatares en /public/avatars/1.png, 2.png, ...
const AVATAR_COUNT = 12
function getAvatar(user: string, total = AVATAR_COUNT) {
  if (total <= 0) return ''
  let hash = 0
  for (let i = 0; i < user.length; i++) hash = user.charCodeAt(i) + ((hash << 5) - hash)
  const index = Math.abs(hash) % total
  return `/avatars/${index + 1}.png`
}

const urlRegex = /(https?:\/\/[^\s]+)/gi
const mentionRegex = /(^|[\s])@([a-zA-Z0-9_.\-]{2,})/g

/** ========= Iconos ========= **/
const MinimizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>
)
const VerifiedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 4 }}>
    <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
  </svg>
)

/** ========= Estilos ========= **/
const fadeIn = keyframes`from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}`
const popIn = keyframes`0%{transform:scale(.96)}100%{transform:scale(1)}`
const ExpandIconWrapper = styled.div`display:flex;align-items:center;justify-content:center;`

const Wrapper = styled.div<{ $isMinimized: boolean }>`
  position:fixed; bottom:20px; right:20px; z-index:998;
  border-radius:${p=>p.$isMinimized?'50%':'12px'};
  background:${p=>p.$isMinimized?'#5865f2':'#2b2d31'};
  border:1px solid ${p=>p.$isMinimized?'rgba(255,255,255,0.28)':'#1f2124'};
  color:#e6e6e6; font-size:14px; box-shadow:0 8px 20px rgba(0,0,0,.35);
  overflow:hidden; display:flex; flex-direction:column;
  cursor:${p=>p.$isMinimized?'pointer':'default'};
  transition:width .25s, height .25s, max-height .25s, border-radius .25s, background .25s;
  ${({$isMinimized})=>$isMinimized?`
    width:56px;height:56px;max-height:56px;justify-content:center;align-items:center;
    & > *:not(${ExpandIconWrapper}){display:none;}
  `:`
    width:360px; max-height:620px; min-height:180px;
  `}
  @media (max-width:480px){
    bottom:16px; right:16px;
    ${({$isMinimized})=>$isMinimized?``:`width:calc(100% - 32px);max-width:360px;max-height:70vh;`}
  }
`

const ContentContainer = styled.div<{ $isMinimized: boolean }>`
  display:flex; flex-direction:column; flex-grow:1; min-height:0;
  opacity:${p=>p.$isMinimized?0:1}; transition:opacity .18s; pointer-events:${p=>p.$isMinimized?'none':'auto'};
`

const Header = styled.div`
  padding:12px 16px; display:flex; align-items:center; justify-content:space-between;
  background:#1e1f22; color:#fff; border-bottom:1px solid #1f2124; user-select:none; cursor:pointer;
`

const HeaderTitle = styled.span`flex:1; font-size:15px; font-weight:700; display:flex; align-items:center; gap:8px;`
const OnlineStatus = styled.div`width:8px; height:8px; border-radius:50%; background:#23a55a;`
const HeaderStatus = styled.span`font-size:12px; color:#a3a6aa; margin:0 8px;`

const MinimizeButton = styled.button`
  background:none; border:none; color:#a3a6aa; padding:6px; cursor:pointer; border-radius:6px;
  &:hover{ background:#2b2d31; color:#fff; }
`

const Log = styled.div`
  flex:1; overflow-y:auto; padding:10px 8px 14px 8px; display:flex; flex-direction:column;
  min-height:220px; background:#2b2d31;
  &::-webkit-scrollbar{width:8px} &::-webkit-scrollbar-thumb{background:#1f2124;border-radius:4px}
`

const Row = styled.div`
  display:grid; grid-template-columns: 40px 1fr; gap:12px;
  padding:8px 10px; border-radius:6px; animation:${fadeIn} .16s ease-out;
  &:hover{ background:rgba(255,255,255,0.03); }
`

const AvatarImg = styled.img`
  width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.15); background:#3a3c43;
`

const HeadLine = styled.div`display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;`
const Username = styled.strong<{ userColor:string }>`color:${p=>p.userColor}; font-weight:600; font-size:14px;`
const Timestamp = styled.span`font-size:12px; color:#a3a6aa;`

const MessageText = styled.div<{ $emojiOnly?: boolean }>`
  margin-top:2px; color:#dbdee1; white-space:pre-wrap; word-break:break-word;
  line-height:${p=>p.$emojiOnly?1.1:1.35};
  font-size:${p=>p.$emojiOnly?'2.6rem':'inherit'};
  letter-spacing:${p=>p.$emojiOnly?'-0.01em':'normal'};
  transform-origin:left top;
  ${p=>p.$emojiOnly?`animation:${popIn} .18s ease-out;`:''}
`

/* Badge BANA CSS */
const Badge = styled.span`
  display:inline-flex; align-items:center; gap:6px; padding:2px 8px; height:20px; border-radius:999px;
  background:#3b3d44; border:1px solid #1f2124; box-shadow:inset 0 1px 0 rgba(255,255,255,0.05);
`
const BadgeIcon = styled.span`
  width:12px; height:12px; border-radius:50%;
  background:linear-gradient(180deg,#ffd66e,#c79b30);
  display:inline-block; box-shadow:0 0 0 1px rgba(0,0,0,.25) inset;
`
const BadgeText = styled.span`font-size:11px; font-weight:700; color:#dfe3e6; letter-spacing:.3px; line-height:1;`

/* Vista previa ligera de links (favicon + dominio) */
const LinkChip = styled.a`
  display:inline-flex; align-items:center; gap:8px; margin-top:8px; max-width:100%;
  background:#1f2124; border:1px solid #2a2c31; border-radius:8px; padding:8px; color:#dfe3e6; text-decoration:none; overflow:hidden;
`
const Favicon = styled.img`width:16px; height:16px; border-radius:4px; background:#2b2d31;`
const Host = styled.span`font-size:12px; color:#b9bcc2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`

/* Menciones */
const Mention = styled.span`color:#f2a1ff; font-weight:700;`
const Popover = styled.div`
  position:absolute; bottom:58px; left:12px; z-index:999;
  background:#2b2d31; border:1px solid #1f2124; border-radius:8px; padding:6px; width:240px;
  max-height:200px; overflow:auto; box-shadow:0 8px 20px rgba(0,0,0,.35);
`
const PopRow = styled.button`
  width:100%; text-align:left; padding:6px 8px; border:none; background:transparent; color:#e6e6e6; border-radius:6px; cursor:pointer;
  &:hover{ background:#3b3d44; }
`

/* Input */
const InputWrap = styled.div`border-top:1px solid #1f2124; background:#313338; padding:10px 12px; position:relative;`
const InputRow = styled.div`
  display:flex; align-items:center; gap:8px; background:#383a40; border:1px solid #1f2124; border-radius:8px; padding:6px 8px 6px 12px;
`
const TextInput = styled.textarea`
  flex:1; background:transparent; border:none; outline:none; resize:none;
  color:#fff; font-size:14px; padding:8px 0; max-height:100px; min-height:18px; line-height:1.35;
  &::placeholder{ color:#8b8f97; }
`
const Actions = styled.div`display:flex; align-items:center; gap:6px;`
const SendBtn = styled.button`
  background:#5865f2; border:none; color:#fff; font-weight:700; font-size:13px; padding:8px 12px; border-radius:6px; cursor:pointer;
  &:disabled{ opacity:.5; cursor:not-allowed; } &:not(:disabled):hover{ filter:brightness(1.05); }
`

const LoadingText = styled.div`text-align:center; color:#a3a6aa; padding:1rem 0; font-style:italic; font-size:13px;`

/** ========= Helpers ========= **/
function formatWithMentions(text: string) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  text.replace(mentionRegex, (match, p1, user, offset) => {
    if (offset > lastIndex) parts.push(text.slice(lastIndex, offset))
    parts.push(<span key={offset + '-sp'}>{p1}</span>)
    parts.push(<Mention key={offset + '-m'}>@{user}</Mention>)
    lastIndex = offset + match.length
    return match
  })
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}
function firstUrl(text:string): string | null {
  const m = text.match(urlRegex)
  return m && m[0] ? m[0] : null
}
function hostFromUrl(u:string) {
  try { return new URL(u).hostname } catch { return '' }
}

/** Detecta si un texto son SOLO emojis (ignora espacios) */
function isEmojiOnly(text: string): boolean {
  const stripped = (text || '').replace(/\s+/g, '')
  if (!stripped) return false
  // Soporta emojis con variation selectors y ZWJ (👩‍💻, 🏳️‍🌈, etc.)
  const re = /^(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)?)+$/u
  return re.test(stripped)
}

/** Encuentra el rango de la mención activa: desde '@' (o '@parcial') hasta el cursor */
function getActiveMentionRange(text: string, caret: number): { start: number; end: number } | null {
  let i = caret - 1
  while (i >= 0 && !/\s/.test(text[i])) i--
  const tokenStart = i + 1
  if (text[tokenStart] !== '@') return null
  if (tokenStart > 0 && !/\s/.test(text[tokenStart - 1])) return null
  return { start: tokenStart, end: caret }
}

/** Reemplaza un rango del textarea por el texto dado */
function replaceRangeInTextarea(el: HTMLTextAreaElement, start: number, end: number, replacement: string) {
  const before = el.value.slice(0, start)
  const after = el.value.slice(end)
  el.value = before + replacement + after
  const pos = before.length + replacement.length
  el.setSelectionRange(pos, pos)
}

/** ========= Componente principal ========= **/
export default function TrollBox() {
  const { publicKey, connected } = useWallet()
  const walletModal = useWalletModal()

  // id visible: primeros 6 chars, o anonXXXX
  const anonFallback = useMemo(() => 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0'), [])
  const userName = connected && publicKey ? publicKey.toBase58().slice(0, 6) : anonFallback

  const [isMinimized, setIsMinimized] = useState(false)
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [mentionOpen, setMentionOpen] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const originalTitleRef = useRef<string>('')     // guarda el título original
  const prevLenRef = useRef<number>(0)

  const swrKey = isMinimized || (typeof document !== 'undefined' && document.hidden) ? null : '/api/chat'
  const { data: messages = [], error, mutate } = useSWR<Msg[]>(swrKey, fetcher, {
    refreshInterval: 8000,
    dedupingInterval: 7500,
  })

  // Autocomplete users
  const activeUsers = useMemo(() => Array.from(new Set(messages.map(m => m.user))), [messages])

  // Colors por user
  const userColors = useMemo(() => {
    const map: Record<string, string> = {}
    messages.forEach(m => { if (!map[m.user]) map[m.user] = stringToHslColor(m.user, 70, 65) })
    if (!map[userName]) map[userName] = stringToHslColor(userName, 70, 65)
    return map
  }, [messages, userName])

  const fmtTime = (ts:number) =>
    ts > Date.now() - 5000 ? 'sending…' : new Date(ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })

  /** ===== Envío ===== */
  async function send() {
    if (!connected) return walletModal.setVisible(true)
    const txt = (text || '').trim()
    if (!txt || isSending || cooldown > 0) return
    setIsSending(true)
    const id = Date.now()
    // UI optimista
    mutate([...messages, { user:userName, text:txt, ts:id }], false)
    setText('')
    try {
      await fetch('/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ user:userName, text:txt }),
      })
      mutate()
      setCooldown(5)
    } catch (e) {
      console.error(e); mutate()
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  /** ===== UI: scroll y foco ===== */
  useEffect(() => {
    if (!isMinimized && logRef.current) {
      logRef.current.scrollTo({ top:logRef.current.scrollHeight, behavior:'smooth' })
    }
  }, [messages, isMinimized])

  useEffect(() => {
    if (!isMinimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 300)
      return () => clearTimeout(t)
    }
  }, [isMinimized])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  /** ===== Notificaciones de título (sin sonido) ===== */
  useEffect(() => {
    if (typeof document !== 'undefined' && !originalTitleRef.current) {
      originalTitleRef.current = document.title
    }
    const onVis = () => {
      if (!document.hidden && originalTitleRef.current) {
        document.title = originalTitleRef.current
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    const prevLen = prevLenRef.current
    const currLen = messages.length
    if (currLen > prevLen && currLen > 0) {
      const last = messages[currLen - 1]
      if (last.user !== userName) {
        if (document.hidden && originalTitleRef.current) {
          document.title = `(1) ${originalTitleRef.current}`
        }
      }
    }
    prevLenRef.current = currLen
  }, [messages, userName])

  /** ===== Menciones ===== */
  function onInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    if (e.key === '@') setMentionOpen(true)
    if (e.key === 'Escape') setMentionOpen(false)
  }

  function insertAtCursor(insert: string) {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const before = el.value.slice(0, start)
    const after = el.value.slice(end)
    el.value = before + insert + after
    setText(el.value)
    const pos = before.length + insert.length
    requestAnimationFrame(() => {
      el.setSelectionRange(pos, pos)
      el.focus()
    })
  }

  function pickMention(u: string) {
    const el = inputRef.current
    if (!el) return
    const caret = el.selectionStart ?? el.value.length
    const range = getActiveMentionRange(el.value, caret)
    if (range) {
      replaceRangeInTextarea(el, range.start, range.end, `@${u} `)
      setText(el.value)
    } else {
      insertAtCursor(`@${u} `)
    }
    setMentionOpen(false)
  }

  const toggleMinimize = () => setIsMinimized(v => !v)

  return (
    <Wrapper $isMinimized={isMinimized}>
      {isMinimized && (
        <ExpandIconWrapper onClick={toggleMinimize}>
          <ChatIcon />
        </ExpandIconWrapper>
      )}

      <ContentContainer $isMinimized={isMinimized}>
        <Header onClick={toggleMinimize}>
          <HeaderTitle>#bana-chat <OnlineStatus /></HeaderTitle>
          <HeaderStatus>{messages.length ? `${messages.length} msgs` : 'Connecting…'}</HeaderStatus>
          <MinimizeButton><MinimizeIcon /></MinimizeButton>
        </Header>

        <Log ref={logRef} onClick={() => setMentionOpen(false)}>
          {!messages.length && !error && <LoadingText>Loading messages…</LoadingText>}
          {error && <LoadingText style={{ color: '#ff8080' }}>Error loading chat.</LoadingText>}

          {messages.map((m, i) => {
            const color = m.user === 'system' ? '#ffd66e' : stringToHslColor(m.user, 70, 65)
            const avatar = getAvatar(m.user)

            const url = m.text ? firstUrl(m.text) : null
            const host = url ? hostFromUrl(url) : ''
            const fav = host ? `https://www.google.com/s2/favicons?domain=${host}` : ''

            const emojiXL = isEmojiOnly(m.text)

            return (
              <Row key={m.ts || i}>
                <AvatarImg src={avatar} alt={m.user} />
                <div>
                  <HeadLine>
                    <Username userColor={color}>{m.user.slice(0, 6)}</Username>
                    <Badge><BadgeIcon /><BadgeText>BANA</BadgeText></Badge>
                    <VerifiedIcon />
                    <Timestamp>{fmtTime(m.ts)}</Timestamp>
                  </HeadLine>

                  {m.text ? (
                    <MessageText $emojiOnly={emojiXL}>
                      {emojiXL ? m.text : formatWithMentions(m.text)}
                    </MessageText>
                  ) : null}

                  {/* Chip de link (favicon + dominio) sin backend */}
                  {url && host ? (
                    <LinkChip href={url} target="_blank" rel="noreferrer">
                      <Favicon src={fav} alt="" />
                      <Host>{host}</Host>
                    </LinkChip>
                  ) : null}
                </div>
              </Row>
            )
          })}
        </Log>

        <InputWrap onClick={() => inputRef.current?.focus()}>
          <InputRow>
            <TextInput
              ref={inputRef}
              rows={1}
              value={text}
              placeholder={'Message #bana-chat'}
              onChange={e => setText(e.target.value)}
              onKeyDown={onInputKeyDown}
              onFocus={() => setMentionOpen(false)}
              disabled={isSending || !swrKey}
              maxLength={600}
            />
            <Actions>
              <SendBtn
                onClick={() => send()}
                disabled={!connected || isSending || cooldown > 0 || (!text.trim()) || !swrKey}
              >
                {isSending ? '…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send'}
              </SendBtn>
            </Actions>
          </InputRow>

          {/* Popover menciones */}
          {mentionOpen && activeUsers.length > 0 && (
            <Popover>
              {activeUsers.slice(0, 12).map(u => (
                <PopRow key={u} onClick={() => pickMention(u)}>
                  @{u}
                </PopRow>
              ))}
            </Popover>
          )}
        </InputWrap>
      </ContentContainer>
    </Wrapper>
  )
}
