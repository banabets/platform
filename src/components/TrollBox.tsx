// TrollBox.tsx — Burbujas agrupadas por autor (sin repetir avatar/cabecera) + menciones + link preview + título sin sonido
import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import useSWR from 'swr'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useToast } from '../hooks/useToast'

/** ========= Tipos ========= **/
type Msg = {
  user: string
  text: string
  ts: number
  replyTo?: Msg
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
    <polyline points="6,9 12,15 18,9"/>
  </svg>
)
const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18,15 12,9 6,15"/>
  </svg>
)
const ReplyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7"/>
    <path d="m20 18-3-3-3 3"/>
    <line x1="15" y1="12" x2="20" y2="12"/>
    <line x1="15" y1="6" x2="20" y2="6"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 17 5-5-5-5"/>
    <path d="M7 7v10"/>
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
const ExpandIconWrapper = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 20px;
  height:60px;
  width:100%;
  cursor:pointer;
  border-top:1px solid rgba(255,255,255,0.1);
  background: linear-gradient(135deg, rgba(40, 43, 48, 0.8), rgba(32, 34, 37, 0.6));
  backdrop-filter: blur(10px);
`

const Wrapper = styled.div<{ $isMinimized: boolean }>`
  position:fixed; bottom:0; right:20px; z-index:998;
  width:${p=>p.$isMinimized?'60px':'420px'};
  height:${p=>p.$isMinimized?'60px':'75vh'};
  background:${p=>p.$isMinimized?
    'transparent' :
    'linear-gradient(135deg, rgba(47, 49, 54, 0.85), rgba(41, 43, 47, 0.82), rgba(35, 39, 42, 0.85))'};
  backdrop-filter: ${p=>p.$isMinimized?'none':'blur(24px) saturate(180%)'};
  -webkit-backdrop-filter: ${p=>p.$isMinimized?'none':'blur(24px) saturate(180%)'};
  border:${p=>p.$isMinimized?'none':'1px solid rgba(255, 255, 255, 0.08)'};
  border-top:${p=>p.$isMinimized?'none':'1px solid rgba(255, 255, 255, 0.12)'};
  border-radius:${p=>p.$isMinimized?'50%':'20px 20px 0 0'};
  color:#dcddde; font-size:14px;
  box-shadow:${p=>p.$isMinimized?
    'none' :
    '0 -8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.08)'};
  overflow:hidden; display:flex; flex-direction:column;
  pointer-events: ${p=>p.$isMinimized ? 'auto' : 'auto'};
  transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  ${({$isMinimized})=>$isMinimized?`
    & > *:not(${ExpandIconWrapper}){display:none;}
  `:``}
  @media (max-width:800px){
    right:10px;
    width:${p=>p.$isMinimized?'50px':'calc(100vw - 20px)'};
    ${({$isMinimized})=>$isMinimized?``:`height:65vh;`}
  }
`

const ContentContainer = styled.div<{ $isMinimized: boolean }>`
  display:flex; flex-direction:column; flex-grow:1; min-height:0;
  opacity:${p=>p.$isMinimized?0:1}; transition:opacity .18s; pointer-events:${p=>p.$isMinimized?'none':'auto'};
`

const Header = styled.div`
  padding:18px 24px; display:flex; align-items:center; justify-content:space-between;
  background: linear-gradient(135deg, rgba(54, 57, 63, 0.75), rgba(47, 49, 54, 0.7));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color:#fff; border-bottom:1px solid rgba(255, 255, 255, 0.06); user-select:none; cursor:pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background: linear-gradient(135deg, rgba(56, 59, 65, 0.8), rgba(49, 51, 56, 0.75));
  }
`

const HeaderTitle = styled.span`flex:1; font-size:15px; font-weight:700; display:flex; align-items:center; gap:8px;`
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
`

const OnlineStatus = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at center, #4dff8c 0%, #23a55a 60%, #178a48 100%);
  box-shadow: 0 0 6px #23a55a, 0 0 12px #23a55a;
  animation: ${pulse} 2s ease-in-out infinite;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: radial-gradient(circle at center, rgba(77, 255, 140, 0.3) 0%, rgba(35, 165, 90, 0.2) 50%, transparent 100%);
    animation: ${pulse} 2s ease-in-out infinite;
    animation-delay: 0.5s;
  }
