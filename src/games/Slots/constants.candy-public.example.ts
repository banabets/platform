// src/games/Slots/constants.candy-public.example.ts
// Usa rutas absolutas a public/assets/candy para evitar problemas con Vite
export interface SlotItem { multiplier: number; image: string }

const slotItem = (multiplier: number, ...icons: string[]): SlotItem[] =>
  icons.map((image) => ({ multiplier, image }))

export const SLOT_ITEMS = [
  slotItem(7,  '/assets/candy/candy-legendary.png'),
  slotItem(5,  '/assets/candy/candy-5x.png'),
  slotItem(3,  '/assets/candy/candy-3x.png'),
  slotItem(2,  '/assets/candy/candy-2x.png'),
  slotItem(1,  '/assets/candy/candy-sweet.png', '/assets/candy/candy-hearts.png'),
  slotItem(0.5,'/assets/candy/candy-gummy.png'),
].flat()

export const NUM_SLOTS = 3
export const SPIN_DELAY = 1000
export const REVEAL_SLOT_DELAY = 500
export const FINAL_DELAY = 500
export const LEGENDARY_THRESHOLD = 5
