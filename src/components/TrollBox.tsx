// TrollBox.tsx  (responsive + original design)
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

/* ---------- sizing logic from first component ---------- */
const fadeIn = keyframes`
  from { opacity:0; transform:translateY(5px); }
  to   { opacity:1; transform:translateY(0); }
`

const ExpandIconWrapper = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
`

const Wrapper = styled.div<{ $isMinimized: boolean }>`
  position:fixed;
  bottom:20px;
  right:20px;
  z-index:998;
  border-radius:${p => p.$isMinimized ? '50%' : '16px'};
  background:${p => p.$isMinimized ? '#7289da' : '#2f3136'};
  border:1px solid ${p => p.$isMinimized ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'};
  color:#eee;
  font-size:1rem;
  box-shadow:0 8px 20px rgba(0,0,0,0.3);
  ${({ $isMinimized }) => !$isMinimized && `backdrop-filter:blur(10px);`}
  overflow:hidden;
  display:flex;
  flex-direction:column;
  cursor:${p => p.$isMinimized ? 'pointer' : 'default'};
  transition:width .3s, height .3s, max-height .3s, border-radius .3s, background .3s;

  /* expanded vs. bubble */
  ${({ $isMinimized }) => $isMinimized ? `
    width:56px;
    height:56px;
    max-height:56px;
    justify-content:center;
    align-items:center;
    color:#fff;
    & > *:not(${ExpandIconWrapper}){ display:none; }
  ` : `
    width:340px;
    max-height:450px;
    min-height:150px;
  `}

  /* ------------- mobile break-point ------------- */
  @media (max-width:480px){
    bottom:16px;
    right:16px;
    ${({ $isMinimized }) => $isMinimized ? `
      /* bubble on mobile – no additional changes */
    ` : `
      width:calc(100% - 32px);   /* 16px gutter left + right */
      max-width:300px;
      max-height:60vh;
    `}
  }
`

const ContentContainer = styled.div<{ $isMinimized: boolean }>`
  display:flex;
  flex-direction:column;
  flex-grow:1;
  min-height:0;
  opacity:${p => p.$isMinimized ? 0 : 1};
  transition:opacity .2s;
  pointer-events:${p => p.$isMinimized ? 'none' : 'auto'};
`

const Header = styled.div`
  padding:15px 20px;
  border-bottom:1px solid rgba(255,255,255,0.08);
  display:flex;
  align-items:center;
  justify-content:space-between;
  background:#202225;
  color:#fff;
  cursor:pointer;
`

const HeaderTitle = styled.span`
  flex-grow:1;
  font-size:1.1rem;     /* ← slightly smaller for narrow viewport */
  font-weight:bold;
  display:flex;
  align-items:center;
`

const OnlineStatus = styled.div`
  width:10px;height:10px;border-radius:50%;background:#28a745;margin-left:10px;
`

const HeaderStatus = styled.span`
  font-size:.85rem;color:#a0a0a0;opacity:.8;margin:0 10px;
`

const MinimizeButton = styled.button`
  background:none;border:none;color:#a0a0a0;padding:5px;cursor:pointer;border-radius:4px;
  &:hover{ background:rgba(255,255,255,0.1); color:#fff; }
`

/* message list */
const Log = styled.div`
  flex:1;overflow-y:auto;padding:20px 25px;display:flex;flex-direction:column;gap:1rem;
  min-height:200px;background:rgba(47,49,54,.8);border-radius:10px;margin-top:10px;
  &::-webkit-scrollbar{width:8px;}
  &::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:3px;}
`

const MessageItem = styled.div<{ $isOwn?: boolean }>`
  line-height:1.5;animation:${fadeIn} .3s ease-out;
  background:${p => p.$isOwn ? '#7289da' : '#40444b'};
  border-radius:8px;padding:10px 14px;max-width:85%;color:#fff;
  align-self:${p => p.$isOwn ? 'flex-end' : 'flex-start'};
  font-size:.95rem;      /* scaled down a touch */
`

const MessageHeader = styled.div`
  display:flex;align-items:center;flex-wrap:wrap;margin-bottom:4px;
`

const Username = styled.strong<{ userColor:string }>`
  font-weight:600;color:${p => p.userColor};margin-right:.5em;
`

const Badge = styled.span`
  background:#8e44ad;color:#fff;font-size:.7rem;font-weight:600;padding:2px 6px;
  border-radius:4px;margin:0 6px;text-transform:uppercase;letter-spacing:.5px;
`

const Timestamp = styled.span`
  font-size:.8rem;color:#aaa;margin-left:.5em;
`

const MessageText = styled.div`
  white-space:pre-wrap;word-break:break-word;
`

/* input row */
const InputRow = styled.div`
  display:flex;align-items:center;border-top:1px solid rgba(255,255,255,0.08);
  background:#202225;padding:10px 15px;flex-shrink:0;
`

const TextInput = styled.input`
  flex:1;background:#40444b;border:none;padding:12px 16px;color:#fff;outline:none;
  font-size:1rem;border-radius:10px;
  &::placeholder{color:#777;opacity:.8;}
`

const SendBtn = styled.button`
  background:none;border:none;padding:0 18px;cursor:pointer;font-weight:600;color:#fff;
  font-size:1rem;
  &:hover:not(:disabled){background:rgba(255,255,255,0.1);}
  &:active:not(:disabled){background:rgba(255,255,255,0.2);transform:scale(.98);}
  &:disabled{opacity:.5;cursor:not-allowed;}
`

const LoadingText = styled.div`
  text-align:center;color:#a0a0a0;padding:2rem 0;font-style:italic;font-size:.9rem;
`

/* ------------ component ------------ */
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

  const swrKey = isMinimized || (typeof document !== 'undefined' && document.hidden)
    ? null : '/api/chat'
  const { data: messages = [], error, mutate } = useSWR<Msg[]>(swrKey, fetcher, {
    refreshInterval: 8_000,
    dedupingInterval: 7_500,
  })

  const logRef   = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* colour map */
  const userColors = useMemo(() => {
    const map: Record<string, string> = {}
    messages.forEach(m => { if (!map[m.user]) map[m.user] = stringToHslColor(m.user, 70, 75) })
    if (!map[userName]) map[userName] = stringToHslColor(userName, 70, 75)
    return map
  }, [messages, userName])

  const fmtTime = (ts:number) =>
    ts > Date.now() - 5_000
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

  /* scroll to latest */
  useEffect(() => {
    if (!isMinimized && logRef.current) {
      logRef.current.scrollTo({ top:logRef.current.scrollHeight, behavior:'smooth' })
    }
  }, [messages, isMinimized])

  /* focus input after expand */
  useEffect(() => {
    if (!isMinimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 300)
      return () => clearTimeout(t)
    }
  }, [isMinimized])

  /* cooldown ticker */
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(cooldown - 1), 1_000)
    return () => clearTimeout(t)
  }, [cooldown])

  const toggleMinimize = () => setIsMinimized(v => !v)

  /* ------------- render ------------- */
  return (
    <Wrapper $isMinimized={isMinimized}>
      {isMinimized && (
        <ExpandIconWrapper onClick={toggleMinimize}>
          <ChatIcon/>
        </ExpandIconWrapper>
      )}

      <ContentContainer $isMinimized={isMinimized}>
        <Header onClick={toggleMinimize}>
          <HeaderTitle>#banabets-chat<OnlineStatus/></HeaderTitle>
          <HeaderStatus>{messages.length ? `${messages.length} msgs` : 'Connecting…'}</HeaderStatus>
          <MinimizeButton><MinimizeIcon/></MinimizeButton>
        </Header>

        <Log ref={logRef}>
          {!messages.length && !error && <LoadingText>Loading messages…</LoadingText>}
          {error && <LoadingText style={{color:'#ff8080'}}>Error loading chat.</LoadingText>}

          {messages.map((m, i) => (
            <MessageItem key={m.ts || i} $isOwn={m.user === userName}>
              <MessageHeader>
                <Username userColor={userColors[m.user]}>{m.user.slice(0,6)}</Username>
                <Badge>Guest</Badge>
                <Timestamp>{fmtTime(m.ts)}</Timestamp>
              </MessageHeader>
              <MessageText>{m.text}</MessageText>
            </MessageItem>
          ))}
        </Log>

        <InputRow>
          <TextInput
            ref={inputRef}
            value={text}
            placeholder={connected ? 'Say something…' : 'Connect wallet to chat'}
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
      </ContentContainer>
    </Wrapper>
  )
}
