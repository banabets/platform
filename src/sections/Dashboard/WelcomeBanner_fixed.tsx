import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useUserStore } from '../../hooks/useUserStore'

const images = [

  'https://i.ibb.co/hJdCLX3X/20250504-0528-Casino-On-Chain-Colorido-remix-01jtd9y2khe4mv2ezp31n5d7h8-min.png',
 'https://i.ibb.co/RVL7hgK/20250504-0532-Banner-Casino-y-Bananas-remix-01jtda67f2ed293kxf2tgp2dew-min.png',

]

const isMobile = window.innerWidth < 800

const Welcome = styled.div`
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 24px;
  height: 320px;
  background:
    linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%),
    linear-gradient(45deg, rgba(167, 139, 250, 0.1) 0%, transparent 50%, rgba(255, 228, 45, 0.08) 100%);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 0 50px rgba(167, 139, 250, 0.1);
  animation: fadeInScale 1s ease-out;
  transition: all 0.3s ease;

  &:hover {
    box-shadow:
      0 16px 50px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      0 0 70px rgba(167, 139, 250, 0.15);
    transform: translateY(-2px);
  }

  @media (min-width: 800px) {
    height: 450px;
    padding: 32px;
  }

  /* Overlay gradiente premium */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.3) 30%,
        rgba(0, 0, 0, 0.2) 70%,
        rgba(0, 0, 0, 0.6) 100%
      ),
      radial-gradient(
        circle at center,
        rgba(167, 139, 250, 0.05) 0%,
        transparent 60%
      );
    z-index: 1;
    animation: overlayPulse 8s ease-in-out infinite;
  }

  /* Partículas decorativas */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      radial-gradient(circle at 80% 20%, rgba(255, 228, 45, 0.08) 1px, transparent 1px),
      radial-gradient(circle at 40% 40%, rgba(167, 139, 250, 0.06) 1px, transparent 1px);
    background-size: 40px 40px, 35px 35px, 50px 50px;
    z-index: 2;
  }

  & .content {
    position: absolute;
    z-index: 4;
    text-align: center;
    color: white;
    width: 100%;
    text-shadow: 0 3px 8px rgba(0, 0, 0, 0.7);
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
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  pointer-events: none;

  /* Efecto de zoom sutil */
  animation: imageZoom 15s ease-in-out infinite;

  @keyframes imageZoom {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`

const Arrows = styled.div`
  position: absolute;
  z-index: 5;
  width: 100%;
  top: 50%;
  display: flex;
  justify-content: space-between;
  padding: 0 15px;
  transform: translateY(-50%);
  user-select: none;

  button {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    color: #ffe42d;
    border: 1px solid rgba(255, 228, 45, 0.3);
    border-radius: 50%;
    font-size: 18px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    &:hover {
      background: rgba(255, 228, 45, 0.1);
      border-color: rgba(255, 228, 45, 0.5);
      box-shadow: 0 6px 20px rgba(255, 228, 45, 0.2);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  @media (max-width: 600px) {
    padding: 0 10px;

    button {
      padding: 10px;
      font-size: 16px;
    }
  }
`

const ImageIndicators = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 4;

  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: #ffe42d;
      transform: scale(1.2);
      box-shadow: 0 0 8px rgba(255, 228, 45, 0.5);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.7);
      transform: scale(1.1);
    }
  }

  @media (max-width: 600px) {
    bottom: 15px;
    gap: 6px;

    .indicator {
      width: 6px;
      height: 6px;
    }
  }
`

export function WelcomeBanner() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const store = useUserStore()

  const [currentImage, setCurrentImage] = useState(() => isMobile ? 0 : 1)

  const next = () => {
    let nextIndex = (currentImage + 1) % images.length
    if (!isMobile && nextIndex === 0) nextIndex = 1
    setCurrentImage(nextIndex)
  }

  const prev = () => {
    let prevIndex = (currentImage - 1 + images.length) % images.length
    if (!isMobile && prevIndex === 0) prevIndex = images.length - 1
    setCurrentImage(prevIndex)
  }

  const copyInvite = () => {
    store.set({ userModal: true })
    if (!wallet.connected) {
      walletModal.setVisible(true)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => {
        let next = (prev + 1) % images.length
        if (!isMobile && next === 0) return 1
        return next
      })
    }, 6000)
    return () => clearInterval(interval)
  }, [isMobile])

  return (
    <div>

      <Welcome>
        <BackgroundImage url={images[currentImage]} />
        <div className="content">
          {currentImage === 0 && (
            <h1 className="mobile-only-text"></h1>
          )}
        </div>
        <Arrows>
          <button onClick={prev}>⬅️</button>
          <button onClick={next}>➡️</button>
        </Arrows>

        <ImageIndicators>
          {images.map((_, index) => (
            <div
              key={index}
              className={"indicator " + (index === currentImage ? 'active' : '')}
              onClick={() => setCurrentImage(index)}
            />
          ))}
        </ImageIndicators>
      </Welcome>
    </div>
  )
}
