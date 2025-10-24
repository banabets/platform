import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

// Animaciones divertidas
const bounceIn = keyframes`
  0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.05) rotate(2deg); opacity: 0.8; }
  70% { transform: scale(0.95) rotate(-1deg); opacity: 0.9; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`

const pokerShake = keyframes`
  0%, 100% { transform: translateX(0) rotate(0deg); }
  10% { transform: translateX(-2px) rotate(-1deg); }
  20% { transform: translateX(2px) rotate(1deg); }
  30% { transform: translateX(-2px) rotate(-1deg); }
  40% { transform: translateX(2px) rotate(1deg); }
  50% { transform: translateX(-1px) rotate(-0.5deg); }
  60% { transform: translateX(1px) rotate(0.5deg); }
  70% { transform: translateX(-1px) rotate(-0.5deg); }
  80% { transform: translateX(1px) rotate(0.5deg); }
  90% { transform: translateX(-0.5px) rotate(-0.2deg); }
`

const cardsFloat = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(1deg); }
  50% { transform: translateY(-8px) rotate(-1deg); }
  75% { transform: translateY(-3px) rotate(0.5deg); }
`

const chipsDance = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  33% { transform: translateY(-3px) scale(1.05); }
  66% { transform: translateY(-6px) scale(0.95); }
`

const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.15), inset 0 0 10px rgba(255, 215, 0, 0.05);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2), inset 0 0 15px rgba(255, 215, 0, 0.08);
  }
`

// Estilos del componente
const AnnouncementContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  display: ${props => props.$isVisible ? 'block' : 'none'};
  animation: ${bounceIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
`

const AnnouncementCard = styled.div`
  background: linear-gradient(135deg, rgba(26, 29, 41, 0.3) 0%, rgba(42, 45, 57, 0.25) 50%, rgba(26, 29, 41, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  padding: 30px;
  max-width: 450px;
  width: 90vw;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.2),
    0 0 60px rgba(255, 215, 0, 0.1),
    0 0 90px rgba(255, 215, 0, 0.05),
    inset 0 0 15px rgba(255, 215, 0, 0.02);
  animation: ${glowPulse} 4s ease-in-out infinite;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(255, 237, 78, 0.2), rgba(255, 215, 0, 0.3), rgba(255, 237, 78, 0.2));
    background-size: 400% 400%;
    animation: gradientRotate 6s ease-in-out infinite;
    border-radius: 22px;
    z-index: -1;
    opacity: 0.6;
  }

  @keyframes gradientRotate {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  color: rgba(255, 215, 0, 0.8);
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 215, 0, 0.15);
    border-color: rgba(255, 237, 78, 0.6);
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }

  &:active {
    transform: scale(0.95) rotate(90deg);
  }
`

const PokerEmoji = styled.div`
  font-size: 48px;
  text-align: center;
  margin-bottom: 10px;
  animation: ${pokerShake} 2s ease-in-out infinite;
`

const Title = styled.h2`
  color: rgba(255, 215, 0, 0.9);
  font-size: 28px;
  font-weight: 900;
  text-align: center;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow:
    0 0 8px rgba(255, 215, 0, 0.5),
    0 0 15px rgba(255, 215, 0, 0.3),
    0 0 20px rgba(255, 215, 0, 0.2);
  animation: ${pokerShake} 4s ease-in-out infinite;
`

const Subtitle = styled.p`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`

const GameIcon = styled.div`
  font-size: 60px;
  text-align: center;
  margin: 15px 0;
  animation: ${cardsFloat} 4s ease-in-out infinite;
`

const ComingSoon = styled.div`
  background: linear-gradient(45deg, #ff6b35, #f7931e, #ff6b35);
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite;
  color: white;
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 900;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 20px 0 10px 0;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`

const ChipsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
`

const Chip = styled.div`
  font-size: 24px;
  animation: ${chipsDance} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.3s; }
  &:nth-child(3) { animation-delay: 0.6s; }
  &:nth-child(4) { animation-delay: 0.9s; }
  &:nth-child(5) { animation-delay: 1.2s; }
`

const PokerAnnouncement: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Mostrar el anuncio después de 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <AnnouncementContainer $isVisible={isVisible}>
      <AnnouncementCard>
        <CloseButton onClick={handleClose}>×</CloseButton>

        <PokerEmoji>🃏</PokerEmoji>

        <Title>POKER NIGHT</Title>

        <GameIcon>♠️ ♥️ ♣️ ♦️</GameIcon>

        <Subtitle>GAME ONLINE</Subtitle>

        <ComingSoon>COMING SOON!</ComingSoon>

        <ChipsContainer>
          <Chip delay="0s">💰</Chip>
          <Chip delay="0.3s">🎰</Chip>
          <Chip delay="0.6s">🏆</Chip>
          <Chip delay="0.9s">🎲</Chip>
          <Chip delay="1.2s">🃏</Chip>
        </ChipsContainer>
      </AnnouncementCard>
    </AnnouncementContainer>
  )
}

export default PokerAnnouncement
