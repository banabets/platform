// src/games/Slots/OutcomeBanner.tsx
import React from 'react'
import styled from 'styled-components'

const Wrap = styled.div`
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 800;
  letter-spacing: .3px;
  text-align: center;
`

const Win = styled(Wrap)`
  background: rgba(156,255,87,.18);
  color: #9cff57;
`
const Near = styled(Wrap)`
  background: rgba(255,209,102,.18);
  color: #ffd166;
`
const Lose = styled(Wrap)`
  background: rgba(255,94,107,.18);
  color: #ff5e6b;
`

export function OutcomeBanner({ state }: { state: 'idle' | 'win' | 'near' | 'lose' }) {
  if (state === 'win') return <Win>Sweet Win</Win>
  if (state === 'near') return <Near>So Close</Near>
  if (state === 'lose') return <Lose>Try Again</Lose>
  return null
}
