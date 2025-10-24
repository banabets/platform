
import React from 'react'
import styled from 'styled-components'
import { PAYLINES } from './PAYLINES'

const Layer = styled.svg`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
`

type CellRef = HTMLElement | null
type CellMatrix = CellRef[][] // [col][row]

function centerOf(el: HTMLElement, root: HTMLElement) {
  const a = el.getBoundingClientRect()
  const b = root.getBoundingClientRect()
  return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 }
}

export function PaylineOverlay({
  rootRef,
  cellRefs,
  winningLineIndices,
}: {
  rootRef: React.RefObject<HTMLDivElement>
  cellRefs: CellMatrix
  winningLineIndices: number[]
}) {
  const [paths, setPaths] = React.useState<string[]>([])

  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const newPaths: string[] = []

    for (const idx of winningLineIndices) {
      const def = PAYLINES[idx]
      const pts: string[] = []
      for (let col = 0; col < 6; col++) {
        const row = def[col]
        const el = cellRefs[col]?.[row]
        if (!el) continue
        const { x, y } = centerOf(el, root)
        pts.push(`${x},${y}`)
      }
      if (pts.length === 6) newPaths.push(pts.join(' '))
    }
    setPaths(newPaths)
  }, [rootRef, cellRefs, winningLineIndices])

  return (
    <Layer>
      {paths.map((pts, i) => (
        <polyline
          key={i}
          points={pts}
          fill="none"
          stroke="gold"
          strokeWidth={6}
          opacity={0.95}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(255,209,102,.9))',
            strokeDasharray: 600,
            strokeDashoffset: 600,
            animation: 'dash 900ms ease-out forwards',
          }}
        />
      ))}
      <style>{`@keyframes dash { to { stroke-dashoffset: 0 } }`}</style>
    </Layer>
  )
}
