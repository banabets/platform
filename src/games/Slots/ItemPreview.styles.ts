// src/games/Slots/ItemPreview.styles.ts
import styled, { keyframes, css } from 'styled-components'

const pulse = keyframes`
  0% { box-shadow: 0 0 0 rgba(255,209,102,0); transform: translateY(0); }
  50% { box-shadow: 0 0 18px rgba(255,209,102,.65); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 rgba(255,209,102,0); transform: translateY(0); }
`

export const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 8px;
  align-items: center;
`

export const Chip = styled.span<{ $active?: boolean }>`
  display: inline-grid;
  place-items: center;
  padding: 4px 8px;
  min-width: 34px;
  height: 24px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .2px;
  color: #1a1140;
  background: ${p => p.$active
    ? 'linear-gradient(180deg, #ffd166, #e0b24c)'
    : 'rgba(255,255,255,.85)'};
  border: 1px solid rgba(0,0,0,.12);
  text-shadow: none;
  user-select: none;
  transition: all .2s ease;

  ${p => p.$active && css`
    animation: ${pulse} 1.2s ease-in-out infinite;
    outline: 2px solid rgba(255,209,102,.65);
    transform: scale(1.08);
  `}
`

// Nuevos estilos para el historial
export const HistoryWrap = styled.div`
  margin-top: 6px;
  display: grid;
  grid-auto-flow: column;
  gap: 6px;
  align-items: center;
  opacity: .95;
`

export const HistoryChip = styled.span`
  display: inline-grid;
  place-items: center;
  padding: 2px 6px;
  min-width: 30px;
  height: 20px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .2px;
  color: #1a1140;
  background: rgba(255,255,255,.78);
  border: 1px solid rgba(0,0,0,.12);
  user-select: none;
  opacity: .9;
`
