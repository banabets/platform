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
    <div style={{ border: '1px solid #fff2', borderRadius: 8, padding: 10, background: '#0f0f18' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <tbody>
          {ORDER.map((label) => {
            const stats = byType[label] || { min: 0, max: 0 }
            const multStr = stats.min === stats.max ? `${stats.max}x` : `${stats.min}x–${stats.max}x`
            return (
              <tr key={label}>
                <td style={{ padding: '6px 8px', opacity: 0.9 }}>{label}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{multStr}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
