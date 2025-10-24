import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi, useReferral } from 'gamba-react-ui-v2'
import React, { useState, useEffect } from 'react'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { Modal } from '../components/Modal'
import { PLATFORM_ALLOW_REFERRER_REMOVAL, PLATFORM_REFERRAL_FEE } from '../constants'
import { useToast } from '../hooks/useToast'
import { useUserStore } from '../hooks/useUserStore'
import { truncateString } from '../utils'

const DEFAULT_AVATAR = "https://i.ibb.co/CppmNbXW/user.png"

/** ====== Global fixes para caret/zoom en móvil ====== */
const GlobalFixes = createGlobalStyle`
  @media (max-width: 520px) {
    html { -webkit-text-size-adjust: 100%; }
    input, textarea {
      font-size: 16px !important; /* evita zoom de iOS y estabiliza caret */
    }
  }

  /* User Modal más ancho */
  .user-modal-wrapper .modal-wrapper {
    max-width: min(95vw, 700px) !important;
    width: 95vw !important;
  }

  @media (min-width: 768px) {
    .user-modal-wrapper .modal-wrapper {
      max-width: 700px !important;
      width: auto !important;
    }
  }
`

/** ================= Animaciones y UI styled ================= */
const glow = keyframes`
  0% { box-shadow: 0 0 8px rgba(0,255,136,0.35), inset 0 0 0 rgba(0,255,136,0); }
  50% { box-shadow: 0 0 16px rgba(0,255,136,0.55), inset 0 0 8px rgba(0,255,136,0.15); }
  100% { box-shadow: 0 0 8px rgba(0,255,136,0.35), inset 0 0 0 rgba(0,255,136,0); }
`

const pulse = keyframes`
  0% { transform: scale(1); opacity: .8; }
  70% { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
`

const chipGlow = keyframes`
  0%   { box-shadow: 0 0 0 rgba(254,240,138,0.0); }
  50%  { box-shadow: 0 0 14px rgba(254,240,138,0.45); }
  100% { box-shadow: 0 0 0 rgba(254,240,138,0.0); }
`

const ModalCard = styled.div`
  background: linear-gradient(135deg, rgba(24, 25, 28, 0.95), rgba(32, 34, 37, 0.9));
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: fadeInScale 0.5s ease-out;

  /* Pausa animaciones mientras hay un input enfocado para que el caret no "flote" */
  &:focus-within { animation: none; }

  /* Scrollbar integrado y elegante */
  max-height: 80vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    margin: 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #ffe42d 0%, #ffb300 50%, #ffe42d 100%);
    border-radius: 8px;
    border: 1px solid rgba(0, 255, 136, 0.2);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);

    &:hover {
      background: linear-gradient(180deg, #ffd700 0%, #ff8c00 50%, #ffd700 100%);
      border-color: rgba(0, 255, 136, 0.4);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        0 0 4px rgba(255, 228, 45, 0.3);
    }

    &:active {
      background: linear-gradient(180deg, #ffed4e 0%, #ffa500 50%, #ffed4e 100%);
      border-color: rgba(0, 255, 136, 0.6);
    }
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
`

/** Header de perfil: avatar a la izq, info a la der. En móvil: una sola columna y centrado */
const ProfileHeader = styled.div`
  display: grid;
  grid-template-columns: 106px 1fr;
  gap: 14px;
  align-items: center;
  margin-bottom: 12px;

  /* por si algún ancestro aplica transform, evitamos afectar caret al enfocar */
  &:focus-within { transform: none; }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    text-align: center;
    justify-items: center;
  }
`

const AvatarWrap = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`

/** Marco de avatar simple */
const AvatarFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  display: grid;
  place-items: center;
`

const AvatarImg = styled.img`
  position: relative;
  z-index: 1;
  height: 90px;
  width: 90px;
  object-fit: cover;
  border-radius: 20px;
  display: block;
  background: #0b0f12;
`

