// src/games/Slots/Slot.styles.ts
import styled, { keyframes } from 'styled-components'

const scrollSlow = keyframes`
  0% { transform: translate3d(0,0,0); }
  100% { transform: translate3d(0,-33%,0); }
`

const scrollFast = keyframes`
  0% { transform: translate3d(0,0,0); }
  100% { transform: translate3d(0,-33%,0); }
`

export const StyledSlotBox = styled.div`
  width: var(--slot-w, 160px);
  height: calc(var(--cell-h, 120px) * 3 + 32px);
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 2px solid #ffd166;
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(6px);
border: 2px solid gold;
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,.06),
    0 10px 22px rgba(0,0,0,.45);
  animation: none !important; /* mata flashes globales */
`

export const StyledSpinner = styled.div`
  z-index: 1;
  will-change: opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
  will-change: opacity;
  backface-visibility: hidden;
  transform: translateZ(0);

  position: absolute;
  inset: 0;
  padding: 10px;
  overflow: hidden;
  display: grid;
  grid-template-rows: 1fr;

  /* estado idle: carretes visibles con drift lento */
  &[data-state="idle"] .track { animation: ${scrollSlow} 8s linear infinite; opacity: 1; }
  /* mientras gira: anima la pista */
  &[data-state="spinning"] .track { animation: ${scrollFast} .55s linear infinite; opacity: 1; }
  /* al terminar el spin: ocultar la tira para mostrar el símbolo revelado */
  &[data-state="hidden"] {
    opacity: 0;
    transition: opacity .12s ease;
  }
`

export const Cell = styled.div`
  height: var(--cell-h, 120px);
  width: 100%;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.12));
`

export const SymbolImg = styled.img`
  transition: filter .18s ease, transform .18s ease;

  &.hit-glow {
    filter: drop-shadow(0 0 16px rgba(255,209,102,.9)) brightness(1.05) saturate(1.1);
  }

  aspect-ratio: 1 / 1;
  box-sizing: content-box;
  padding: 4px;
  backface-visibility: hidden;
  transform: translateZ(0);

  width: calc(var(--slot-w, 160px) - 36px);
  height: calc(var(--slot-w, 160px) - 36px);
  object-fit: contain;
  filter: drop-shadow(0 6px 8px rgba(0,0,0,.35));
  user-select: none;
  pointer-events: none;
  image-rendering: auto;
`
