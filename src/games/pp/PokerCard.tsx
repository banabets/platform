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
      width: '100%', height: '100%',
      display: 'grid', placeItems: 'center',
      background: 'linear-gradient(180deg,#fff,#f5f5f5)',
      borderRadius: 12,
      color: suitObj.color, fontWeight: 700, fontFamily: 'monospace', fontSize: 18,
      border: `2px solid ${suitObj.color}33`, userSelect: 'none',
    }}>
      <span style={{ alignSelf: 'flex-start', fontSize: 16 }}>{rankStr}</span>
      <span style={{ fontSize: 28 }}>{suitObj.symbol}</span>
      <span style={{ alignSelf: 'flex-end', fontSize: 14, opacity: 0.7 }}>{rankStr}</span>
    </div>
  )
}
