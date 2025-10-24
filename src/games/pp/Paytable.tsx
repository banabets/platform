import React from 'react'
import { JACKS_OR_BETTER_BET_ARRAY, HAND_BY_INDEX, LABEL_BY_HAND } from './betArray'

const ORDER: Array<'Jackpot' | 'Four of a Kind' | 'Full House' | 'Straight' | 'Three of a Kind' | 'Pair'> = [
  'Jackpot', 'Four of a Kind', 'Full House', 'Straight', 'Three of a Kind', 'Pair',
]


export const Paytable: React.FC = () => {
  const L = Math.min(HAND_BY_INDEX.length, JACKS_OR_BETTER_BET_ARRAY.length)
  const byType: Record<string, { min: number; max: number }> = {}
  for (let i = 0; i < L; i++) {
    const label = LABEL_BY_HAND[HAND_BY_INDEX[i]] || 'Bust'
    if (label === 'Bust') continue
    const mult = JACKS_OR_BETTER_BET_ARRAY[i] ?? 0
    if (!byType[label]) byType[label] = { min: mult, max: mult }
    byType[label].min = Math.min(byType[label].min, mult)
    byType[label].max = Math.max(byType[label].max, mult)
  }

  return (
    <div style={{
      border: '2px solid rgba(255,215,0,0.3)',
      borderRadius: 12,
      padding: 16,
      background: 'linear-gradient(135deg, rgba(15,15,24,0.9) 0%, rgba(25,25,35,0.9) 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,215,0,0.1)',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        fontSize: 16,
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: 12,
        color: '#FFD700',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        💰 Paytable
      </div>
      <table style={{
        width: '100%',
        fontSize: 14,
        borderCollapse: 'collapse',
        borderRadius: 8,
        overflow: 'hidden'
      }}>
        <tbody>
          {ORDER.map((label, index) => {
            const stats = byType[label] || { min: 0, max: 0 }
            const multStr = stats.min === stats.max ? `${stats.max}x` : `${stats.min}x–${stats.max}x`
            const isHighValue = stats.min >= 3

            return (
              <tr key={label} style={{
                background: index % 2 === 0
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s ease'
              }}>
                <td style={{
                  padding: '10px 12px',
                  opacity: 0.9,
                  color: isHighValue ? '#FFD700' : '#ffffff',
                  fontWeight: isHighValue ? 600 : 400,
                  borderBottom: '1px solid rgba(255,215,0,0.1)'
                }}>
                  {label}
                </td>
                <td style={{
                  padding: '10px 12px',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: isHighValue ? '#FFD700' : '#4CAF50',
                  textShadow: isHighValue ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                  borderBottom: '1px solid rgba(255,215,0,0.1)'
                }}>
                  {multStr}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
