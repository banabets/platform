import React from 'react'
import MachineFrame from './MachineFrame'
import { StyledSlots } from './Slots.styles'

// NOTE: replace this import with your real Slot + state
import { Slot } from './Slot'
import { SLOT_ITEMS } from './constants'

export default function SlotsScreen() {
  // Dummy state for the example
  const [spinning, setSpinning] = React.useState(false)
  const [revealed, setRevealed] = React.useState(false)

  const onSpin = () => {
    setSpinning(true)
    setRevealed(false)
    setTimeout(() => {
      setSpinning(false)
      setRevealed(true)
    }, 1600)
  }

  return (
    <StyledSlots>
      <MachineFrame
        title="ST0NED RABBITS"
        lines={[20, 40, 60, 80, 100]}
        balance={<span>1000 SOL</span>}
        bet={<span>0.5 SOL</span>}
        onSpin={onSpin}
        spinning={spinning}
      >
        <div className="reels-grid">
          {[0,1,2].map((i) => (
            <div className="slot" key={i}>
              <Slot
                index={i}
                revealed={revealed}
                good={i===1}
                item={SLOT_ITEMS[i % SLOT_ITEMS.length]}
              />
            </div>
          ))}
        </div>
      </MachineFrame>
    </StyledSlots>
  )
}
