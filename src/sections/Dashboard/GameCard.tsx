import { GameBundle } from 'gamba-react-ui-v2'
import React, { useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useGamePreloader } from '../../hooks/useGamePreloader'
import { useAnalytics } from '../../hooks/useAnalytics'

const tileAnimation = keyframes`
  0% {
  background-position: -100px 100px;
  }
  100% {
    background-position: 100px -100px;
  }
`


const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(167, 139, 250, 0.3), 0 0 40px rgba(255, 228, 45, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(167, 139, 250, 0.5), 0 0 60px rgba(255, 228, 45, 0.4);
  }
`

const particleFloat = keyframes`
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg) scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: translateY(0) rotate(360deg) scale(1);
    opacity: 0.6;
  }
`

const StyledGameCard = styled(NavLink)<{$small: boolean, $background: string}>`
  width: 100%;
  position: relative;

  @media (min-width: 800px) {
    width: 100%;
  }

  aspect-ratio: ${(props) => props.$small ? '1/.9' : '1/.9'};
  border-radius: 20px;

  color: white;
  text-decoration: none;
  font-size: 24px;

  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1);
  background: ${(props) => props.$background};
  max-height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 0;
  flex-shrink: 0;
  background-size: 100% auto;
  background-position: center;
  font-weight: bold;

  /* Contenedor principal con gradientes premium */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 30%,
      rgba(0, 0, 0, 0.2) 70%,
      rgba(0, 0, 0, 0.7) 100%
    );
    border-radius: 20px;
    z-index: 1;
  }

  /* Efecto de borde animado premium */
  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #ffe42d);
    background-size: 400% 400%;
    border-radius: 23px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s ease;
    animation: ${glowPulse} 3s ease-in-out infinite;
  }

  /* Partículas decorativas */
  span.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 228, 45, 0.8);
    border-radius: 50%;
    pointer-events: none;
    animation: ${particleFloat} 4s ease-in-out infinite;
    z-index: 2;
  }

  span.particle:nth-child(1) { top: 20%; left: 80%; animation-delay: 0s; }
  span.particle:nth-child(2) { top: 60%; left: 20%; animation-delay: 1s; background: rgba(167, 139, 250, 0.8); }
  span.particle:nth-child(3) { top: 40%; left: 60%; animation-delay: 2s; background: rgba(255, 105, 180, 0.8); }

  & > .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-position: center;
    background-image: url(/stuff.png);
    background-repeat: repeat;
    transition: all 0.4s ease;
    animation: ${tileAnimation} 5s linear infinite;
    opacity: 0.3;
    border-radius: 20px;
    z-index: 0;
  }

  & > .image {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-size: 100% auto;
    background-position: center;
    background-repeat: no-repeat;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-12px) scale(1.03);
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.4),
      0 0 30px rgba(167, 139, 250, 0.3),
      0 0 60px rgba(255, 228, 45, 0.2);

    .image {
      transform: scale(1.08);
      filter: brightness(1.1) contrast(1.1);
    }

    .background {
      opacity: 0.6;
      animation-duration: 3s;
    }

    &::after {
      opacity: 1;
    }

    span.particle {
      animation-duration: 2s;
      opacity: 1;
    }
  }

  .play {
    font-size: 14px;
    font-weight: 700;
    border-radius: 12px;
    padding: 10px 20px;
    background: linear-gradient(135deg, rgba(255, 228, 45, 0.9) 0%, rgba(255, 215, 0, 0.8) 100%);
    position: absolute;
    right: 16px;
    bottom: 16px;
    opacity: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(255, 228, 45, 0.4);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(15px) scale(0.9);
    z-index: 3;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
  }

  &:hover .play {
    opacity: 1;
    transform: translateY(0) scale(1);
    box-shadow: 0 6px 20px rgba(255, 228, 45, 0.6);
  }

`

export function GameCard({ game, index = 0 }: {game: GameBundle, index?: number}) {
  const small = useLocation().pathname !== '/'
  const { preloadOnHover } = useGamePreloader()
  const { trackEngagement } = useAnalytics()
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    // Limpiar timeout anterior
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // Iniciar preload después de 100ms de hover
    hoverTimeoutRef.current = setTimeout(() => {
      preloadOnHover(game.id)
    }, 100)
  }

  const handleMouseLeave = () => {
    // Limpiar timeout si el usuario deja de hacer hover
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  const handleClick = () => {
    trackEngagement('click', 'game_card', game.id)
  }

  // Animación escalonada basada en el índice
  const animationDelay = `${index * 0.1}s`

  return (
    <StyledGameCard
      to={'/' + game.id}
      $small={small ?? false}
      $background={game.meta?.background}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        animation: `fadeInUp 0.6s ease-out ${animationDelay} both`
      }}
    >
      <div className="background" />
      <div className="image" style={{ backgroundImage: `url(${game.meta.image})` }} />
      <span className="particle" />
      <span className="particle" />
      <span className="particle" />
      <div className="play">Play {game.meta.name}</div>
    </StyledGameCard>
  )
}
