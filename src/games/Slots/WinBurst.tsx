// src/games/Slots/WinBurst.tsx
import React from 'react'
import styled, { keyframes } from 'styled-components'

const expand = keyframes`
  0% { transform: scale(.6); opacity: .85; }
  70% { transform: scale(1.05); opacity: .35; }
  100% { transform: scale(1.2); opacity: 0; }
`

const Layer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1; /* por debajo de Header y Grid */
  display: grid;
  place-items: center;
  overflow: hidden;
`

const Burst = styled.div`
  width: 80%;
  padding-bottom: 80%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, rgba(255,255,255,.35), rgba(255,255,255,0) 60%),
    radial-gradient(circle at 50% 50%, rgba(255,127,182,.4), rgba(255,127,182,0) 70%),
    radial-gradient(circle at 50% 50%, rgba(255,205,92,.35), rgba(255,205,92,0) 85%);
  animation: ${expand} 1000ms ease-out forwards;
  filter: blur(1px);
`

export function WinBurst(){
  return (
    <Layer>
      <Burst />
    </Layer>
  )
}