const OnlineDot = styled.div`
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  z-index: 3;
  border: 2px solid #0b0f12;
  background: radial-gradient(circle at center, #4dff8c 0%, #23a55a 60%, #178a48 100%);
  box-shadow: 0 0 6px #23a55a, 0 0 12px #23a55a;
  &:after {
    content: "";
    position: absolute;
    inset: -8px;
    border-radius: inherit;
    background: rgba(35,165,90,.35);
    animation: ${pulse} 2s ease-out infinite;
  }
`

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;

  @media (max-width: 520px) {
    align-items: center; /* centra debajo del avatar */
  }
`

/** Fila de usuario: en móvil apila vertical (username arriba, badge debajo) y centra */
const UserRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 8px;
  row-gap: 6px;
  min-width: 0;

  @media (max-width: 520px) {
    justify-content: center;
    flex-direction: column;
    row-gap: 4px;
  }
`

/** Wrapper que reserva altura para evitar saltos al cambiar de pill a input */
const UsernameBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px; /* ≈ alto del input (40) + margen mínimo */
  @media (max-width: 520px) {
    flex-direction: column; /* username arriba, badge debajo */
    gap: 4px;
  }
`

const UsernamePill = styled.span`
  font-size: 1.1rem;
  font-weight: 800;
  color: #00ff88;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: transform .15s ease, filter .2s ease;
  &:hover { transform: translateY(-1px); filter: drop-shadow(0 0 6px rgba(0,255,136,.4)); }
`

/** Input estable: alto y line-height iguales + font-size 16 para iOS */
const UsernameInput = styled.input`
  display: inline-block;
  width: 220px;
  max-width: 80vw;
  height: 40px;
  line-height: 40px;
  font-size: 16px;           /* evita zoom iOS y estabiliza caret */
  font-weight: 700;
  color: #fff;
  background: rgba(255,255,255,0.04);
  border: 1px solid #2f2f2f;
  border-radius: 8px;
  padding: 0 10px;           /* sin padding vertical */
  outline: none;
  text-align: center;
  caret-color: #00ff88;
  transition: border-color .2s ease, box-shadow .2s ease;

  &:focus {
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0,255,136,0.15);
  }
`

const IconBtn = styled.button`
  font-size: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  transition: background .2s ease, transform .1s ease;
  color: #fff;
  &:hover { background: rgba(255,255,255,0.06); }
  &:active { transform: scale(.98); }
`

const UserChip = styled.div`
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  display: inline-block;
  background: linear-gradient(90deg, #fef08a, #fde047);
  color: #000;
  animation: ${chipGlow} 2.6s ease-in-out infinite;
`

const WalletRow = styled.div`
  margin-top: 6px;
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: .95;
  min-width: 0;

  @media (max-width: 520px) {
    justify-content: center;
  }
`

const PillRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    justify-content: center; /* acciones centradas bajo el avatar */
  }
`

const PillButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(0,255,136,0.25);
  background: rgba(255,255,255,0.04);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 12px rgba(0,255,136,.25);
    border-color: rgba(0,255,136,0.45);
    background: rgba(255,255,255,0.06);
  }
  &:active { transform: translateY(0); }
  &[aria-pressed="true"]{
    border-color: rgba(0,255,136,0.7);
    box-shadow: 0 0 12px rgba(0,255,136,.35);
    transform: translateY(-1px);
  }
`

const SubtleText = styled.div`
  opacity: .8;
  font-size: 80%;
  text-align: center;
`


const AchievementsSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
`

const AchievementItem = styled.div<{ $unlocked: boolean }>`
  background: ${props => props.$unlocked ?
    'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 136, 0.05))' :
    'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.$unlocked ?
    'rgba(0, 255, 136, 0.3)' :
    'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  transition: all 0.3s ease;
  opacity: ${props => props.$unlocked ? 1 : 0.6};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`

