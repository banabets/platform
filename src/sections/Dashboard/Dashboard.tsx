import React from 'react'
import styled from 'styled-components'
import { SlideSection } from '../../components/Slider'
import { SuspenseBoundary } from '../../components/SuspenseBoundary'
import { GAMES } from '../../games'
import { useGamePreloader } from '../../hooks/useGamePreloader'
import { GameCard } from './GameCard'
import { WelcomeBanner } from './WelcomeBanner'

// Componente para la noticia HOT
const HotNewsContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: -5px auto 5px auto;
  padding: 0 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-top: 10px;
    padding: 0 10px;
    margin-bottom: 3px;
  }
`

const HotNewsBar = styled.div`
  background: linear-gradient(135deg, rgba(24, 25, 28, 0.6), rgba(32, 34, 37, 0.5));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 215, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 228, 45, 0.2), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 8px;
  }
`

const HotTag = styled.div`
  background: linear-gradient(135deg, #ff4500, #ff8c00);
  color: white;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 2px solid rgba(255, 215, 0, 0.8);
  box-shadow: 0 2px 8px rgba(255, 69, 0, 0.5);
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 8px;
  }
`

const HotText = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  text-align: center;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`

const HotIcon = styled.div`
  font-size: 18px;
  animation: bounce 2s ease-in-out infinite;
  flex-shrink: 0;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-3px); }
    60% { transform: translateY(-2px); }
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const HotNews = () => (
  <HotNewsContainer>
    <HotNewsBar>
      <HotTag>HOT</HotTag>
      <HotText>POKER NIGHT ONLINE COMING SOON</HotText>
      <HotIcon>🎰</HotIcon>
    </HotNewsBar>
  </HotNewsContainer>
)

export function GameSlider() {
  const { popularGames } = useGamePreloader()

  return (
    <SuspenseBoundary type="dashboard">
      <SlideSection>
        {GAMES.map((game) => (
          <div key={game.id} style={{ width: '160px', display: 'flex' }}>
            <GameCard game={game} />
          </div>
        ))}
      </SlideSection>
    </SuspenseBoundary>
  )
}

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 600px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 800px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

export function GameGrid() {
  return (
    <SuspenseBoundary type="dashboard">
      <Grid>
        {GAMES.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </Grid>
    </SuspenseBoundary>
  )
}

export default function Dashboard() {
  // Inicializar preloader para juegos populares
  useGamePreloader()

  return (
    <>
      <HotNews />
      <WelcomeBanner />
      <h2 style={{ textAlign: 'center' }}>Games</h2>
      <GameGrid />
    </>
  )
}
