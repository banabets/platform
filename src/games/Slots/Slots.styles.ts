// src/games/Slots/Slots.styles.ts
import styled from 'styled-components'

const bgUrl = '/Background.gif' // Vercel sirve /public como raíz

export const Board = styled.div`
  --slot-w: 160px;
  --cell-h: 122px;
  --gap: 50px;

  padding: 10px 190px 20px;
  border-radius: 22px;
  background: url(${bgUrl}) center/cover no-repeat !important;
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,.06),
    0 18px 36px rgba(0,0,0,.45);
  position: relative;
  overflow: hidden;
  width: max-content;
  margin: 0 auto;

  /* Temporales de debug para confirmar que el área existe */
  min-height: 300px;
  outline: 1px solid rgba(255,255,255,.15);
`

export const StyledSlots = Board

export const Grid = styled.div`
  position: relative;
  z-index: 2;
  display: grid !important;
  grid-template-columns: repeat(3, var(--slot-w));
  grid-auto-rows: calc(var(--cell-h) * 3 + 32px);
  gap: var(--gap) !important;
`

export const TopMask = styled.div`
  position: absolute;
  z-index: 3;
  top: 0; left: 0; right: 0;
  height: 200px;
  pointer-events: none;
`

export const HeaderRow = styled.div`
  position: relative;
  z-index: 4;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
`

export const BadgeImg = styled.img`
  height: 36px;
  width: auto;
  display: inline-block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,.35));
`
