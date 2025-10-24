// src/games/Slots/HeaderBar.tsx
import React from 'react'
import { HeaderRow, BadgeImg } from './Slots.styles'

// helper por si cambias el base en Vite
const pub = (p: string) => `${import.meta.env.BASE_URL}${p}`

export function HeaderBar({ left }: { left?: React.ReactNode }) {
  return (
    <HeaderRow>
      <div>{left}</div>
      <BadgeImg src={pub('candy/bonus-badge.png')} alt="Bonus" />
      <BadgeImg src={pub('candy/wild-badge.png')} alt="Wild" />
    </HeaderRow>
  )
}

