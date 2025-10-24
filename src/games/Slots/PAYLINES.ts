
// filas por columna: 0 top, 1 mid, 2 bottom
export type Payline = [number, number, number, number, number, number]

export const PAYLINES: Payline[] = [
  [0,0,0,0,0,0],   // top
  [1,1,1,1,1,1],   // middle
  [2,2,2,2,2,2],   // bottom
  [0,1,2,1,0,1],   // zigzag 1
  [2,1,0,1,2,1],   // zigzag 2
  [0,0,1,1,2,2],   // stair up
  [2,2,1,1,0,0],   // stair down
  [1,0,1,2,1,0],   // W
  [1,2,1,0,1,2],   // M
]
