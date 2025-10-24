import React from 'react'
import styled, { css, keyframes } from 'styled-components'

const chipPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`

const StyledChip = styled.div<{$color: string}>`
  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 50%;
  background: var(--chip-color);
  border: 3px solid var(--border-color);
  color: black;
  font-size: 13px;
  font-weight: bold;
  color: var(--text-color);
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  user-select: none;
  box-shadow: 
    0 4px 12px var(--shadow-color),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: all 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    border-radius: 50%;
    border: 1px dashed var(--border-color);
    opacity: 0.5;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent);
  }

  ${(props) => props.$color === 'white' && css`
    --chip-color: #f0f0ff;
    --border-color: #8888C0;
    --text-color: #333333;
    --shadow-color: rgba(136, 136, 192, 0.4);
  `}
  ${(props) => props.$color === 'green' && css`
    --chip-color: #47ff7d;
    --border-color: #00aa00;
    --text-color: #004400;
    --shadow-color: rgba(71, 255, 125, 0.4);
  `}
  ${(props) => props.$color === 'red' && css`
    --chip-color: #ff5b72;
    --border-color: #ff0033;
    --text-color: #660000;
    --shadow-color: rgba(255, 91, 114, 0.4);
  `}
  ${(props) => props.$color === 'blue' && css`
    --chip-color: #a692ff;
    --border-color: #6b5aed;
    --text-color: #000245;
    --shadow-color: rgba(166, 146, 255, 0.4);
  `}

  span {
    position: relative;
    z-index: 1;
  }
`

const color = (value: number) => {
  if (value <= 1) return 'green'
  if (value <= 2) return 'red'
  if (value <= 10) return 'blue'
  return 'white'
}

export function Chip({ value }: {value: number}) {
  return (
    <StyledChip $color={color(value)}>
      <span>{value}</span>
    </StyledChip>
  )
}
