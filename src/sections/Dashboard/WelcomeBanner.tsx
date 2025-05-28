import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useUserStore } from '../../hooks/useUserStore'

const images = [
  'https://iili.io/30VoMKJ.png',
  'https://i.ibb.co/qt8xHzR/20250504-0532-Banner-Casino-y-Bananas-remix-01jtda67f2ed293kxf2tgp2dew.png',
  'https://i.ibb.co/n8qDLxwX/20250504-0528-Casino-On-Chain-Colorido-remix-01jtd9y2khe4mv2ezp31n5d7h8.png',
]

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
  margin-bottom: 20px; /* Espacio entre botones y el banner */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;

  & > button {
    border: none;
    border-radius: 10px;
    padding: 10px 15px;
    background: rgba(0,0,0,0.4); 
    color: white;
    font-size: 17px;
    cursor: pointer;
    transition: background .2s ease;
    &:hover {
      background: rgba(0,0,0,0.6);
    }
  }
`
export function WelcomeBanner() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const store = useUserStore()

  const [index, setIndex] = useState(2) // Comienza con la tercera imagen

  const next = () => setIndex((index + 1) % images.length)
  const prev = () => setIndex((index - 1 + images.length) % images.length)

  const copyInvite = () => {
    store.set({ userModal: true })
    if (!wallet.connected) {
      walletModal.setVisible(true)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Botones arriba del banner */}
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

      {/* Banner principal */}
      <Welcome>
        <BackgroundImage url={images[index]} />
        <div className="content">
          {index === 0 && <h1>GET THOSE SOLANA'S WITH YOUR BANANAS! 🍌</h1>}
        </div>
        <Arrows>
          <button onClick={prev}>⬅️</button>
          <button onClick={next}>➡️</button>
        </Arrows>
      </Welcome>
    </div>
  )
}
