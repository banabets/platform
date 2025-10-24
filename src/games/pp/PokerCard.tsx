import React from 'react'

const SUITS = [
  { symbol: '♠', color: '#222' },
  { symbol: '♥', color: '#e53935' },
  { symbol: '♦', color: '#039be5' },
  { symbol: '♣', color: '#43a047' },
]
const RANKS = ['A','K','Q','J','10','9','8','7','6','5','4','3','2']

interface PokerCardProps {
  rank: number // 0 = A, 1 = K, ... 12 = 2
  suit: number // 0..3
}

export const PokerCard: React.FC<PokerCardProps> = ({ rank, suit }) => {
  const suitObj = SUITS[Math.max(0, Math.min(3, suit))]
  const rankStr = RANKS[Math.max(0, Math.min(12, rank))]
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
      borderRadius: 12,
      color: suitObj.color,
      fontWeight: 700,
      fontFamily: 'monospace',
      fontSize: 18,
      border: `2px solid ${suitObj.color}40`,
      boxShadow: `0 4px 8px rgba(0,0,0,0.1), 0 0 0 1px ${suitObj.color}20`,
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Patrón sutil de textura */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 25% 25%, rgba(0,0,0,0.02) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <span style={{
        alignSelf: 'flex-start',
        fontSize: 16,
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        {rankStr}
      </span>

      <span style={{
        fontSize: 28,
        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        {suitObj.symbol}
      </span>

      <span style={{
        alignSelf: 'flex-end',
        fontSize: 14,
        opacity: 0.7,
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        {rankStr}
      </span>
    </div>
  )
}
