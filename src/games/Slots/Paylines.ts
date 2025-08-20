// Paylines.ts — 9 líneas de pago para 6 carretes
// Cada índice representa la fila [0..2] para cada carrete [0..5]
export const PAYLINES: number[][] = [
  [1,1,1,1,1,1], // media
  [0,0,0,0,0,0], // arriba
  [2,2,2,2,2,2], // abajo
  [0,1,2,1,0,1], // zigzag 1
  [2,1,0,1,2,1], // zigzag 2
  [0,0,1,1,2,2], // escalera ↘
  [2,2,1,1,0,0], // escalera ↗
  [1,0,1,2,1,0], // M
  [1,2,1,0,1,2], // W
]