const AchievementIcon = styled.div`
  font-size: 20px;
  margin-bottom: 4px;
`

const AchievementName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
`

const AchievementDesc = styled.div`
  font-size: 10px;
  color: #b0b3c1;
  line-height: 1.2;
`


const Section = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;
  width: 100%;
  padding: 8px 20px;
  margin-top: 8px;
`

/** ===== Popover de marcos ===== */
const PopoverWrap = styled.div`
  position: relative;
  display: inline-block;
  max-width: 100%;
`

const FramePopover = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  width: max-content;
  min-width: 280px;
  max-width: min(92vw, 380px);
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(18, 23, 36, 0.95), rgba(26, 27, 46, 0.95));
  border: 1px solid rgba(0, 255, 136, 0.3);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  z-index: 9999;
  animation: popIn .15s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  @keyframes popIn {
    from {
      transform: translateY(-8px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  &:before {
    content: "";
    position: absolute;
    top: -6px;
    left: 20px;
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, rgba(18, 23, 36, 0.95), rgba(26, 27, 46, 0.95));
    border-left: 1px solid rgba(0, 255, 136, 0.3);
    border-top: 1px solid rgba(0, 255, 136, 0.3);
    transform: rotate(45deg);
    z-index: -1;
  }

  @media (max-width: 520px) {
    position: fixed;
    left: 50%;
    top: auto;
    bottom: max(12px, env(safe-area-inset-bottom));
    transform: translateX(-50%);
    width: calc(100vw - 24px);
    max-width: 560px;
    border-radius: 14px;
    padding: 12px;
    max-height: min(60vh, 420px);
    overflow: auto;
    &:before { display: none; }
  }
`

const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  position: sticky;
  top: 0;
  padding-bottom: 8px;
  background: inherit;
`

const PopoverTitle = styled.div`
  font-weight: 800;
  font-size: .95rem;
  color: #cffff0;
  opacity: .95;
`

const PopoverClose = styled.button`
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  width: 26px;
  height: 26px;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  line-height: 1;
  display: grid;
  place-items: center;
  &:hover { background: rgba(255,255,255,0.12); }
`

const FrameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 8px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`

/** ================= Helpers almacenamiento seguro ================= */
const safeGet = (k: string) => {
  try { return localStorage.getItem(k) } catch { return null }
}
const safeSet = (k: string, v: string) => {
  try { localStorage.setItem(k, v) } catch {}
}

/** ================= Username: validación y unicidad local ================= */
const USERNAME_MAX = 16
const USERNAME_MIN = 3
const normalize = (s: string) => s.trim().toLowerCase()
const isValidUsername = (s: string) =>
  /^[a-z0-9_]+$/i.test(s) && s.length >= USERNAME_MIN && s.length <= USERNAME_MAX

function isUsernameTaken(username: string, currentWallet?: string | null) {
  const target = normalize(username)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith("username-")) continue
    const wallet = key.slice("username-".length)
    const value = safeGet(key) || ''
    if (normalize(value) === target && wallet !== currentWallet) {
      return true
    }
  }
  return false
}

/** ================= Avatar utils ================= */
const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

function UserModal() {
  const user = useUserStore()
  const wallet = useWallet()
  const toast = useToast()
  const walletModal = useWalletModal()
  const referral = useReferral()

  const [removing, setRemoving] = useState(false)
  const [username, setUsername] = useState('Banadegen')
  const [editing, setEditing] = useState(false)
  const [tempUsername, setTempUsername] = useState('')
  const [copied, setCopied] = useState(false)

  const publicKey = wallet.publicKey?.toBase58()

  // avatar
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)



  /** Carga inicial de username y avatar */
  useEffect(() => {
    if (!publicKey) return
    const storedUsername = safeGet(`username-${publicKey}`) || 'Banadegen'
    setUsername(storedUsername)
    setTempUsername(storedUsername)
    const storedAvatar = safeGet(`avatar-${publicKey}`) || DEFAULT_AVATAR
    setAvatarUrl(storedAvatar)
  }, [publicKey])

  /** Persistencia del username */
  useEffect(() => {
    if (publicKey) {
      safeSet(`username-${publicKey}`, username)
    }
  }, [username, publicKey])


  /** Sincronización entre pestañas */
  useEffect(() => {
    if (!publicKey) return
    const userKey = `username-${publicKey}`
    const avatarKey = `avatar-${publicKey}`
    const handler = (e: StorageEvent) => {
      if (e.key === userKey) {
        const v = safeGet(userKey) || 'Banadegen'
        setUsername(v)
        setTempUsername(v)
      }
      if (e.key === avatarKey) {
        const v = safeGet(avatarKey) || DEFAULT_AVATAR
        setAvatarUrl(v)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [publicKey])

  const saveUsername = () => {
    if (!publicKey) return
    const raw = tempUsername
    const newName = normalize(raw).replace(/\s+/g, "_")
    if (!isValidUsername(newName)) {
      toast({
        title: "❌ Invalid username",
        description: `Use letters, numbers or underscore. ${USERNAME_MIN}-${USERNAME_MAX} chars.`
      })
      return
    }
    if (isUsernameTaken(newName, publicKey)) {
      toast({ title: "❌ This username is already taken by another wallet." })
      return
    }
    setUsername(newName)
    toast({ title: "✅ Username saved." })
    setEditing(false)
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveUsername()
    if (e.key === 'Escape') {
      setTempUsername(username)
      setEditing(false)
    }
  }

  /** Copy invite con feedback */
  const copyInvite = async () => {
    const onSuccess = () => {
      setCopied(true)
      toast({
        title: '📋 Copied to clipboard',
        description: 'Your referral code has been copied!',
      })
      setTimeout(() => setCopied(false), 1500)
    }

    try {
      await referral.copyLinkToClipboard()
      onSuccess()
    } catch {
      try {
        const url = referral.getLink?.() || window.location.href
        const ta = document.createElement('textarea')
        ta.value = url
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        onSuccess()
      } catch (e) {
        toast({ title: '❌ Error copying referral', description: String(e) })
      }
    }
  }

  const revokeInvite = async () => {
    try {
      setRemoving(true)
      await referral.removeReferral()
      toast({ title: 'Referral revoked' })
    } catch (e) {
      toast({ title: '❌ Error revoking referral', description: String(e) })
    } finally {
      setRemoving(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await wallet.disconnect()
      user.set({ userModal: false })
      toast({ title: '👋 Wallet disconnected' })
    } catch (e) {
      toast({ title: '❌ Error disconnecting', description: String(e) })
    }
  }

  /** ============ Avatar handlers ============ */
  const handlePickFile = () => fileInputRef.current?.click()

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) {
        toast({ title: '❌ Invalid file', description: 'Please select an image.' })
        return
      }
      const dataUrl = await fileToDataUrl(file)
      setAvatarUrl(dataUrl)
      if (publicKey) safeSet(`avatar-${publicKey}`, dataUrl)
      toast({ title: '🖼️ Avatar updated' })
    } catch (err) {
      toast({ title: '❌ Error updating avatar', description: String(err) })
    } finally {
      if (e.target) e.target.value = ''
    }
  }

  const onPasteUrl = async () => {
    const url = window.prompt('Paste an image URL')
    if (!url) return
    try {
      if (!/^https?:\/\//i.test(url)) throw new Error('Invalid URL')
      setAvatarUrl(url)
      if (publicKey) safeSet(`avatar-${publicKey}`, url)
      toast({ title: '🖼️ Avatar updated from URL' })
    } catch {
      toast({ title: '❌ Invalid URL', description: 'Please paste a valid http or https URL.' })
    }
  }

  const onAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR
  }

  const isNewUser = (username === 'Banadegen' && avatarUrl === DEFAULT_AVATAR)

  return (
    <Modal className="user-modal-wrapper" onClose={() => user.set({ userModal: false })}>
      <GlobalFixes />
      <ModalCard>
        {/* Header de perfil */}
        <ProfileHeader>
          <AvatarWrap>
            <AvatarFrame className="none">
              <AvatarImg src={avatarUrl} alt="Avatar" onError={onAvatarError} />
            </AvatarFrame>
            <OnlineDot />
          </AvatarWrap>

          <HeaderRight>
            <UserRow>
              <UsernameBlock>
                {editing ? (
                  <>
                    <UsernameInput
                      aria-label="Username"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      onKeyDown={onInputKeyDown}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <IconBtn aria-label="Save username" onClick={saveUsername}>💾</IconBtn>
                      <IconBtn aria-label="Cancel edit" onClick={() => { setTempUsername(username); setEditing(false) }}>✖️</IconBtn>
                    </div>
                  </>
                ) : (
                  <UsernamePill title={`@${username}`} onClick={() => setEditing(true)}>
                    @{username} ✏️
                  </UsernamePill>
                )}

                {!editing && (
                  <UserChip>{isNewUser ? 'NEW USER' : 'BANADEGEN'}</UserChip>
                )}
              </UsernameBlock>
            </UserRow>

            {publicKey && (
              <WalletRow>
                {truncateString(publicKey, 6, 3)}
                {wallet.wallet?.adapter.icon && (
                  <img src={wallet.wallet.adapter.icon} alt="wallet-icon" style={{ height: 18, borderRadius: 4 }} />
                )}
              </WalletRow>
            )}

            {/* Acciones de avatar */}
            <PillRow>
              <PillButton onClick={handlePickFile}>📤 Change Avatar</PillButton>

              {/* <PillButton onClick={onPasteUrl}>🔗 Use URL</PillButton> */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: 'none' }}
              />
            </PillRow>
          </HeaderRight>
        </ProfileHeader>


        {/* Logros/Achievements */}
        <AchievementsSection>
          <h4 style={{ margin: '0 0 12px 0', color: '#ffffff', fontSize: '16px', textAlign: 'center' }}>
            🏆 Achievements
          </h4>
          <AchievementGrid>
            <AchievementItem $unlocked={true}>
              <AchievementIcon>🎯</AchievementIcon>
              <AchievementName>First Bet</AchievementName>
              <AchievementDesc>Place your first bet</AchievementDesc>
            </AchievementItem>
            <AchievementItem $unlocked={false}>
              <AchievementIcon>💰</AchievementIcon>
              <AchievementName>High Roller</AchievementName>
              <AchievementDesc>Bet 100 SOL total</AchievementDesc>
            </AchievementItem>
            <AchievementItem $unlocked={false}>
              <AchievementIcon>🔥</AchievementIcon>
              <AchievementName>Win Streak</AchievementName>
              <AchievementDesc>Win 10 games in a row</AchievementDesc>
            </AchievementItem>
            <AchievementItem $unlocked={false}>
              <AchievementIcon>👥</AchievementIcon>
              <AchievementName>Social</AchievementName>
              <AchievementDesc>Invite 5 friends</AchievementDesc>
            </AchievementItem>
            <AchievementItem $unlocked={true}>
              <AchievementIcon>🎨</AchievementIcon>
              <AchievementName>Custom Avatar</AchievementName>
              <AchievementDesc>Set a custom avatar</AchievementDesc>
            </AchievementItem>
            <AchievementItem $unlocked={false}>
              <AchievementIcon>👑</AchievementIcon>
              <AchievementName>VIP</AchievementName>
              <AchievementDesc>Reach VIP status</AchievementDesc>
            </AchievementItem>
          </AchievementGrid>
        </AchievementsSection>

        {/* Sección de acciones principales */}
        <Section>
          <GambaUi.Button main onClick={copyInvite} disabled={copied} aria-live="polite">
            {copied ? '✅ Copied!' : '💸 Copy invite link'}
          </GambaUi.Button>

          <SubtleText>
            Share your link with new users to earn {(PLATFORM_REFERRAL_FEE * 100).toFixed(2)}% every time they play on this platform.
          </SubtleText>

          {PLATFORM_ALLOW_REFERRER_REMOVAL && referral.recipient && (
            <>
              <GambaUi.Button disabled={removing} onClick={revokeInvite}>
                {removing ? 'Revoking...' : 'Revoke invite'}
              </GambaUi.Button>
              <SubtleText>
                You were invited by <a target="_blank" href={`https://solscan.io/account/${referral.recipient}`} rel="noreferrer">{referral.recipient.toString()}</a>
              </SubtleText>
            </>
          )}

          <PillButton onClick={disconnectWallet}>🚪 Disconnect</PillButton>
        </Section>
      </ModalCard>
    </Modal>
  )
}

const UserButtonContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #00ff88;
    transform: scale(1.05);
  }
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  cursor: pointer;

  &:hover .username {
    color: #00ff88;
  }
`

const Username = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  transition: color 0.2s ease;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const WalletAddress = styled.div`
  font-size: 12px;
  color: #b0b3c1;
  font-family: 'JetBrains Mono', monospace;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const StatusDot = styled.div<{ $online: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$online ?
    'radial-gradient(circle at center, #23a55a 0%, #178a48 60%, #0f5c3a 100%)' :
    '#747f8d'};
  position: absolute;
  bottom: 0;
  right: 0;
  border: 2px solid #2f3136;
  box-shadow: 0 0 6px ${props => props.$online ? '#23a55a' : 'transparent'};
`

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()
  const user = useUserStore()

  const connect = async () => {
    console.log('Connect button clicked!')
    try {
      if (wallet.connecting) {
        console.log('Already connecting...')
        return
      }
      if (wallet.wallet) {
        console.log('Wallet exists, attempting to connect...')
        await wallet.connect()
      } else {
        console.log('No wallet, opening modal...')
        walletModal.setVisible(true)
      }
    } catch (e) {
      console.error('Error connecting wallet:', e)
    }
  }

  // Obtener avatar del localStorage
  const getAvatar = () => {
    const publicKey = wallet.publicKey?.toBase58()
    if (publicKey) {
      try {
        return localStorage.getItem(`avatar-${publicKey}`) || DEFAULT_AVATAR
      } catch {
        return DEFAULT_AVATAR
      }
    }
    return DEFAULT_AVATAR
  }

  // Obtener username del localStorage
  const getUsername = () => {
    const publicKey = wallet.publicKey?.toBase58()
    if (publicKey) {
      try {
        return localStorage.getItem(`username-${publicKey}`) || 'Banadegen'
      } catch {
        return 'Banadegen'
      }
    }
    return 'Banadegen'
  }

  const handleUserClick = () => {
    if (wallet.connected) {
      user.set({ userModal: true })
    }
  }

  return (
    <>
      {wallet.connected && user.userModal && <UserModal />}
      {wallet.connected ? (
        <UserButtonContainer onClick={handleUserClick} style={{ cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <UserAvatar
              src={getAvatar()}
              alt="User avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR
              }}
            />
            <StatusDot $online={true} />
          </div>
          <UserInfo>
            <Username className="username">{getUsername()}</Username>
            <WalletAddress>
              {wallet.wallet?.adapter.name || 'Wallet'}
            </WalletAddress>
          </UserInfo>
        </UserButtonContainer>
      ) : (
        <GambaUi.Button onClick={connect}>
          {wallet.connecting ? 'Connecting...' : 'Connect Wallet'}
        </GambaUi.Button>
      )}
    </>
  )
}
