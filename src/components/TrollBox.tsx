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

const fadeIn = keyframes`
  from { opacity:0; transform:translateY(5px); }
  to   { opacity:1; transform:translateY(0); }
`

const Wrapper = styled.div<{ $isMinimized: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 998;
  background: #2f3136;
  color: #eee;
  font-size: 1rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border-radius: ${({ $isMinimized }) => $isMinimized ? '50%' : '16px'};
  backdrop-filter: ${({ $isMinimized }) => !$isMinimized && 'blur(10px)'};
  width: ${({ $isMinimized }) => $isMinimized ? '56px' : '340px'};
  max-height: ${({ $isMinimized }) => $isMinimized ? '56px' : '450px'};

  ${({ $isMinimized }) => $isMinimized && `
    justify-content: center;
    align-items: center;
    & > *:not(.ExpandIconWrapper){ display:none; }
  `}

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: ${({ $isMinimized }) => $isMinimized ? '56px' : 'calc(100% - 32px)'};
    max-width: 300px;
    max-height: 60vh;
  }

  @media (min-width: 769px) {
    top: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    width: 350px;
    max-height: none;
    border-radius: 0;
    background: #0f0f12;
    backdrop-filter: none;
    box-shadow: none;
  }
`

const ContentContainer = styled.div<{ $isMinimized: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  opacity: ${({ $isMinimized }) => $isMinimized ? 0 : 1};
  transition: opacity .2s;
  pointer-events: ${({ $isMinimized }) => $isMinimized ? 'none' : 'auto'};
`

const Log = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 25px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 200px;
  background: rgba(47,49,54,.8);
  border-radius: 10px;
  margin-top: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
  }

  @media (min-width: 769px) {
    background: transparent;
    padding: 1rem;
    max-height: calc(100vh - 180px);
  }
`

const InputRow = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: #202225;
  padding: 10px 15px;
  flex-shrink: 0;

  @media (min-width: 769px) {
    position: sticky;
    bottom: 0;
    background: #151515;
  }
`

const TrollBox = () => {
  const { publicKey, connected } = useWallet()
  const walletModal = useWalletModal()
  const anonFallback = useMemo(
    () => 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0'),
    []
  )
  const userName = connected && publicKey ? publicKey.toBase58().slice(0, 6) : anonFallback

  const [isMinimized, setIsMinimized] = useState(false)
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const swrKey = isMinimized || (typeof document !== 'undefined' && document.hidden) ? null : '/api/chat'
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

  const fmtTime = (ts: number) =>
    ts > Date.now() - 5000
      ? 'sending…'
      : new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  async function send() {
    if (!connected) return walletModal.setVisible(true)
    const txt = text.trim()
    if (!txt || isSending || cooldown > 0) return
    setIsSending(true)
    const id = Date.now()
    mutate([...messages, { user: userName, text: txt, ts: id }], false)
    setText('')
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userName, text: txt }),
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
      logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
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

  return (
    <Wrapper $isMinimized={isMinimized}>
      <ContentContainer $isMinimized={isMinimized}>
        <Log ref={logRef}>
          {!messages.length && !error && <div>Loading messages…</div>}
          {error && <div style={{ color: '#ff8080' }}>Error loading chat.</div>}
          {messages.map((m, i) => (
            <div key={m.ts || i} style={{ animation: `${fadeIn} .3s ease-out`, color: userColors[m.user] }}>
              <strong>{m.user.slice(0, 6)}</strong>: {m.text}
              <span style={{ float: 'right', fontSize: '0.8rem', color: '#aaa' }}>{fmtTime(m.ts)}</span>
            </div>
          ))}
        </Log>
        <InputRow>
          <input
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
            style={{ flex: 1, background: '#40444b', border: 'none', padding: '12px 16px', color: '#fff', borderRadius: '10px' }}
          />
          <button
            onClick={send}
            disabled={!connected || isSending || cooldown > 0 || !text.trim() || !swrKey}
            style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#fff', fontWeight: 600 }}
          >
            {isSending ? '…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send'}
          </button>
        </InputRow>
      </ContentContainer>
    </Wrapper>
  )
}

export default TrollBox
