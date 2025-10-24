
import React from 'react'
import styled from 'styled-components'
import { PaylineOverlay } from './PaylineOverlay'

const GridWrap = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, var(--slot-w));
  grid-auto-rows: var(--cell-h);
  gap: var(--gap);
`

const Cell = styled.div`
  width: var(--slot-w);
  height: var(--cell-h);
  display: grid;
  place-items: center;
  position: relative;
`

export function SlotsGrid({
  symbols,
  winningCells,
  winningLineIndices,
  renderSymbol,
}: {
  symbols: any[][]
  winningCells: Array<[number, number]>
  winningLineIndices: number[]
  renderSymbol: (c: number, r: number, s: any, isWinning: boolean) => React.ReactNode
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const cellRefs = React.useRef<Array<Array<HTMLDivElement | null>>>(
    Array.from({ length: 6 }, () => [null, null, null])
  )

  const isWinning = (c: number, r: number) =>
    winningCells.some(([cc, rr]) => cc === c && rr === r)

  return (
    <GridWrap ref={rootRef}>
      {Array.from({ length: 6 }).map((_, col) =>
        Array.from({ length: 3 }).map((_, row) => (
          <Cell
            key={`${col}-${row}`}
            ref={el => {
              if (!cellRefs.current[col]) cellRefs.current[col] = []
              cellRefs.current[col][row] = el
            }}
            data-col={col}
            data-row={row}
          >
            {renderSymbol(col, row, symbols[col][row], isWinning(col, row))}
          </Cell>
        )),
      )}
      <PaylineOverlay
        rootRef={rootRef}
        cellRefs={cellRefs.current}
        winningLineIndices={winningLineIndices}
      />
    </GridWrap>
  )
}
