// TrollBox.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import useSWR from 'swr'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

type Msg = { user: string; text: string; ts: number }

const fetcher = (u: string) => fetch(u).then(r => r.json())

const stringToHslColor = (str: string, s: number, l: number): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${hash % 360}, ${s}%, ${l}%)`
}

// número de avatares disponibles en /public/avatars como 1.png, 2.png, ...
const AVATAR_COUNT = 12

function getAvatar(user: string, total = AVATAR_COUNT) {
  if (total <= 0) return ''
  let hash = 0
  for (let i = 0; i < user.length; i++) hash = user.charCodeAt(i) + ((hash << 5) - hash)
  const index = Math.abs(hash) % total
  return `/avatars/${index + 1}.png`
}

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

const fadeIn = keyframes`
  from { opacity:0; transform:translateY(4px); }
  to   { opacity:1; transform:translateY(0); }
`

const ExpandIconWrapper = styled.div`
  display:flex; align-items:center; justify-content:center;
`

const Wrapper = styled.div<{ $isMinimized: boolean }>`
  position:fixed; bottom:20px; right:20px; z-index:998;
  border-radius:${p => p.$isMinimized ? '50%' : '12px'};
  background:${p => p.$isMinimized ? '#5865f2' : '#2b2d31'};
  border:1px solid ${p => p.$isMinimized ? 'rgba(255,255,255,0.28)' : '#1f2124'};
  color:#e6e6e6; font-size:14px; box-shadow:0 8px 20px rgba(0,0,0,0.35);
  overflow:hidden; display:flex; flex-direction:column;
  cursor:${p => p.$isMinimized ? 'pointer' : 'default'};
  transition:width .25s, height .25s, max-height .25s, border-radius .25s, background .25s;

  ${({ $isMinimized }) => $isMinimized ? `
    width:56px; height:56px; max-height:56px;
    justify-content:center; align-items:center;
    & > *:not(${ExpandIconWrapper}){ display:none; }
  ` : `
    width:360px; max-height:520px; min-height:180px;
  `}

  @media (max-width:480px){
    bottom:16px; right:16px;
    ${({ $isMinimized }) => $isMinimized ? `` : `
      width:calc(100% - 32px); max-width:340px; max-height:65vh;
    `}
  }
`

const ContentContainer = styled.div<{ $isMinimized: boolean }>`
  display:flex; flex-direction:column; flex-grow:1; min-height:0;
  opacity:${p => p.$isMinimized ? 0 : 1};
  transition:opacity .18s;
  pointer-events:${p => p.$isMinimized ? 'none' : 'auto'};
`

const Header = styled.div`
  padding:12px 16px; display:flex; align-items:center; justify-content:space-between;
  background:#1e1f22; color:#fff; border-bottom:1px solid #1f2124;
  user-select:none; cursor:pointer;
`

const HeaderTitle = styled.span`
  flex:1; font-size:15px; font-weight:700; display:flex; align-items:center; gap:8px; letter-spacing:.2px;
`

const OnlineStatus = styled.div`
  width:8px; height:8px; border-radius:50%; background:#23a55a;
`

const HeaderStatus = styled.span`
  font-size:12px; color:#a3a6aa; margin:0 8px;
