import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi, useReferral } from 'gamba-react-ui-v2'
import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { Modal } from '../components/Modal'
import { PLATFORM_ALLOW_REFERRER_REMOVAL, PLATFORM_REFERRAL_FEE } from '../constants'
import { useToast } from '../hooks/useToast'
import { useUserStore } from '../hooks/useUserStore'
import { truncateString } from '../utils'

const DEFAULT_AVATAR = "https://i.ibb.co/CppmNbXW/user.png"

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
  background: rgba(6, 10, 12, 0.55);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(0, 255, 136, 0.18);
  backdrop-filter: blur(8px);
  animation: ${glow} 4s ease-in-out infinite;
`

/** Header de perfil: avatar a la izq, info a la der */
const ProfileHeader = styled.div`
  display: grid;
  grid-template-columns: 106px 1fr;
  gap: 14px;
  align-items: center;
  margin-bottom: 12px;
`

const AvatarWrap = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`

/** Marco seleccionable tipo Discord */
const AvatarFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  display: grid;
  place-items: center;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 5px;
    background: transparent;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
  }

  &.none::before {
    display: none;
  }

  &.neon::before {
    background: linear-gradient(135deg, #00ff88, #0ff, #facc15, #f472b6);
    background-size: 300% 300%;
    animation: neonShift 6s ease infinite;
    box-shadow: 0 0 18px rgba(0,255,136,.25);
  }

  &.gold::before {
    background: linear-gradient(135deg, #f59e0b, #facc15, #f59e0b);
    box-shadow: 0 0 18px rgba(250,204,21,.35), inset 0 0 10px rgba(0,0,0,.25);
  }

  &.fire::before {
    background: conic-gradient(from 0deg, #ff4d00, #ff9900, #ffd000, #ff4d00);
    box-shadow: 0 0 18px rgba(255,102,0,.35);
  }

  &.cyber::before {
    background: linear-gradient(135deg, #00e5ff, #00ff88);
    box-shadow: 0 0 14px rgba(0,229,255,.35), inset 0 0 8px rgba(0,255,136,.25);
  }

  @keyframes neonShift {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
  }
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
`

const UserRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 8px;
  row-gap: 6px;
  min-width: 0;
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

const UsernameInput = styled.input`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: rgba(255,255,255,0.04);
  border: 1px solid #2f2f2f;
  border-radius: 8px;
  padding: 6px 10px;
  outline: none;
  text-align: center;
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
`

const PillRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
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
  min-width: 260px;
  max-width: min(92vw, 360px);
  padding: 12px;
  border-radius: 14px;
  background: rgba(10, 14, 18, 0.96);
  border: 1px solid rgba(0,255,136,0.25);
  box-shadow: 0 10px 24px rgba(0,0,0,.45), 0 0 16px rgba(0,255,136,.15);
  backdrop-filter: blur(6px);
  z-index: 9999;
  animation: popIn .12s ease-out;
  overflow: hidden;

  @keyframes popIn {
    from { transform: translateY(-4px); opacity: .0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  &:before {
    content: "";
    position: absolute;
    top: -8px;
    left: 16px;
    width: 14px;
    height: 14px;
    background: inherit;
    border-left: 1px solid rgba(0,255,136,0.25);
    border-top: 1px solid rgba(0,255,136,0.25);
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

  // marco seleccionable
  const [selectedFrame, setSelectedFrame] = useState<'none' | 'neon' | 'gold' | 'fire' | 'cyber'>('none')

  // popover de marcos
  const [framesOpen, setFramesOpen] = useState(false)
  const framesBtnRef = React.useRef<HTMLButtonElement | null>(null)
  const popoverRef = React.useRef<HTMLDivElement | null>(null)

  /** Cierra popover en click fuera o Escape */
  useEffect(() => {
    if (!framesOpen) return
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (popoverRef.current?.contains(t)) return
      if (framesBtnRef.current?.contains(t)) return
      setFramesOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFramesOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [framesOpen])

  /** Carga inicial de username, avatar y marco */
  useEffect(() => {
    if (!publicKey) return
    const storedUsername = safeGet(`username-${publicKey}`) || 'Banadegen'
    setUsername(storedUsername)
    setTempUsername(storedUsername)
    const storedAvatar = safeGet(`avatar-${publicKey}`) || DEFAULT_AVATAR
    setAvatarUrl(storedAvatar)
    const storedFrame = (safeGet(`frame-${publicKey}`) as any) || 'none'
    setSelectedFrame(storedFrame)
  }, [publicKey])

  /** Persistencia del username */
  useEffect(() => {
    if (publicKey) {
      safeSet(`username-${publicKey}`, username)
    }
  }, [username, publicKey])

  /** Persistencia del marco */
  useEffect(() => {
    if (publicKey) safeSet(`frame-${publicKey}`, selectedFrame)
  }, [selectedFrame, publicKey])

  /** Sincronización entre pestañas */
  useEffect(() => {
    if (!publicKey) return
    const userKey = `username-${publicKey}`
    const avatarKey = `avatar-${publicKey}`
    const frameKey = `frame-${publicKey}`
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
      if (e.key === frameKey) {
        const v = (safeGet(frameKey) as any) || 'none'
        setSelectedFrame(v)
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
    <Modal onClose={() => user.set({ userModal: false })}>
      <ModalCard>
        {/* Header de perfil */}
        <ProfileHeader>
          <AvatarWrap>
            <AvatarFrame className={selectedFrame}>
              <AvatarImg src={avatarUrl} alt="Avatar" onError={onAvatarError} />
            </AvatarFrame>
            <OnlineDot />
          </AvatarWrap>

          <HeaderRight>
            <UserRow>
              {editing ? (
                <>
                  <UsernameInput
                    aria-label="Username"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    onKeyDown={onInputKeyDown}
                  />
                  <IconBtn aria-label="Save username" onClick={saveUsername}>💾</IconBtn>
                  <IconBtn aria-label="Cancel edit" onClick={() => { setTempUsername(username); setEditing(false) }}>✖️</IconBtn>
                </>
              ) : (
                <UsernamePill title={`@${username}`} onClick={() => setEditing(true)}>
                  @{username} ✏️
                </UsernamePill>
              )}

              {!editing && (
                <UserChip>{isNewUser ? 'NEW USER' : 'BANADEGEN'}</UserChip>
              )}
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

              <PopoverWrap>
                <PillButton
                  ref={framesBtnRef}
                  onClick={() => setFramesOpen(v => !v)}
                  aria-expanded={framesOpen}
                  aria-haspopup="dialog"
                >
                  🖼️ Frames
                </PillButton>

                {framesOpen && (
                  <FramePopover ref={popoverRef} role="dialog" aria-label="Choose frame">
                    <PopoverHeader>
                      <PopoverTitle>Select a frame</PopoverTitle>
                      <PopoverClose onClick={() => setFramesOpen(false)} aria-label="Close frames popover">✖</PopoverClose>
                    </PopoverHeader>
                    <FrameGrid>
                      <PillButton
                        onClick={() => { setSelectedFrame('none'); setFramesOpen(false) }}
                        aria-pressed={selectedFrame==='none'}
                      >⭕ None</PillButton>

                      <PillButton
                        onClick={() => { setSelectedFrame('neon'); setFramesOpen(false) }}
                        aria-pressed={selectedFrame==='neon'}
                      >💠 Neon</PillButton>

                      <PillButton
                        onClick={() => { setSelectedFrame('gold'); setFramesOpen(false) }}
                        aria-pressed={selectedFrame==='gold'}
                      >🏅 Gold</PillButton>

                      <PillButton
                        onClick={() => { setSelectedFrame('fire'); setFramesOpen(false) }}
                        aria-pressed={selectedFrame==='fire'}
                      >🔥 Fire</PillButton>

                      <PillButton
                        onClick={() => { setSelectedFrame('cyber'); setFramesOpen(false) }}
                        aria-pressed={selectedFrame==='cyber'}
                      >🧬 Cyber</PillButton>
                    </FrameGrid>
                  </FramePopover>
                )}
              </PopoverWrap>

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

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()
  const user = useUserStore()

  const connect = async () => {
    try {
      if (wallet.connecting) return
      if (wallet.wallet) {
        await wallet.connect()
      } else {
        walletModal.setVisible(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      {wallet.connected && user.userModal && <UserModal />}
      {wallet.connected ? (
        <div style={{ position: 'relative' }}>
          <GambaUi.Button onClick={() => user.set({ userModal: true })}>
            <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
              <img src={wallet.wallet?.adapter.icon} height="20px" alt="wallet-icon" style={{ borderRadius: '4px' }} />
              {truncateString(wallet.publicKey?.toBase58(), 3)}
            </div>
          </GambaUi.Button>
        </div>
      ) : (
        <GambaUi.Button onClick={connect}>
          {wallet.connecting ? 'Connecting...' : 'Connect'}
        </GambaUi.Button>
      )}
    </>
  )
}