`
const HeaderStatus = styled.span`font-size:12px; color:#a3a6aa; margin:0 8px;`

const MinimizeButton = styled.button`
  background: transparent;
  border: none;
  color:#b9bbbe; padding:8px; cursor:pointer; border-radius:4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover{
    background: rgba(255, 255, 255, 0.1);
    color:#dcddde;
  }
`

const Log = styled.div`
  flex:1; overflow-y:auto; padding:20px 16px 24px 16px; display:flex; flex-direction:column;
  min-height:240px;
  background: linear-gradient(135deg, rgba(44, 46, 48, 0.75), rgba(35, 39, 42, 0.7));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

/* Fila de mensaje:
   - $compact = true cuando es del mismo autor que el anterior (no repetimos avatar/cabecera y ajustamos padding) */
const Row = styled.div<{ $compact?: boolean }>`
  display:grid; grid-template-columns: 44px 1fr; gap:${p=>p.$compact?'10px':'14px'};
  padding:${p=>p.$compact?'6px 18px 6px 18px':'14px 18px'};
  margin: 2px 0; border-radius:6px; animation:${fadeIn} .3s ease-out;
  transition: all 0.2s ease;
  position: relative;
  &:hover{
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(4px);
    transform: translateX(1px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`

const AvatarImg = styled.img`
  width:44px; height:44px; border-radius:50%; object-fit:cover;
  border:3px solid rgba(255,255,255,0.12); background:#36393f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  &:hover {
    border-color: rgba(255,255,255,0.2);
    transform: scale(1.05);
  }
`

const HeadLine = styled.div`display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;`
const Username = styled.strong<{ $userColor:string }>`color:${p=>p.$userColor}; font-weight:600; font-size:14px; cursor:pointer; &:hover{text-decoration:underline;}`
const Timestamp = styled.span`font-size:12px; color:#72767d; font-weight:500;`
const MessageText = styled.div`margin-top:2px; color:#dcddde; white-space:pre-wrap; word-break:break-word; line-height:1.4; font-size:14px;`

/* Badge BANA CSS */
const Badge = styled.span`
  display:inline-flex; align-items:center; gap:4px; padding:0 6px; height:16px; border-radius:8px;
  background:#5865f2; border:1px solid #4752c4; font-size:10px; font-weight:600; color:#ffffff;
  text-transform:uppercase; letter-spacing:0.5px;
`
const BadgeIcon = styled.span`
  width:8px; height:8px; border-radius:50%;
  background:#ffffff; opacity:0.8;
  display:inline-block;
`
const BadgeText = styled.span`font-size:10px; font-weight:600; color:#ffffff; letter-spacing:0.5px; line-height:1;`

/* VIP Badge - Dorado */
const VIPBadge = styled.span`
  display:inline-flex; align-items:center; gap:4px; padding:0 6px; height:16px; border-radius:8px;
  background: linear-gradient(135deg, #ffd700, #ffed4e, #ffd700);
  border:1px solid rgba(255,215,0,0.5);
  box-shadow: 0 0 8px rgba(255,215,0,0.4);
  font-size:10px; font-weight:700; color:#2d1b00;
  text-transform:uppercase; letter-spacing:0.5px;
  position:relative; overflow:hidden;

  &::before {
    content:'';
    position:absolute; top:0; left:-100%; width:100%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
  }
`

const VIPIcon = styled.span`
  width:8px; height:8px; border-radius:50%;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border:1px solid rgba(255,255,255,0.5);
  position:relative;

  &::before {
    content:'';
    position:absolute; top:-1px; left:-1px; right:-1px; bottom:-1px;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    border-radius:50%; z-index:-1;
  }
`

const VIPText = styled.span`
  font-size:10px; font-weight:700; color:#2d1b00;
  letter-spacing:0.5px; line-height:1;
  text-shadow: 0 1px 2px rgba(255,255,255,0.3);
`

/* Vista previa ligera de links (favicon + dominio) */
const LinkChip = styled.a`
  display:inline-flex; align-items:center; gap:8px; margin-top:8px; max-width:100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  border:1px solid rgba(255, 255, 255, 0.1);
  border-radius:8px; padding:10px 14px; color:#00b0f4; text-decoration:none; overflow:hidden;
  transition: all 0.2s ease;
  &:hover{
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 176, 244, 0.2);
  }
`
const Favicon = styled.img`width:16px; height:16px; border-radius:3px; background:#36393f; flex-shrink:0;`
const Host = styled.span`font-size:13px; color:#00b0f4; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:500;`

/* Link Preview */
const LinkPreview = styled.div`
  margin-top: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(47, 49, 54, 0.8);
  backdrop-filter: blur(8px);
  overflow: hidden;
  max-width: 400px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba(255, 228, 45, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }
`

const LinkPreviewImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const LinkPreviewContent = styled.div`
  padding: 12px;
`

const LinkPreviewTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const LinkPreviewDescription = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const LinkPreviewSite = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

/* Componente Link Preview */
function LinkPreviewComponent({ url }: { url: string }) {
  const [preview, setPreview] = React.useState<{
    title?: string
    description?: string
    image?: string
    siteName?: string
  } | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let mounted = true

    const loadPreview = async () => {
      if (!url) return
      setLoading(true)
      try {
        const data = await fetchLinkPreview(url)
        if (mounted) {
          setPreview(data)
        }
      } catch (error) {
        console.warn('Error loading link preview:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadPreview()
    return () => { mounted = false }
  }, [url])

  if (!preview && !loading) return null

  return (
    <LinkPreview onClick={() => window.open(url, '_blank')}>
      {preview?.image && (
        <LinkPreviewImage
          src={preview.image}
          alt={preview.title || 'Link preview'}
          onError={(e) => {
            // Ocultar imagen si falla la carga
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <LinkPreviewContent>
        {preview?.title && (
          <LinkPreviewTitle>{preview.title}</LinkPreviewTitle>
        )}
        {preview?.description && (
          <LinkPreviewDescription>{preview.description}</LinkPreviewDescription>
        )}
        <LinkPreviewSite>
          {preview?.siteName || hostFromUrl(url)}
        </LinkPreviewSite>
      </LinkPreviewContent>
    </LinkPreview>
  )
}

/* Sistema de Citas/Respuestas */
const ReplyContainer = styled.div`
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(79, 84, 92, 0.4);
  border-left: 3px solid rgba(255, 228, 45, 0.6);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`

const ReplyAuthor = styled.span`
  font-weight: 600;
  color: rgba(255, 228, 45, 0.9);
`

const ReplyText = styled.div`
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MessageActions = styled.div`
  position: absolute;
  top: 8px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
`

const ActionButton = styled.button`
  background: rgba(79, 84, 92, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 228, 45, 0.2);
    border-color: rgba(255, 228, 45, 0.3);
    color: rgba(255, 228, 45, 0.9);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`

const RowWithActions = styled.div`
  position: relative;

  &:hover ${MessageActions} {
    opacity: 1;
  }
`

/* Mensajes Fijados */
const PinnedMessagesContainer = styled.div`
  background: rgba(79, 84, 92, 0.8);
  border: 1px solid rgba(255, 228, 45, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  backdrop-filter: blur(8px);
`

const PinnedMessagesHeader = styled.div`
  padding: 8px 12px;
  background: rgba(255, 228, 45, 0.1);
  border-bottom: 1px solid rgba(255, 228, 45, 0.2);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 228, 45, 0.9);
`

const PinnedMessageItem = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`

const PinnedMessageText = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const UnpinButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: rgba(239, 68, 68, 0.8);
    background: rgba(239, 68, 68, 0.1);
  }

  svg {
    width: 10px;
    height: 10px;
  }
`

/* Context Menu */
const ContextMenu = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  background: rgba(47, 49, 54, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  min-width: 140px;
`

const ContextMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 228, 45, 0.1);
    color: rgba(255, 228, 45, 0.9);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

/* Reply Preview en Input */
const ReplyPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(79, 84, 92, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
`

const ReplyPreviewContent = styled.div`
  flex: 1;
  min-width: 0;
`

const ReplyPreviewAuthor = styled.div`
  font-size: 12px;
  color: rgba(255, 228, 45, 0.9);
  font-weight: 500;

  strong {
    color: rgba(255, 228, 45, 1);
  }
`

const ReplyPreviewText = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ReplyPreviewClose = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

/* Menciones */
const Mention = styled.span`color:#f2a1ff; font-weight:700;`
const Popover = styled.div`
  position:absolute; bottom:58px; left:12px; z-index:999;
  background: linear-gradient(135deg, rgba(32, 34, 37, 0.95), rgba(40, 43, 48, 0.9));
  backdrop-filter: blur(15px);
  border:1px solid rgba(255, 255, 255, 0.1);
  border-radius:12px; padding:8px; width:240px;
  max-height:200px; overflow:auto;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
`
const PopRow = styled.button`
  width:100%; text-align:left; padding:10px 12px; border:none; background:transparent; color:#dcddde; border-radius:8px; cursor:pointer;
  display:flex; align-items:center; gap:8px; font-size:14px;
  transition: all 0.2s ease;
  &:hover{
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(2px);
  }
`

/* Input */
const InputWrap = styled.div`
  border-top:1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(47, 49, 54, 0.75), rgba(41, 43, 47, 0.7));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding:22px 18px 26px 18px; position:relative;
`
const InputRow = styled.div`
  display:flex; align-items:center; gap:12px;
  background: rgba(64, 68, 75, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border:1px solid rgba(255, 255, 255, 0.08);
  border-radius:8px; padding:0 16px;
  min-height:44px;
  box-shadow:
    0 1px 0 rgba(4, 4, 5, 0.2),
    0 1.5px 0 rgba(6, 6, 7, 0.05),
    0 2px 0 rgba(4, 4, 5, 0.05);
  transition: all 0.2s ease;
  &:focus-within {
    border-color: rgba(114, 118, 125, 0.6);
    background: rgba(68, 72, 79, 0.95);
    box-shadow:
      0 1px 0 rgba(4, 4, 5, 0.2),
      0 1.5px 0 rgba(6, 6, 7, 0.05),
      0 2px 0 rgba(4, 4, 5, 0.05),
      0 0 0 1px rgba(114, 118, 125, 0.3);
  }
`
const TextInput = styled.textarea`
  flex:1; background:transparent; border:none; outline:none; resize:none;
  color:#dcddde; font-size:14px; padding:11px 0; max-height:100px; min-height:22px; line-height:1.4;
  &::placeholder{ color:#72767d; }
`
const Actions = styled.div`display:flex; align-items:center; gap:6px;`
const SendBtn = styled.button`
  background: #5865f2;
  border: none;
  color:#fff; font-weight:500; font-size:14px; padding:8px 16px; border-radius:4px; cursor:pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  &:disabled{
    opacity:.5; cursor:not-allowed;
    background: #4f545c;
    box-shadow: none;
  }
  &:not(:disabled):hover{
    background: #4752c4;
    transform: scale(1.02);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
  &:not(:disabled):active{
    transform: scale(0.98);
  }
`

const LoadingText = styled.div`text-align:center; color:#72767d; padding:1rem 0; font-style:italic; font-size:13px; font-weight:500;`

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

/** Obtiene metadatos de una URL para el preview */
async function fetchLinkPreview(url: string): Promise<{
  title?: string
  description?: string
  image?: string
  siteName?: string
} | null> {
  try {
    // Usamos un proxy CORS para evitar problemas de CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`

    const response = await fetch(proxyUrl)
    const data = await response.json()
    const html = data.contents

    // Extraer metadatos usando regex (Open Graph, Twitter Cards, etc.)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                      html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i)

    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                            html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                            html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i)

    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)

    const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i)

    return {
      title: titleMatch ? titleMatch[1] : undefined,
      description: descriptionMatch ? descriptionMatch[1] : undefined,
      image: imageMatch ? imageMatch[1] : undefined,
      siteName: siteNameMatch ? siteNameMatch[1] : undefined
    }
  } catch (error) {
    console.warn('Error fetching link preview:', error)
    return null
  }
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
  const toast = useToast()

  // id visible: primeros 6 chars, o anonXXXX
  const anonFallback = useMemo(() => 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0'), [])
  const userName = connected && publicKey ? publicKey.toBase58().slice(0, 6) : anonFallback

  const [isMinimized, setIsMinimized] = useState(false)
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [replyTo, setReplyTo] = useState<Msg | null>(null)
  const [pinnedMessages, setPinnedMessages] = useState<Msg[]>(() => {
    // Cargar mensajes fijados del localStorage
    try {
      const stored = localStorage.getItem('trollbox-pinned')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Msg } | null>(null)

  // Solo esta wallet específica puede fijar mensajes
  const adminWallet = '2fop1Dg4SqeKSt9oZEF2caCfVurxzzwmMuTsVtACv4fX'
  const canPinMessages = connected && publicKey?.toBase58() === adminWallet

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const originalTitleRef = useRef<string>('')     // guarda el título original
  const prevLenRef = useRef<number>(0)

  // Mock data para desarrollo local
  const mockMessages: Msg[] = [
    { user: 'alice', text: '¡Hola a todos! 👋', ts: Date.now() - 300000 },
    { user: 'bob', text: '¿Alguien probó el nuevo jackpot?', ts: Date.now() - 240000 },
    { user: 'charlie', text: '¡Increíble! 🔥', ts: Date.now() - 180000 },
    { user: 'diana', text: 'Buena suerte a todos 🎰', ts: Date.now() - 120000 },
    { user: 'eve', text: '¡Vamos BANA! 💎', ts: Date.now() - 60000 },
  ]

  // Detectar si estamos en desarrollo
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'

  const swrKey = isMinimized || (typeof document !== 'undefined' && document.hidden) ? null :
                 isDevelopment ? null : '/api/chat'

  const { data: messages = isDevelopment ? mockMessages : [], error, mutate } = useSWR<Msg[]>(
    swrKey,
    fetcher,
    {
      refreshInterval: isDevelopment ? 0 : 8000,
      dedupingInterval: 7500,
      fallbackData: isDevelopment ? mockMessages : []
    }
  )

  // Autocomplete users
  const activeUsers = useMemo(() => Array.from(new Set(messages.map(m => m.user))), [messages])

  // Colors por user (estilo Discord)
  const userColors = useMemo(() => {
    const discordColors = [
      '#5865f2', '#57f287', '#fee75c', '#eb459e', '#ed4245',
      '#f47b67', '#f9a43f', '#e67e22', '#9b59b6', '#3498db',
      '#e74c3c', '#1abc9c', '#f1c40f', '#8e44ad', '#2ecc71'
    ]
    const map: Record<string, string> = {}
    messages.forEach(m => {
      if (!map[m.user]) {
        const hash = m.user.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0)
          return a & a
        }, 0)
        map[m.user] = discordColors[Math.abs(hash) % discordColors.length]
      }
    })
    if (!map[userName]) {
      const hash = userName.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      map[userName] = discordColors[Math.abs(hash) % discordColors.length]
    }
    return map
  }, [messages, userName])

  const fmtTime = (ts:number) =>
    ts > Date.now() - 5000 ? 'sending…' : new Date(ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })

  /** ===== Validaciones de seguridad ===== */
  const validateMessage = (msg: string): { isValid: boolean; error?: string } => {
    const trimmed = msg.trim()

    // Longitud mínima y máxima
    if (trimmed.length < 1) return { isValid: false, error: 'El mensaje no puede estar vacío' }
    if (trimmed.length > 600) return { isValid: false, error: 'El mensaje es demasiado largo (máximo 600 caracteres)' }

    // No permitir solo espacios
    if (!trimmed) return { isValid: false, error: 'El mensaje no puede contener solo espacios' }

    // Filtrar contenido potencialmente dañino (básico)
    const harmfulPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]

    for (const pattern of harmfulPatterns) {
      if (pattern.test(trimmed)) {
        return { isValid: false, error: 'Contenido no permitido detectado' }
      }
    }

    // Rate limiting adicional (mensajes repetitivos)
    const recentMessages = messages.slice(-3)
    const isRepeated = recentMessages.some(m => m.user === userName && m.text === trimmed)
    if (isRepeated) {
      return { isValid: false, error: 'No puedes enviar el mismo mensaje repetidamente' }
    }

    return { isValid: true }
  }

  /** ===== Envío con validaciones ===== */
  async function send() {
    if (!connected) return walletModal.setVisible(true)
    const txt = (text || '').trim()
    if (!txt || isSending || cooldown > 0) return

    // Validar mensaje
    const validation = validateMessage(txt)
    if (!validation.isValid) {
      toast({ title: '❌ Error', description: validation.error || 'Error desconocido' })
      return
    }

    setIsSending(true)
    const id = Date.now()
    // UI optimista
    mutate([...messages, {
      user:userName,
      text:txt,
      ts:id,
      replyTo: replyTo || undefined
    }], false)
    setText('')
    setReplyTo(null) // Limpiar reply después del envío
    try {
      if (isDevelopment) {
        // En desarrollo, simular envío exitoso
        await new Promise(resolve => setTimeout(resolve, 500)) // Simular delay de red
        mutate()
        setCooldown(3) // Cooldown más corto en desarrollo
        toast({ title: '✅ Mensaje enviado', description: '(Modo desarrollo)' })
      } else {
        // En producción, usar API real
        const response = await fetch('/api/chat', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body:JSON.stringify({
            user:userName,
            text:txt,
            replyTo: replyTo || undefined
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
          throw new Error(errorData.error || `Error ${response.status}`)
        }

        mutate()
        setCooldown(5)
      }
    } catch (e: any) {
      console.error(e)
      toast({ title: '❌ Error al enviar', description: e.message || 'Error desconocido' })
      mutate() // Revertir optimismo
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

  /** ===== Helpers de agrupación ===== */
  const sameAuthorAsPrev = (idx:number) => idx>0 && messages[idx-1]?.user === messages[idx]?.user

  const toggleMinimize = () => setIsMinimized(v => !v)

  const handleReply = (message: Msg) => {
    setReplyTo(message)
    inputRef.current?.focus()
  }

  const cancelReply = () => {
    setReplyTo(null)
  }

  const handleContextMenu = (e: React.MouseEvent, message: Msg) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  // Guardar mensajes fijados en localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('trollbox-pinned', JSON.stringify(pinnedMessages))
    } catch (error) {
      console.warn('Error saving pinned messages:', error)
    }
  }, [pinnedMessages])

  // Cerrar context menu al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        closeContextMenu()
      }
    }

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  const togglePinMessage = (message: Msg) => {
    if (!canPinMessages) {
      toast({ title: '🚫 Sin permisos', description: 'Solo el administrador puede fijar mensajes' })
      return
    }

    setPinnedMessages(prev => {
      const isPinned = prev.some(p => p.ts === message.ts)
      if (isPinned) {
        // Desfijar
        return prev.filter(p => p.ts !== message.ts)
      } else {
        // Fijar (máximo 3 mensajes fijados)
        if (prev.length >= 3) {
          toast({ title: '⚠️ Límite alcanzado', description: 'Máximo 3 mensajes fijados' })
          return prev
        }
        return [...prev, message]
      }
    })
  }

  return (
    <Wrapper $isMinimized={isMinimized} onClick={isMinimized ? toggleMinimize : undefined}>
      {isMinimized ? (
        <ExpandIconWrapper>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChatIcon />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Chat</span>
            <OnlineStatus />
          </div>
          <ExpandIcon />
        </ExpandIconWrapper>
      ) : (
        <ContentContainer $isMinimized={isMinimized}>
          <Header onClick={toggleMinimize}>
            <HeaderTitle>
              #💬 general <OnlineStatus />
              {canPinMessages && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#fbbf24' }}>👑 ADMIN</span>}
            </HeaderTitle>
            <HeaderStatus>
              {isDevelopment
                ? `Demo: ${messages.length} mensajes`
                : messages.length
                  ? `${messages.length} messages`
                  : 'Connecting…'
              }
            </HeaderStatus>
            <MinimizeButton onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}><MinimizeIcon /></MinimizeButton>
          </Header>

        {/* Mensajes Fijados */}
        {pinnedMessages.length > 0 && (
          <PinnedMessagesContainer>
            <PinnedMessagesHeader>
              📌 Pinned Messages
            </PinnedMessagesHeader>
            {pinnedMessages.map((pinnedMsg) => (
              <PinnedMessageItem key={pinnedMsg.ts}>
                <PinnedMessageText>
                  <strong>{pinnedMsg.user}:</strong> {pinnedMsg.text}
                </PinnedMessageText>
                <UnpinButton onClick={() => togglePinMessage(pinnedMsg)}>
                  <CloseIcon />
                </UnpinButton>
              </PinnedMessageItem>
            ))}
          </PinnedMessagesContainer>
        )}

        <Log ref={logRef} onClick={() => setMentionOpen(false)}>
          {!messages.length && !error && <LoadingText>Loading messages…</LoadingText>}
          {error && <LoadingText style={{ color: '#ff8080' }}>Error loading chat.</LoadingText>}

          {messages.map((m, i) => {
            const isCompact = sameAuthorAsPrev(i)
            const color = m.user === 'system' ? '#ffd66e' : stringToHslColor(m.user, 70, 65)
            const avatar = getAvatar(m.user)

            const url = m.text ? firstUrl(m.text) : null
            const host = url ? hostFromUrl(url) : ''
            const fav = host ? `https://www.google.com/s2/favicons?domain=${host}` : ''

            return (
              <RowWithActions
                key={m.ts || i}
                onContextMenu={(e) => handleContextMenu(e, m)}
              >
                <Row $compact={isCompact}>
                  {/* Columna avatar: solo en el inicio de grupo */}
                  {isCompact ? <div /> : <AvatarImg src={avatar} alt={m.user} />}

                  <div style={{ width: '100%' }}>
                    {/* Mostrar reply si existe */}
                    {m.replyTo && (
                      <ReplyContainer>
                        <ReplyAuthor>{m.replyTo.user.slice(0, 6)}</ReplyAuthor>
                        <ReplyText>{m.replyTo.text?.slice(0, 80)}{m.replyTo.text && m.replyTo.text.length > 80 ? '...' : ''}</ReplyText>
                      </ReplyContainer>
                    )}

                    {/* Cabecera (username/badge/verified/time) solo en inicio de grupo */}
                    {!isCompact && (
                      <HeadLine>
                        <Username $userColor={color}>{m.user.slice(0, 6)}</Username>
                        {m.user === '2fop1Dg4SqeKSt9oZEF2caCfVurxzzwmMuTsVtACv4fX' ? (
                          <VIPBadge><VIPIcon /><VIPText>VIP</VIPText></VIPBadge>
                        ) : (
                          <Badge><BadgeIcon /><BadgeText>BANA</BadgeText></Badge>
                        )}
                        <VerifiedIcon />
                        <Timestamp>{fmtTime(m.ts)}</Timestamp>
                      </HeadLine>
                    )}

                    {m.text ? (
                      <MessageText>{formatWithMentions(m.text)}</MessageText>
                    ) : null}

                    {/* Preview de link completo */}
                    {url ? <LinkPreviewComponent url={url} /> : null}
                  </div>
                </Row>

                {/* Botones de acción que aparecen al hover */}
                <MessageActions>
                  <ActionButton onClick={() => handleReply(m)} title="Responder mensaje">
                    <ReplyIcon />
                  </ActionButton>
                  {canPinMessages && (
                    <ActionButton
                      onClick={() => togglePinMessage(m)}
                      style={{
                        color: pinnedMessages.some(p => p.ts === m.ts) ? '#fbbf24' : undefined
                      }}
                      title={pinnedMessages.some(p => p.ts === m.ts) ? "Desfijar mensaje (Admin)" : "Fijar mensaje (Admin)"}
                    >
                      <PinIcon />
                    </ActionButton>
                  )}
                </MessageActions>
              </RowWithActions>
            )
          })}
        </Log>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu $x={contextMenu.x} $y={contextMenu.y}>
            <ContextMenuItem onClick={() => { handleReply(contextMenu.message); closeContextMenu(); }}>
              <ReplyIcon />
              Responder
            </ContextMenuItem>
            {canPinMessages && (
              <ContextMenuItem onClick={() => { togglePinMessage(contextMenu.message); closeContextMenu(); }}>
                <PinIcon />
                {pinnedMessages.some(p => p.ts === contextMenu.message.ts) ? 'Desfijar (Admin)' : 'Fijar (Admin)'}
              </ContextMenuItem>
            )}
          </ContextMenu>
        )}

        {/* Reply preview en el input */}
        {replyTo && (
          <ReplyPreview>
            <ReplyPreviewContent>
              <ReplyPreviewAuthor>Replying to <strong>{replyTo.user.slice(0, 6)}</strong></ReplyPreviewAuthor>
              <ReplyPreviewText>{replyTo.text?.slice(0, 100)}{replyTo.text && replyTo.text.length > 100 ? '...' : ''}</ReplyPreviewText>
            </ReplyPreviewContent>
            <ReplyPreviewClose onClick={cancelReply}>
              <CloseIcon />
            </ReplyPreviewClose>
          </ReplyPreview>
        )}

        <InputWrap onClick={() => inputRef.current?.focus()}>
          <InputRow>
            <TextInput
              ref={inputRef}
              rows={1}
              value={text}
              placeholder={'Message #💬 general'}
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
      )}
    </Wrapper>
  )
}