`

const MinimizeButton = styled.button`
  background:none; border:none; color:#a3a6aa; padding:6px; cursor:pointer; border-radius:6px;
  &:hover{ background:#2b2d31; color:#fff; }
`

const Log = styled.div`
  flex:1; overflow-y:auto; padding:10px 8px 14px 8px; display:flex; flex-direction:column;
  min-height:220px; background:#2b2d31;

  &::-webkit-scrollbar{ width:8px; }
  &::-webkit-scrollbar-thumb{ background:#1f2124; border-radius:4px; }
`

const Row = styled.div`
  display:grid; grid-template-columns: 40px 1fr; gap:12px;
  padding:8px 10px; border-radius:6px; animation:${fadeIn} .16s ease-out;
  &:hover{ background:rgba(255,255,255,0.03); }
`

const AvatarImg = styled.img`
  width:40px; height:40px; border-radius:50%;
  object-fit:cover; border:2px solid rgba(255,255,255,0.15);
  background:#3a3c43;
`

const Head = styled.div`
  display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;
`

const Username = styled.strong<{ userColor:string }>`
  color:${p => p.userColor}; font-weight:600; font-size:14px;
`

const Timestamp = styled.span`
  font-size:12px; color:#a3a6aa;
`

const MessageText = styled.div`
  margin-top:2px; color:#dbdee1; white-space:pre-wrap; word-break:break-word; line-height:1.35;
`

/* Badge puramente CSS */
const Badge = styled.span`
  display:inline-flex; align-items:center; gap:6px;
  padding:2px 8px; height:20px; border-radius:999px;
  background:#3b3d44; border:1px solid #1f2124;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.05);
`

const BadgeIcon = styled.span`
  width:12px; height:12px; border-radius:50%;
  background:linear-gradient(180deg, #ffd66e, #c79b30);
  display:inline-block; box-shadow:0 0 0 1px rgba(0,0,0,0.25) inset;
`

const BadgeText = styled.span`
  font-size:11px; font-weight:700; color:#dfe3e6;
  letter-spacing:.3px; line-height:1;
`

const InputWrap = styled.div`
  border-top:1px solid #1f2124; background:#313338; padding:12px;
`

const InputRow = styled.div`
  display:flex; align-items:center; gap:8px;
  background:#383a40; border:1px solid #1f2124; border-radius:8px; padding:6px 8px 6px 12px;
`

const TextInput = styled.input`
  flex:1; background:transparent; border:none; outline:none;
  color:#fff; font-size:14px; padding:8px 0;
  &::placeholder{ color:#8b8f97; }
`

const SendBtn = styled.button`
  background:#5865f2; border:none; color:#fff; font-weight:700;
  font-size:13px; padding:8px 12px; border-radius:6px; cursor:pointer;
  &:disabled{ opacity:.5; cursor:not-allowed; }
  &:not(:disabled):hover{ filter:brightness(1.05); }
`

const LoadingText = styled.div`
  text-align:center; color:#a3a6aa; padding:1rem 0; font-style:italic; font-size:13px;
`

export default function TrollBox() {
  const { publicKey, connected } = useWallet()
  const walletModal = useWalletModal()

  const anonFallback = useMemo(
    () => 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0'),
    []
  )
  const userName = connected && publicKey
    ? publicKey.toBase58().slice(0, 6)
    : anonFallback

  const [isMinimized, setIsMinimized] = useState(false)
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const swrKey =
    isMinimized || (typeof document !== 'undefined' && document.hidden)
      ? null
      : '/api/chat'
  const { data: messages = [], error, mutate } = useSWR<Msg[]>(swrKey, fetcher, {
    refreshInterval: 8000,
    dedupingInterval: 7500,
  })

  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const userColors = useMemo(() => {
    const map: Record<string, string> = {}
    messages.forEach(m => { if (!map[m.user]) map[m.user] = stringToHslColor(m.user, 70, 65) })
    if (!map[userName]) map[userName] = stringToHslColor(userName, 70, 65)
    return map
  }, [messages, userName])

  const fmtTime = (ts:number) =>
    ts > Date.now() - 5000
      ? 'sending…'
      : new Date(ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })

  async function send() {
    if (!connected) return walletModal.setVisible(true)
    const txt = text.trim()
    if (!txt || isSending || cooldown > 0) return
    setIsSending(true)
    const id = Date.now()
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

        <Log ref={logRef}>
          {!messages.length && !error && <LoadingText>Loading messages…</LoadingText>}
          {error && <LoadingText style={{ color: '#ff8080' }}>Error loading chat.</LoadingText>}

          {messages.map((m, i) => {
            const src = getAvatar(m.user)
            const color = userColors[m.user]
            return (
              <Row key={m.ts || i}>
                <AvatarImg src={src} alt={m.user} />
                <div>
                  <Head>
                    <Username userColor={color}>{m.user.slice(0, 6)}</Username>

                    {/* Badge CSS antes del verified */}
                    <Badge>
                      <BadgeIcon />
                      <BadgeText>BANA</BadgeText>
                    </Badge>

                    <VerifiedIcon />
                    <Timestamp>{fmtTime(m.ts)}</Timestamp>
                  </Head>
                  <MessageText>{m.text}</MessageText>
                </div>
              </Row>
            )
          })}
        </Log>

        <InputWrap>
          <InputRow>
            <TextInput
              ref={inputRef}
              value={text}
              placeholder={connected ? 'Message #bana-chat' : 'Connect wallet to chat'}
              onChange={e => setText(e.target.value)}
              onClick={() => !connected && walletModal.setVisible(true)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
              }}
              disabled={isSending || !swrKey}
              maxLength={200}
            />
            <SendBtn
              onClick={send}
              disabled={!connected || isSending || cooldown > 0 || !text.trim() || !swrKey}
            >
              {isSending ? '…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send'}
            </SendBtn>
          </InputRow>
        </InputWrap>
      </ContentContainer>
    </Wrapper>
  )
}
