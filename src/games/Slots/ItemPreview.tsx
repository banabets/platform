// src/games/Slots/ItemPreview.tsx
import React from 'react'
import { Row, Chip } from './ItemPreview.styles'
import { SLOT_ITEMS } from './constants'

export function ItemPreview({
  betArray,
  hitMultiplier,
}: {
  betArray: number[]
  hitMultiplier?: number | null
}) {
  const multipliers = React.useMemo(() => {
    const set = new Set<number>(SLOT_ITEMS.map(s => s.multiplier))
    return Array.from(set).sort((a,b) => a - b)
  }, [])

  // Nuevo: mapa de display label por multiplicador
  const labelByMultiplier = React.useMemo(() => {
    const map = new Map<number, string>()
    for (const s of SLOT_ITEMS) {
      if (s.label && !map.has(s.multiplier)) {
        map.set(s.multiplier, s.label)
      }
    }
    return map
  }, [])

  return (
    <Row>
      {multipliers.map((m) => (
        <Chip
          key={m}
          $active={hitMultiplier === m}
          aria-current={hitMultiplier === m ? 'true' : 'false'}
        >
          {labelByMultiplier.get(m) ?? `${m}x`}
        </Chip>
      ))}
    </Row>
  )
}
