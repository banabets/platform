import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi, useReferral } from 'gamba-react-ui-v2'
import React, { useState, useEffect } from 'react'
import { Modal } from '../components/Modal'
import { PLATFORM_ALLOW_REFERRER_REMOVAL, PLATFORM_REFERRAL_FEE } from '../constants'
import { useToast } from '../hooks/useToast'
import { useUserStore } from '../hooks/useUserStore'
import { truncateString } from '../utils'

const avatarImage = "https://i.ibb.co/CppmNbXW/user.png"

function isUsernameTaken(username, currentWallet) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("username-")) {
      const wallet = key.replace("username-", "")
      const value = localStorage.getItem(key)
      if (value === username && wallet !== currentWallet) {
        return true
      }
    }
  }
  return false
}

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

  const publicKey = wallet.publicKey?.toBase58()

  useEffect(() => {
    if (!publicKey) return
    const storedUsername = localStorage.getItem(`username-${publicKey}`) || 'Banadegen'
    setUsername(storedUsername)
    setTempUsername(storedUsername)
  }, [publicKey])

  useEffect(() => {
    if (publicKey) {
      localStorage.setItem(`username-${publicKey}`, username)
    }
  }, [username, publicKey])

  const saveUsername = () => {
    if (!publicKey || tempUsername.trim() === '') return
    const newName = tempUsername.trim()
    if (isUsernameTaken(newName, publicKey)) {
      toast({ title: "❌ This username is already taken by another wallet." })
      return
    }
    setUsername(newName)
    toast({ title: "✅ Username saved." })
    setEditing(false)
  }

  const copyInvite = () => {
    try {
      referral.copyLinkToClipboard()
      toast({
        title: '📋 Copied to clipboard',
        description: 'Your referral code has been copied!',
      })
    } catch (e) {
      toast({ title: '❌ Error copying referral', description: String(e) })
      walletModal.setVisible(true)
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
      toast({ title: '👋 Wallet disconnected' })
    } catch (e) {
      toast({ title: '❌ Error disconnecting', description: String(e) })
    }
  }

  return (
    <Modal onClose={() => user.set({ userModal: false })}>
      <div style={{ 
        textAlign: 'center', 
        marginTop: '12px',
        background: 'rgba(0, 0, 0, 0.4)', 
        borderRadius: '16px',
        boxShadow: '0 0 20px rgba(0,255,136,0.3)',
        padding: '16px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '6px'
        }}>
          <img
            src={avatarImage}
            alt="Avatar"
            height="90"
            style={{
              borderRadius: '20px',
              border: '2px solid #00ff88',
              boxShadow: '0 0 12px #00ff88, 0 0 20px #00ff88'
            }}
          />
          <div style={{
            backgroundColor: '#fde047',
            color: '#000',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            NEW USER
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: 2 }}>
          {editing ? (
            <>
              <input
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'transparent',
                  border: '1px solid #888',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  outline: 'none',
                  textAlign: 'center'
                }}
              />
              <button onClick={saveUsername} style={{ fontSize: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                💾
              </button>
            </>
          ) : (
            <span
              style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00ff88', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
              onClick={() => setEditing(true)}
            >
              @{username} ✏️
            </span>
          )}
        </div>

        {publicKey && (
          <div style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#fff',
            marginTop: '6px', marginBottom: '16px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {truncateString(publicKey, 6, 3)}
            {wallet.wallet?.adapter.icon && (
              <img src={wallet.wallet.adapter.icon} alt="wallet-icon" style={{ height: '20px', borderRadius: '4px' }} />
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', width: '100%', padding: '8px 20px' }}>
          <GambaUi.Button main onClick={copyInvite}>
            💸 Copy invite link
          </GambaUi.Button>
          <div style={{ opacity: '.8', fontSize: '80%' }}>
            Share your link with new users to earn {(PLATFORM_REFERRAL_FEE * 100)}% every time they play on this platform.
          </div>

          {PLATFORM_ALLOW_REFERRER_REMOVAL && referral.recipient && (
            <>
              <GambaUi.Button disabled={removing} onClick={revokeInvite}>
                {removing ? 'Revoking...' : 'Revoke invite'}
              </GambaUi.Button>
              <div style={{ opacity: '.8', fontSize: '80%' }}>
                You were invited by <a target="_blank" href={`https://solscan.io/account/${referral.recipient}`} rel="noreferrer">{referral.recipient.toString()}</a>
              </div>
            </>
          )}

          <GambaUi.Button onClick={disconnectWallet}>
            Disconnect
          </GambaUi.Button>
        </div>
      </div>
    </Modal>
  )
}

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()
  const user = useUserStore()

  const connect = () => {
    try {
      if (wallet.wallet) {
        wallet.connect()
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
