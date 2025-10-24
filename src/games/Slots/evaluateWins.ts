
import { PAYLINES } from './PAYLINES'

export type EvalResult = {
  winningLineIndices: number[]
  winningCells: Array<[number, number]>
}

// Example with strict 6 in a row equal IDs
// If you have wilds, adapt the comparison
export function evaluateWins(symbolIds: string[][]): EvalResult {
  // symbolIds[col][row]
  const lines: number[] = []
  const cells: Array<[number, number]> = []

  PAYLINES.forEach((line, idx) => {
    const first = symbolIds[0]?.[line[0]]
    if (first == null) return
    let allEqual = true
    for (let col = 1; col < 6; col++) {
      if (symbolIds[col]?.[line[col]] !== first) {
        allEqual = false
        break
      }
    }
    if (allEqual) {
      lines.push(idx)
      for (let col = 0; col < 6; col++) cells.push([col, line[col]])
    }
  })

  return { winningLineIndices: lines, winningCells: cells }
}
