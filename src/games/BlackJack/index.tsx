import { GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import React, { useState, useEffect } from 'react'
import { CARD_VALUES, RANKS, RANK_SYMBOLS, SUIT_COLORS, SUIT_SYMBOLS, SUITS, SOUND_CARD, SOUND_LOSE, SOUND_PLAY, SOUND_WIN, SOUND_JACKPOT } from './constants'
import { Card, CardContainer, CardsContainer, Container, Profit, CardArea, HandValue } from './styles'

// Componente de partículas para efectos visuales
const ParticleEffect = ({ active, color, count = 20 }: { active: boolean; color: string; count?: number }) => {
  const [particles, setParticles] = React.useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; life: number }>>([])

  React.useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 50,
        vx: (Math.random() - 0.5) * 4,
        vy: -(Math.random() * 3 + 2),
        life: 1
      }))
      setParticles(newParticles)

      const interval = setInterval(() => {
        setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.1, // gravity
          life: p.life - 0.02
        })).filter(p => p.life > 0))
      }, 16)

      return () => clearInterval(interval)
    } else {
      setParticles([])
    }
  }, [active, color, count])

  if (!active) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: '8px',
            height: '8px',
            background: color,
            borderRadius: '50%',
            opacity: particle.life,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
    </div>
  )
}

const randomRank = () => Math.floor(Math.random() * RANKS)
const randomSuit = () => Math.floor(Math.random() * SUITS)

const createCard = (rank = randomRank(), suit = randomSuit()): Card => ({
  key: Math.random(),
  rank,
  suit,
})

interface Card {
  key: number
  rank: number
  suit: number
}

export interface BlackjackConfig {
  logo: string
}

