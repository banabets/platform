// src/games/Slots/Slot.tsx
import React from 'react'
import { SLOT_ITEMS, SlotItem } from './constants'
import styled, { css, keyframes } from 'styled-components'
import { StyledSpinner, StyledSlotBox, Cell, SymbolImg } from './Slot.styles'

interface SlotProps {
  revealed: boolean
  good: boolean
  index: number
  item?: SlotItem
  spinning: boolean
  spinId: number
}

const reveal = keyframes`
  0% { transform: translateY(16px) scale(.96); opacity: 0; }
  60% { transform: translateY(-3px) scale(1.01); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
`

const pulse = keyframes`
  0%, 28% { transform: scale(1) }
  12% { transform: scale(1.16) }
`

const Revealed = styled.div<{ $revealed: boolean; $good: boolean }>`
  z-index: 2;
  height: 100%;
  display: grid;
  place-items: center;
  position: absolute;
  inset: 0;
  padding: 10px;
  transform: translateY(-100%);
  opacity: 0;

  ${(p) => p.$revealed && css`
    opacity: 1;
    transform: translateY(0);
    animation: ${reveal} .30s cubic-bezier(.18,.89,.32,1.3);
  `}

  & > img.slotImage {
    width: calc(var(--slot-w, 160px) - 36px);
    height: calc(var(--slot-w, 160px) - 36px);
    ${p => p.$good && css``}
}
`

export function Slot({ revealed, good, item, index, spinning, spinId }: SlotProps) {
  const items = React.useMemo(() => {
  const base = [...SLOT_ITEMS].sort(() => Math.random() - .5)
  return [...base, ...base, ...base]
}, [])

  return (
    <StyledSlotBox>
      <StyledSpinner key={spinId} data-state={revealed ? "hidden" : (spinning ? "spinning" : "idle")}>
        <div className="track">
          {items.map((it, i) => (
            <Cell key={i}><SymbolImg className="slotImage" src={it.image} draggable={false} /></Cell>
          ))}
        </div>
      </StyledSpinner>

      {item && (
        <Revealed className="revealedSlot" $revealed={revealed} $good={revealed && good}>
          <img className={`slotImage ${good ? "hit-glow" : ""}`} src={item.image} draggable={false} style={{ animationDelay: `${index * .2}s` }} />
        </Revealed>
      )}
    </StyledSlotBox>
  )
}
