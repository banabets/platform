import React from 'react'
import { SLOT_ITEMS, SlotItem } from './constants'
import styled, { css, keyframes } from 'styled-components'
import { StyledSpinner } from './Slot.styles'

interface SlotProps {
  revealed: boolean
  good: boolean
  index: number
  item?: SlotItem
}

const reveal = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0%); opacity: 1; }
`

const pulse = keyframes`
  0%, 30% { transform: scale(1) }
  10%     { transform: scale(1.12) }
`

const glow = keyframes`
  0%   { box-shadow: 0 0 0 rgba(255,236,99,0); }
  50%  { box-shadow: 0 0 28px rgba(255,236,99,.35); }
  100% { box-shadow: 0 0 0 rgba(255,236,99,0); }
`

const StyledSlot = styled.div<{$good: boolean}>`
  width: 100%;
  height: var(--slot-h, clamp(140px, 28vw, 220px));
  min-height: var(--slot-h, clamp(140px, 28vw, 220px));
  position: relative;
  overflow: hidden;
  ${(p) => p.$good && css` animation: ${glow} 1500ms ease-out 1; `}
`

const Revealed = styled.div<{$revealed: boolean, $good: boolean}>`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 10px;
  transform: translateY(-100%);
  opacity: 0;
  transition: opacity .2s, transform .3s ease;

  ${(props) => props.$revealed && css`
    opacity: 1;
    transform: translateY(0%);
    animation: ${reveal} cubic-bezier(0.18, 0.89, 0.32, 1.3) .25s;
  `}

  ${(props) => props.$good && css`
    & > img {
      animation: ${pulse} 1600ms .25s cubic-bezier(0.04, 1.14, 0.48, 1.63) infinite;
    }
  `}
`

export function Slot({ item = SLOT_ITEMS[0], revealed, index, good }: SlotProps) {
  const speedClass = index % 3 === 0 ? 'fast' : index % 3 === 1 ? '' : 'slow'

  return (
    <StyledSlot className="slot" $good={revealed && good}>
      {!revealed ? (
        <StyledSpinner
          className={speedClass}
          style={{ ['--num-items' as any]: SLOT_ITEMS.length }}
        >
          <div className={'items'}>
            {SLOT_ITEMS.map((sItem, i) => (
              <div key={i}>
                <img
                  className={'slotImage'}
                  src={sItem.image}
                  alt={`${sItem.multiplier}x`}
                  style={{ animationDelay: index * .15 + 's' }}
                />
              </div>
            ))}
          </div>
        </StyledSpinner>
      ) : (
        <Revealed
          aria-live="polite"
          aria-label={good ? `Win ${item.multiplier}x` : `${item.multiplier}x`}
          $revealed={revealed}
          $good={revealed && good}
        >
          <img
            className={'slotImage'}
            src={item.image}
            alt={`${item.multiplier}x`}
            style={{ animationDelay: index * .25 + 's' }}
          />
        </Revealed>
      )}
    </StyledSlot>
  )
}
