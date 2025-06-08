import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useUserStore } from '../../hooks/useUserStore'

const images = [
  'https://i.ibb.co/RVL7hgK/20250504-0532-Banner-Casino-y-Bananas-remix-01jtda67f2ed293kxf2tgp2dew-min.png',
  'https://i.ibb.co/hJdCLX3X/20250504-0528-Casino-On-Chain-Colorido-remix-01jtd9y2khe4mv2ezp31n5d7h8-min.png',
]

const isMobile = window.innerWidth < 800

const Welcome = styled.div`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  height: 300px;
  filter: drop-shadow(0 4px 3px rgba(0,0,0,.07)) drop-shadow(0 2px 2px rgba(0,0,0,.06));

  @media (min-width: 800px) {
    height: 400px;
  }

  & .content {
    position: absolute;
    z-index: 2;
    text-align: center;
    color: white;
    width: 100%;
  }

  .mobile-only-text {
    @media (min-width: 800px) {
      display: none;
    }
  }
`

const BackgroundImage = styled.div<{ url: string }>`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url(${p => p.url});
  background-size: cover;
  background-position: center;
  transition: background-image 0.5s ease-in-out;
  z-index: 1;
  pointer-events: none;
`

const Arrows = styled.div`
  position: absolute;
  z-index: 3;
  width: 100%;
  top: 50%;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  transform: translateY(-50%);
  user-select: none;

  button {
    background: rgba(0,0,0,0.4);
    color: yellow;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    padding: 10px;
    cursor: pointer;
  }
`

const Buttons = styled.div`
  display: grid;
margin: -20px auto 10px; /* ⬅️ 10px arriba, 40px abajo */
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 20px;
  width: 100%;

  & > button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    border: none;
    border-radius: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 16px;
    font-weight: 600;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: scale(1.05);
    }

    @media (max-width: 500px) {
      font-size: 14px;
      padding: 10px 12px;
    }
  }
`


export function WelcomeBanner() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const store = useUserStore()

  const [index, setIndex] = useState(() => isMobile ? 0 : 1)

  const next = () => {
    let nextIndex = (index + 1) % images.length
    if (!isMobile && nextIndex === 0) nextIndex = 1
    setIndex(nextIndex)
  }

  const prev = () => {
    let prevIndex = (index - 1 + images.length) % images.length
    if (!isMobile && prevIndex === 0) prevIndex = images.length - 1
    setIndex(prevIndex)
  }

  const copyInvite = () => {
    store.set({ userModal: true })
    if (!wallet.connected) {
      walletModal.setVisible(true)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        let next = (prev + 1) % images.length
        if (!isMobile && next === 0) return 1
        return next
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <Buttons>
        <button onClick={() => window.open('https://discord.gg/banabets', '_blank')}>
          💬 DISCORD
        </button>
        <button onClick={() => window.open('https://x.com/banabets', '_blank')}>
          🚀 TWITTER
        </button>
        <button onClick={() => window.open('https://t.me/banabets', '_blank')}>
          🤖 TELEGRAM
        </button>
        <button onClick={() => window.open('https://docs.banabets.com', '_blank')}>
          📜 DOCS
        </button>
      </Buttons>

      <Welcome>
        <BackgroundImage url={images[index]} />
        <div className="content">
          {index === 0 && (
            <h1 className="mobile-only-text">GET THOSE SOLANA'S WITH YOUR BANANAS! 🍌</h1>
          )}
        </div>
        <Arrows>
          <button onClick={prev}>⬅️</button>
          <button onClick={next}>➡️</button>
        </Arrows>
      </Welcome>
    </div>
  )
}
