// src/games/Slots/constants.ts
export { default as SOUND_LOSE } from "./assets/lose.mp3"
export { default as SOUND_PLAY } from "./assets/insert.mp3"
export { default as SOUND_REVEAL_LEGENDARY } from "./assets/reveal-legendary.mp3"
export { default as SOUND_REVEAL } from "./assets/reveal.mp3"
export { default as SOUND_SPIN } from "./assets/spin.mp3"
export { default as SOUND_WIN } from "./assets/win.mp3"

// constants.ts
export interface SlotItem {
  multiplier: number
  image: string
  label?: string
}

// helper para rutas públicas respetando BASE_URL
const a = (p: string) => `${import.meta.env.BASE_URL}${p}`

const slotItem = (multiplier: number, icons: string[], label?: string) =>
  icons.map(image => ({ multiplier, image, label }))

export const SLOT_ITEMS = [
  ...slotItem(7,   [a('candy/candy-legendary.png')],                 '7x 🩷'),
  ...slotItem(5,   [a('candy/candy-5x.png')],                        '5x 🍌'),
  ...slotItem(3,   [a('candy/candy-3x.png')],                        '3x 🌴'),
  ...slotItem(2,   [a('candy/candy-2x.png')],                        '2x 🐵'),
  ...slotItem(1,   [a('candy/candy-sweet.png'), a('candy/candy-hearts.png')], '1x 🍍'),
  ...slotItem(0.5, [a('candy/candy-gummy.png')],                     '0.5x 🥥'),
]

export const NUM_SLOTS = 3
export const SPIN_DELAY = 1000
export const REVEAL_SLOT_DELAY = 500
export const FINAL_DELAY = 500
export const LEGENDARY_THRESHOLD = 5
