
import React from 'react'
import { SlotsGrid } from '../Slots/SlotsGrid'
import { evaluateWins } from '../Slots/evaluateWins'
import { SymbolImg } from '../Slots/Slot.styles.addon'

// This is just an example. Replace with your real state.
export default function SlotsScreenExample() {
  // symbols[col][row] use IDs or names that map to your assets
  const [symbols, setSymbols] = React.useState<string[][]>(
    Array.from({ length: 6 }, () => ['a','b','c'])
  )
  const [winning, setWinning] = React.useState<{lines: number[], cells: Array<[number,number]>}>({
    lines: [],
    cells: [],
  })

  function onRevealSpin(finalSymbols: string[][]) {
    setSymbols(finalSymbols)
    const res = evaluateWins(finalSymbols)
    setWinning({ lines: res.winningLineIndices, cells: res.winningCells })
    // keep visible for ~1.1s then clear
    setTimeout(() => setWinning({ lines: [], cells: [] }), 1100)
  }

  // Simulate a reveal with one winning line (all 'x')
  React.useEffect(() => {
    const demo = Array.from({ length: 6 }, (_, col) => {
      const rows = ['x','x','x'] // all same per row for demo
      return rows
    })
    onRevealSpin(demo)
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <SlotsGrid
        symbols={symbols}
        winningCells={winning.cells}
        winningLineIndices={winning.lines}
        renderSymbol={(c, r, id, isWin) => (
          <SymbolImg
            src={`https://dummyimage.com/128x128/312/${isWin ? 'ffd166' : 'fff'}.png&text=${id}`}
            alt={id}
            className={isWin ? 'is-winning' : ''}
          />
        )}
      />
    </div>
  )
}
