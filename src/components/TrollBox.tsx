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

const VerifiedIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="#4fd1c5"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginLeft: 4 }}
  >
    <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
  </svg>
)

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

  @media (max-width:480px){
    bottom:16px;
    right:16px;
    ${({ $isMinimized }) => $isMinimized ? `` : `
      width:calc(100% - 32px);
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
  font-size:1.1rem;
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
  font-size:.95rem;
`

const MessageHeader = styled.div`
  display:flex;align-items:center;flex-wrap:wrap;margin-bottom:4px;
`

const Avatar = styled.div<{ bg: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${p => p.bg};
  flex-shrink: 0;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  }
`

const Username = styled.strong<{ userColor:string }>`
  font-weight:600;color:${p => p.userColor};margin-right:.3em;
`

const Timestamp = styled.span`
  font-size:.8rem;color:#aaa;margin-left:.5em;
`

const MessageText = styled.div`
  white-space:pre-wrap;word-break:break-word;
`

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
    refreshInterval: 8000,
    dedupingInterval: 7500,
  })

  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const userColors = useMemo(() => {
    const map: Record<string, string> = {}
    messages.forEach(m => { if (!map[m.user]) map[m.user] = stringToHslColor(m.user, 70, 75) })
    if (!map[userName]) map[userName] = stringToHslColor(userName, 70, 75)
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
                <Avatar bg={userColors[m.user]}>{m.user[0]}</Avatar>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Username userColor={userColors[m.user]}>{m.user.slice(0, 6)}</Username>
                  <VerifiedIcon />
                </div>
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