export default function Blackjack(props: BlackjackConfig) {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const pool = useCurrentPool()
  const [playerCards, setPlayerCards] = React.useState<Card[]>([])
  const [dealerCards, setDealerCards] = React.useState<Card[]>([])
  const [initialWager, setInitialWager] = useWagerInput()
  const [profit, setProfit] = React.useState<number | null>(null)
  const [claiming, setClaiming] = React.useState(false)
  const [showParticles, setShowParticles] = React.useState(false)
  const [particleColor, setParticleColor] = React.useState('#FFD700')
  const [lastPayoutMultiplier, setLastPayoutMultiplier] = React.useState<number>(0)

  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
    card: SOUND_CARD,
    jackpot: SOUND_JACKPOT,
  })

  const resetGame = () => {
    setProfit(null)
    setPlayerCards([])
    setDealerCards([])
    setShowParticles(false)
    setLastPayoutMultiplier(0)
  }

  const play = async () => {
    // Reset game state before playing
    resetGame()
    sounds.play('play')

    const betArray = [2.5, 2.5, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0] 

    await game.play({
      bet: betArray,
      wager: initialWager,
    })

    const result = await game.result()
    const payoutMultiplier = result.payout / initialWager

    let newPlayerCards: Card[] = []
    let newDealerCards: Card[] = []

    if (payoutMultiplier === 2.5) {
      // Player got blackjack
      newPlayerCards = generateBlackjackHand()
      newDealerCards = generateRandomHandBelow(21)
    } else if (payoutMultiplier === 2) {
      // Player wins normally
      newPlayerCards = generateWinningHand()
      newDealerCards = generateLosingHand(newPlayerCards)
    } else {
      // Player loses
      newPlayerCards = generateLosingHand()
      newDealerCards = generateWinningHandOver(newPlayerCards)
    }

    // Function to deal cards one by one with enhanced visual effects
    const dealCards = async () => {
      for (let i = 0; i < 2; i++) {
        // Deal to player first with enhanced timing
        if (i < newPlayerCards.length) {
          setPlayerCards(prev => [...prev, newPlayerCards[i]])
          sounds.play('card')

          // Add a very subtle vibration effect to the table
          const tableElement = document.querySelector('[data-blackjack-table]')
          if (tableElement) {
            tableElement.style.transform = 'translateX(-0.5px)'
            setTimeout(() => {
              if (tableElement) tableElement.style.transform = 'translateX(0.5px)'
            setTimeout(() => {
              if (tableElement) tableElement.style.transform = ''
              }, 50)
            }, 50)
          }

          await new Promise(resolve => setTimeout(resolve, 600)) // Natural timing
        }

        // Deal to dealer with different timing
        if (i < newDealerCards.length) {
          setDealerCards(prev => [...prev, newDealerCards[i]])
          sounds.play('card')

          // Different subtle vibration for dealer cards
          const tableElement = document.querySelector('[data-blackjack-table]')
          if (tableElement) {
            tableElement.style.transform = 'translateX(0.3px) translateY(-0.3px)'
            setTimeout(() => {
              if (tableElement) tableElement.style.transform = 'translateX(-0.3px) translateY(0.3px)'
            setTimeout(() => {
              if (tableElement) tableElement.style.transform = ''
              }, 40)
            }, 40)
          }

          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Special effects for blackjack
        if (i === 1 && payoutMultiplier === 2.5) {
          await new Promise(resolve => setTimeout(resolve, 300)) // Subtle pause
          sounds.play('jackpot')

          // Subtle glow effect for blackjack
          const tableElement = document.querySelector('[data-blackjack-table]')
          if (tableElement) {
            tableElement.style.boxShadow = 'inset 0 0 20px rgba(255, 215, 0, 0.3)'
            setTimeout(() => {
              if (tableElement) tableElement.style.boxShadow = ''
            }, 200)
          }
        }
      }
    }

    await dealCards()

    setProfit(result.payout)

    // Play the appropriate sound and show particles based on the result
    setLastPayoutMultiplier(payoutMultiplier)

    if (payoutMultiplier === 2.5) {
      // Blackjack - particles doradas
      setParticleColor('#FFD700')
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 3000)
    } else if (payoutMultiplier > 0) {
      // Victoria normal - particles verdes
      setParticleColor('#4CAF50')
      setShowParticles(true)
      sounds.play('win')
      setTimeout(() => setShowParticles(false), 2500)
    } else {
      // Derrota - sin partículas
      sounds.play('lose')
    }
  }

  // Helper functions remain the same
  const getHandValue = (hand: Card[]): number => {
    return hand.reduce((sum, c) => sum + CARD_VALUES[c.rank], 0)
  }

  const generateBlackjackHand = (): Card[] => {
    const aceRank = 12
    const tenRanks = [8, 9, 10, 11] // Ranks corresponding to 10-value cards
    const tenCardRank = tenRanks[Math.floor(Math.random() * tenRanks.length)]
    return [createCard(aceRank, randomSuit()), createCard(tenCardRank, randomSuit())]
  }

  const generateRandomHandBelow = (maxTotal: number): Card[] => {
    let handValue = maxTotal
    while (handValue >= maxTotal) {
      const card1 = createCard()
      const card2 = createCard()
      handValue = CARD_VALUES[card1.rank] + CARD_VALUES[card2.rank]
      if (handValue < maxTotal) {
        return [card1, card2]
      }
    }
    return []
  }

  const generateWinningHand = (): Card[] => {
    const totals = [17, 18, 19, 20]
    const targetTotal = totals[Math.floor(Math.random() * totals.length)]
    return generateHandWithTotal(targetTotal)
  }

  const generateLosingHand = (opponentHand?: Card[]): Card[] => {
    const opponentTotal = opponentHand ? getHandValue(opponentHand) : 20
    let total = opponentTotal
    while (total >= opponentTotal) {
      const hand = [createCard(), createCard()]
      total = getHandValue(hand)
      if (total < opponentTotal) {
        return hand
      }
    }
    return []
  }

  const generateWinningHandOver = (opponentHand: Card[]): Card[] => {
    const opponentTotal = getHandValue(opponentHand)
    let total = opponentTotal
    while (total <= opponentTotal || total > 21) {
      const hand = [createCard(), createCard()]
      total = getHandValue(hand)
      if (total > opponentTotal && total <= 21) {
        return hand
      }
    }
    return []
  }

  const generateHandWithTotal = (targetTotal: number): Card[] => {
    for (let i = 0; i < 100; i++) {
      const card1 = createCard()
      const card2 = createCard()
      if (CARD_VALUES[card1.rank] + CARD_VALUES[card2.rank] === targetTotal) {
        return [card1, card2]
      }
    }
    return generateRandomHandBelow(targetTotal)
  }

  return (
    <>
      {/* Efectos de partículas */}
      <ParticleEffect active={showParticles} color={particleColor} count={lastPayoutMultiplier === 2.5 ? 30 : 20} />

      <GambaUi.Portal target="screen">
        <div style={{
          width: '100%',
          height: '100%',
          background: `
            /* Base del fieltro de casino premium con profundidad */
            linear-gradient(135deg,
              #0a3d14 0%,
              #0e4f1c 15%,
              #0d4a1a 30%,
              #0c4518 45%,
              #0e4f1c 60%,
              #0d4a1a 75%,
              #0a3d14 90%,
              #083312 100%
            ),

            /* Variaciones naturales de color */
            radial-gradient(circle at 25% 25%, rgba(10, 61, 20, 0.9) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(14, 79, 28, 0.7) 0%, transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(13, 74, 26, 0.8) 0%, transparent 45%),
            radial-gradient(circle at 10% 80%, rgba(8, 51, 18, 0.6) 0%, transparent 40%),
            radial-gradient(circle at 90% 20%, rgba(12, 69, 24, 0.5) 0%, transparent 35%),

            /* Sombras profundas del tejido */
            radial-gradient(ellipse 30% 20% at 20% 30%, rgba(0,0,0,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 25% 35% at 80% 70%, rgba(0,0,0,0.12) 0%, transparent 65%)
          `,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Efecto de olas del mar sutil */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(ellipse 80% 20% at 20% 10%, rgba(34, 139, 34, 0.1) 0%, transparent 60%),
              radial-gradient(ellipse 70% 25% at 80% 20%, rgba(46, 139, 87, 0.08) 0%, transparent 65%),
              radial-gradient(ellipse 60% 30% at 60% 80%, rgba(34, 139, 34, 0.06) 0%, transparent 70%),
              radial-gradient(ellipse 90% 15% at 30% 70%, rgba(46, 139, 87, 0.05) 0%, transparent 75%)
            `,
            animation: 'waveMotion 8s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(ellipse 60% 40% at 70% 30%, rgba(107, 142, 35, 0.04) 0%, transparent 55%),
              radial-gradient(ellipse 50% 35% at 10% 50%, rgba(85, 107, 47, 0.03) 0%, transparent 60%),
              radial-gradient(ellipse 75% 20% at 50% 90%, rgba(107, 142, 35, 0.02) 0%, transparent 65%)
            `,
            animation: 'waveMotionReverse 12s ease-in-out infinite',
            pointerEvents: 'none'
          }} />

          {/* Estilos CSS para las animaciones */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes waveMotion {
                0%, 100% {
                  transform: translateX(0) translateY(0) scale(1);
                  opacity: 0.6;
                }
                25% {
                  transform: translateX(8px) translateY(-3px) scale(1.01);
                  opacity: 0.8;
                }
                50% {
                  transform: translateX(-4px) translateY(6px) scale(0.99);
                  opacity: 0.7;
                }
                75% {
                  transform: translateX(6px) translateY(-2px) scale(1.005);
                  opacity: 0.9;
                }
              }
              @keyframes waveMotionReverse {
                0%, 100% {
                  transform: translateX(0) translateY(0) scale(1);
                  opacity: 0.4;
                }
                25% {
                  transform: translateX(-6px) translateY(4px) scale(0.995);
                  opacity: 0.6;
                }
                50% {
                  transform: translateX(5px) translateY(-7px) scale(1.01);
                  opacity: 0.5;
                }
                75% {
                  transform: translateX(-7px) translateY(3px) scale(0.998);
                  opacity: 0.7;
                }
              }
            `
          }} />
          {/* Textura 3D de fieltro premium con profundidad */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              /* Fibras principales del fieltro con textura natural premium */
              repeating-linear-gradient(45deg,
                transparent 0px,
                rgba(0,0,0,0.04) 1px,
                rgba(0,0,0,0.025) 2px,
                rgba(255,255,255,0.015) 3px,
                rgba(0,0,0,0.02) 4px,
                transparent 5px,
                transparent 14px,
                rgba(0,0,0,0.035) 15px,
                rgba(0,0,0,0.02) 16px,
                rgba(255,255,255,0.01) 17px,
                transparent 18px
              ),
              repeating-linear-gradient(135deg,
                transparent 0px,
                rgba(255,255,255,0.02) 1px,
                rgba(0,0,0,0.015) 2px,
                rgba(255,255,255,0.01) 3px,
                transparent 4px,
                transparent 22px,
                rgba(0,0,0,0.03) 23px,
                rgba(255,255,255,0.015) 24px,
                rgba(0,0,0,0.02) 25px,
                transparent 26px
              ),

              /* Patrón de tejido premium con micro-fibras */
              repeating-linear-gradient(0deg,
                transparent 0px,
                rgba(0,0,0,0.012) 1px,
                rgba(255,255,255,0.005) 2px,
                transparent 3px,
                transparent 9px,
                rgba(0,0,0,0.008) 10px,
                rgba(255,255,255,0.003) 11px,
                transparent 12px
              ),
              repeating-linear-gradient(90deg,
                transparent 0px,
                rgba(0,0,0,0.01) 1px,
                rgba(255,255,255,0.004) 2px,
                transparent 3px,
                transparent 7px,
                rgba(0,0,0,0.007) 8px,
                rgba(255,255,255,0.002) 9px,
                transparent 10px
              ),

              /* Relieves naturales complejos del tejido premium */
              radial-gradient(ellipse 45% 35% at 15% 15%, rgba(0,0,0,0.1) 0%, transparent 65%),
              radial-gradient(ellipse 40% 50% at 85% 85%, rgba(255,255,255,0.05) 0%, transparent 70%),
              radial-gradient(ellipse 55% 30% at 55% 35%, rgba(0,0,0,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 35% 55% at 5% 75%, rgba(255,255,255,0.035) 0%, transparent 75%),
              radial-gradient(ellipse 50% 40% at 95% 25%, rgba(0,0,0,0.07) 0%, transparent 55%),
              radial-gradient(ellipse 30% 45% at 35% 65%, rgba(255,255,255,0.03) 0%, transparent 70%),
              radial-gradient(ellipse 60% 25% at 75% 45%, rgba(0,0,0,0.06) 0%, transparent 50%),

              /* Sombras profundas que dan volumen realista */
              radial-gradient(circle at 35% 55%, rgba(0,0,0,0.15) 0%, transparent 85%),
              radial-gradient(circle at 75% 15%, rgba(0,0,0,0.1) 0%, transparent 75%),
              radial-gradient(circle at 10% 90%, rgba(255,255,255,0.025) 0%, transparent 80%),
              radial-gradient(circle at 65% 80%, rgba(0,0,0,0.08) 0%, transparent 70%),
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 0%, transparent 90%)
            `,
            opacity: 0.85,
            pointerEvents: 'none'
          }} />

          {/* Capa adicional de relieve premium para mayor 3D */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              /* Iluminación natural compleja */
              linear-gradient(45deg,
                rgba(255,255,255,0.08) 0%,
                transparent 15%,
                rgba(0,0,0,0.05) 35%,
                transparent 50%,
                rgba(255,255,255,0.04) 65%,
                transparent 80%,
                rgba(0,0,0,0.02) 100%
              ),
              linear-gradient(135deg,
                rgba(0,0,0,0.03) 0%,
                transparent 25%,
                rgba(255,255,255,0.025) 50%,
                transparent 75%,
                rgba(0,0,0,0.015) 100%
              ),

              /* Micro-relieves detallados del tejido premium */
              radial-gradient(ellipse 28% 18% at 22% 22%, rgba(0,0,0,0.06) 0%, transparent 75%),
              radial-gradient(ellipse 22% 28% at 78% 78%, rgba(255,255,255,0.035) 0%, transparent 65%),
              radial-gradient(ellipse 32% 22% at 48% 48%, rgba(0,0,0,0.04) 0%, transparent 85%),
              radial-gradient(ellipse 18% 32% at 8% 88%, rgba(255,255,255,0.025) 0%, transparent 70%),
              radial-gradient(ellipse 38% 20% at 92% 8%, rgba(0,0,0,0.05) 0%, transparent 80%),
              radial-gradient(ellipse 25% 30% at 35% 68%, rgba(255,255,255,0.02) 0%, transparent 75%),
              radial-gradient(ellipse 35% 25% at 68% 35%, rgba(0,0,0,0.03) 0%, transparent 70%),

              /* Efectos de desgaste natural premium */
              radial-gradient(circle at 58% 38%, rgba(255,255,255,0.02) 0%, transparent 90%),
              radial-gradient(circle at 28% 82%, rgba(0,0,0,0.03) 0%, transparent 95%),
              radial-gradient(circle at 82% 62%, rgba(255,255,255,0.015) 0%, transparent 85%),
              radial-gradient(circle at 12% 28%, rgba(0,0,0,0.025) 0%, transparent 80%)
            `,
            opacity: 0.4,
            pointerEvents: 'none',
            mixBlendMode: 'overlay'
          }} />

          {/* Bordes de madera 3D ultra realistas */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '70px',
            background: `
              /* Capa base de madera premium pulida */
              linear-gradient(to bottom,
                #5D4E37 0%,
                #8B7355 15%,
                #A0825D 30%,
                #8B7355 50%,
                #A0825D 70%,
                #8B7355 85%,
                #5D4E37 100%
              ),

              /* Vetás elegantes y uniformes */
              repeating-linear-gradient(90deg,
                transparent 0px,
                rgba(139, 115, 85, 0.08) 1px,
                rgba(160, 130, 93, 0.05) 2px,
                rgba(139, 115, 85, 0.06) 3px,
                transparent 4px,
                rgba(139, 115, 85, 0.04) 6px,
                rgba(160, 130, 93, 0.03) 7px,
                transparent 8px,
                rgba(139, 115, 85, 0.05) 10px,
                rgba(160, 130, 93, 0.04) 11px,
                transparent 12px
              ),

              /* Vetás finas de grano natural */
              repeating-linear-gradient(90deg,
                transparent 0px,
                rgba(0,0,0,0.02) 1px,
                transparent 3px,
                rgba(0,0,0,0.015) 5px,
                transparent 7px,
                rgba(0,0,0,0.02) 9px,
                transparent 11px
              ),

              /* Textura sutil de madera premium */
              radial-gradient(ellipse at 20% 30%, rgba(0,0,0,0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.025) 0%, transparent 55%),

              /* Sombras naturales elegantes */
              linear-gradient(45deg,
                rgba(0,0,0,0.15) 0%,
                transparent 35%,
                transparent 65%,
                rgba(0,0,0,0.12) 100%
              )
            `,
            borderBottom: '6px solid #3D2914',
            boxShadow: `
              inset 0 4px 8px rgba(0,0,0,0.5),
              inset 0 -3px 6px rgba(255,255,255,0.08),
              0 6px 12px rgba(0,0,0,0.4),
              0 3px 6px rgba(0,0,0,0.5)
            `,
            pointerEvents: 'none'
          }} />

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70px',
            background: `
              /* Capa base de madera premium pulida */
              linear-gradient(to top,
                #5D4E37 0%,
                #8B7355 15%,
                #A0825D 30%,
                #8B7355 50%,
                #A0825D 70%,
                #8B7355 85%,
                #5D4E37 100%
              ),

              /* Vetás elegantes y uniformes */
              repeating-linear-gradient(90deg,
                transparent 0px,
                rgba(139, 115, 85, 0.08) 1px,
                rgba(160, 130, 93, 0.05) 2px,
                rgba(139, 115, 85, 0.06) 3px,
                transparent 4px,
                rgba(139, 115, 85, 0.04) 6px,
                rgba(160, 130, 93, 0.03) 7px,
                transparent 8px,
                rgba(139, 115, 85, 0.05) 10px,
                rgba(160, 130, 93, 0.04) 11px,
                transparent 12px
              ),

              /* Vetás finas de grano natural */
              repeating-linear-gradient(90deg,
                transparent 0px,
                rgba(0,0,0,0.02) 1px,
                transparent 3px,
                rgba(0,0,0,0.015) 5px,
                transparent 7px,
                rgba(0,0,0,0.02) 9px,
                transparent 11px
              ),

              /* Textura sutil de madera premium */
              radial-gradient(ellipse at 20% 70%, rgba(0,0,0,0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.02) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.025) 0%, transparent 55%),

              /* Sombras naturales elegantes */
              linear-gradient(135deg,
                rgba(0,0,0,0.15) 0%,
                transparent 35%,
                transparent 65%,
                rgba(0,0,0,0.12) 100%
              )
            `,
            borderTop: '6px solid #3D2914',
            boxShadow: `
              inset 0 -4px 8px rgba(0,0,0,0.5),
              inset 0 3px 6px rgba(255,255,255,0.08),
              0 -6px 12px rgba(0,0,0,0.4),
              0 -3px 6px rgba(0,0,0,0.5)
            `,
            pointerEvents: 'none'
          }} />

          <div style={{
            position: 'absolute',
            top: '70px',
            left: 0,
            width: '70px',
            bottom: '70px',
            background: `
              /* Capa base de madera premium pulida */
              linear-gradient(to right,
                #5D4E37 0%,
                #8B7355 15%,
                #A0825D 30%,
                #8B7355 50%,
                #A0825D 70%,
                #8B7355 85%,
                #5D4E37 100%
              ),

              /* Vetás elegantes y uniformes */
              repeating-linear-gradient(0deg,
                transparent 0px,
                rgba(139, 115, 85, 0.08) 1px,
                rgba(160, 130, 93, 0.05) 2px,
                rgba(139, 115, 85, 0.06) 3px,
                transparent 4px,
                rgba(139, 115, 85, 0.04) 6px,
                rgba(160, 130, 93, 0.03) 7px,
                transparent 8px,
                rgba(139, 115, 85, 0.05) 10px,
                rgba(160, 130, 93, 0.04) 11px,
                transparent 12px
              ),

              /* Vetás finas de grano natural */
              repeating-linear-gradient(0deg,
                transparent 0px,
                rgba(0,0,0,0.02) 1px,
                transparent 3px,
                rgba(0,0,0,0.015) 5px,
                transparent 7px,
                rgba(0,0,0,0.02) 9px,
                transparent 11px
              ),

              /* Textura sutil de madera premium */
              radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.02) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.025) 0%, transparent 55%),

              /* Sombras naturales elegantes */
              linear-gradient(45deg,
                rgba(0,0,0,0.15) 0%,
                transparent 35%,
                transparent 65%,
                rgba(0,0,0,0.12) 100%
              )
            `,
            borderRight: '6px solid #3D2914',
            boxShadow: `
              inset 4px 0 8px rgba(0,0,0,0.5),
              inset -3px 0 6px rgba(255,255,255,0.08),
              6px 0 12px rgba(0,0,0,0.4),
              3px 0 6px rgba(0,0,0,0.5)
            `,
            pointerEvents: 'none'
          }} />

          <div style={{
            position: 'absolute',
            top: '70px',
            right: 0,
            width: '70px',
            bottom: '70px',
            background: `
              /* Capa base de madera premium pulida */
              linear-gradient(to left,
                #5D4E37 0%,
                #8B7355 15%,
                #A0825D 30%,
                #8B7355 50%,
                #A0825D 70%,
                #8B7355 85%,
                #5D4E37 100%
              ),

              /* Vetás elegantes y uniformes */
              repeating-linear-gradient(180deg,
                transparent 0px,
                rgba(139, 115, 85, 0.08) 1px,
                rgba(160, 130, 93, 0.05) 2px,
                rgba(139, 115, 85, 0.06) 3px,
                transparent 4px,
                rgba(139, 115, 85, 0.04) 6px,
                rgba(160, 130, 93, 0.03) 7px,
                transparent 8px,
                rgba(139, 115, 85, 0.05) 10px,
                rgba(160, 130, 93, 0.04) 11px,
                transparent 12px
              ),

              /* Vetás finas de grano natural */
              repeating-linear-gradient(180deg,
                transparent 0px,
                rgba(0,0,0,0.02) 1px,
                transparent 3px,
                rgba(0,0,0,0.015) 5px,
                transparent 7px,
                rgba(0,0,0,0.02) 9px,
                transparent 11px
              ),

              /* Textura sutil de madera premium */
              radial-gradient(ellipse at 70% 20%, rgba(0,0,0,0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 30% 80%, rgba(255,255,255,0.02) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.025) 0%, transparent 55%),

              /* Sombras naturales elegantes */
              linear-gradient(135deg,
                rgba(0,0,0,0.15) 0%,
                transparent 35%,
                transparent 65%,
                rgba(0,0,0,0.12) 100%
              )
            `,
            borderLeft: '6px solid #3D2914',
            boxShadow: `
              inset -4px 0 8px rgba(0,0,0,0.5),
              inset 3px 0 6px rgba(255,255,255,0.08),
              -6px 0 12px rgba(0,0,0,0.4),
              -3px 0 6px rgba(0,0,0,0.5)
            `,
            pointerEvents: 'none'
          }} />

          {/* Efectos de iluminación dinámicos */}
          {gamba.isPlaying && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
          )}

          {profit !== null && profit > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(76, 175, 80, 0.15) 0%, transparent 70%)',
              animation: 'glowPulse 1.5s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
          )}

          <GambaUi.Responsive>
            <Container $disabled={claiming || gamba.isPlaying} data-blackjack-table>
              <div
                style={{
                  display: window.innerWidth <= 768 ? 'flex' : 'flex',
                  flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                  gap: window.innerWidth <= 768 ? '20px' : '60px',
                  padding: '150px 80px 150px 80px', // padding simétrico arriba y abajo
                  minHeight: '80vh',
                alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: '850px',
                  margin: '0 auto',
                  position: 'relative' // para posicionar absolutamente el resultado
                }}
              >
                {/* Indicador de estado del juego - solo durante el juego */}
                {gamba.isPlaying && (
                  <div style={{
                    position: 'absolute',
                    top: '60px',
                    right: '80px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: "'Inter', sans-serif",
                    textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '6px 10px',
                    borderRadius: '3px',
                    border: '1px solid #666',
                    zIndex: 10,
                    letterSpacing: '0.5px'
                  }}>
                    DEALING CARDS...
                  </div>
                )}

                {/* Área del Dealer */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  flex: window.innerWidth <= 768 ? 'unset' : '1'
                }}>
                  {/* Título del dealer realista */}
                  <div style={{
                    color: '#F5F5DC',
                    fontSize: '20px',
                  fontWeight: 'bold',
                    fontFamily: "'Inter', sans-serif",
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                  textAlign: 'center',
                    background: '#654321',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: '2px solid #8B7355',
                    boxShadow: `
                      inset 0 1px 0 rgba(139,115,85,0.3),
                      inset 0 -1px 0 rgba(0,0,0,0.2),
                      0 3px 6px rgba(0,0,0,0.5),
                      0 2px 4px rgba(0,0,0,0.3)
                    `,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    zIndex: 10
                }}>
                  DEALER
                </div>

                {/* Mano del dealer */}
                  <CardArea style={{ marginTop: '0px' }}>
                    <div className="card-area-pattern"></div>
                  <CardsContainer>
                    {dealerCards.map((card) => (
                      <CardContainer key={card.key}>
                        <Card color={SUIT_COLORS[card.suit]}>
                            <div className="top-left">
                              <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                              <div className="suit">{SUIT_SYMBOLS[card.suit]}</div>
                            </div>
                            <div className="bottom-right">
                          <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                          <div className="suit">{SUIT_SYMBOLS[card.suit]}</div>
                            </div>
                        </Card>
                      </CardContainer>
                    ))}
                  </CardsContainer>
                  {dealerCards.length === 2 && (
                    <HandValue>
                      {getHandValue(dealerCards)} pts
                    </HandValue>
                  )}
                </CardArea>
                </div>

                {/* Área del Player */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  flex: window.innerWidth <= 768 ? 'unset' : '1'
                }}>
                  {/* Título del jugador realista */}
                  <div style={{
                    color: '#F0F8FF',
                    fontSize: '20px',
                  fontWeight: 'bold',
                    fontFamily: "'Inter', sans-serif",
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                  textAlign: 'center',
                    background: '#000080',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: '2px solid #4169E1',
                    boxShadow: `
                      inset 0 1px 0 rgba(100,149,237,0.3),
                      inset 0 -1px 0 rgba(0,0,0,0.2),
                      0 3px 6px rgba(0,0,0,0.5),
                      0 2px 4px rgba(0,0,0,0.3)
                    `,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    zIndex: 10
                }}>
                  YOUR HAND
                </div>

                {/* Mano del jugador */}
                  <CardArea style={{ marginTop: '0px' }}>
                    <div className="card-area-pattern"></div>
                  <CardsContainer>
                    {playerCards.map((card) => (
                      <CardContainer key={card.key}>
                        <Card color={SUIT_COLORS[card.suit]}>
                            <div className="top-left">
                              <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                              <div className="suit">{SUIT_SYMBOLS[card.suit]}</div>
                            </div>
                            <div className="bottom-right">
                          <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                          <div className="suit">{SUIT_SYMBOLS[card.suit]}</div>
                            </div>
                        </Card>
                      </CardContainer>
                    ))}
                  </CardsContainer>
                  {playerCards.length === 2 && (
                    <HandValue $isBlackjack={profit !== null && (profit / initialWager) === 2.5}>
                      {getHandValue(playerCards)} pts
                      {profit !== null && (profit / initialWager) === 2.5 && ' - BLACKJACK!'}
                    </HandValue>
                  )}
                </CardArea>
                </div>

                {/* Resultado - posicionado absolutamente para no afectar layout */}
                {profit !== null && (
                  <div style={{
                    position: 'absolute',
                    bottom: '120px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 15,
                    pointerEvents: 'none'
                  }}>
                    <Profit key={profit} $isWin={profit > 0}>
                    {profit > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            fontSize: '24px',
                            color: '#90EE90',
                          fontWeight: 'bold',
                            fontFamily: "'Inter', sans-serif",
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            letterSpacing: '1px'
                        }}>
                            PLAYER WINS
                        </div>
                        <div style={{
                            fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#FFD700',
                            fontFamily: "'Inter', sans-serif",
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            background: 'rgba(0,0,0,0.7)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #FFD700'
                        }}>
                          <TokenValue amount={profit} />
                        </div>
                      </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            fontSize: '24px',
                            color: '#F5F5F5',
                          fontWeight: 'bold',
                            fontFamily: "'Inter', sans-serif",
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            letterSpacing: '1px'
                          }}>
                            DEALER WINS
                        </div>
                      </div>
                    )}
                  </Profit>
                  </div>
                )}
              </div>
            </Container>
          </GambaUi.Responsive>
        </div>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <GambaUi.WagerInput value={initialWager} onChange={setInitialWager} />
          <GambaUi.PlayButton onClick={play} disabled={gamba.isPlaying}>
            {gamba.isPlaying ? 'Dealing...' : 'Deal Cards'}
          </GambaUi.PlayButton>
        </div>
      </GambaUi.Portal>
    </>
  )
}