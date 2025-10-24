import styled, { css, keyframes } from 'styled-components'

const resultFlash = keyframes`
  from { background-color: white;}
  to { background-color: #292a307d;}
`

export const StyledResults = styled.div`
  border-radius: 10px;
  background: #191c2fa1;
  margin: 0 auto;
  font-weight: bold;
  overflow: hidden;
  width: 100%;
  display: flex;
  height: 50px;

  & > div {
    display: flex;
    padding: 10px;
    width: 40px;
    justify-content: center;
  }

  & > div:first-child {
    font-size: 24px;
    align-items: center;
    width: 60px;
    justify-content: center;
    background: #FFFFFF11;
    animation: ${resultFlash} 1s;
  }
`

const chipPulse = keyframes`
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.05) translateY(-2px);
  }
`

const betHover = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 0 2px var(--border-color),
      0 4px 12px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 
      0 0 0 2px var(--border-color),
      0 4px 20px rgba(255, 215, 0, 0.5);
  }
`

export const StyledBetButton = styled.div<{$highlighted?: boolean, $color?: 'black' | 'red'}>`
  position: relative;
  border: none;
  border-radius: 8px;
  padding: 10px 8px;
  color: white;
  width: 55px;
  min-height: 42px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  transform-style: preserve-3d;

  ${(props) => props.$color === 'red' && css`
    --background-color: linear-gradient(145deg, #ff1744, #c41035);
    --border-color: #ff2b4e;
    --shadow-color: rgba(255, 23, 68, 0.5);
    --glow-color: rgba(255, 23, 68, 0.3);
  `}

  ${(props) => props.$color === 'black' && css`
    --background-color: linear-gradient(145deg, #2a2a2a, #0a0a0a);
    --border-color: #3a3a3a;
    --shadow-color: rgba(0, 0, 0, 0.8);
    --glow-color: rgba(138, 43, 226, 0.3);
  `}

  ${(props) => !props.$color && css`
    --background-color: linear-gradient(145deg, #1e3a8a, #1e40af);
    --border-color: #3b82f6;
    --shadow-color: rgba(59, 130, 246, 0.5);
    --glow-color: rgba(59, 130, 246, 0.3);
  `}

  background: var(--background-color);
  box-shadow: 
    0 0 0 2px var(--border-color),
    0 4px 12px var(--shadow-color),
    inset 0 2px 0 rgba(255, 255, 255, 0.15),
    inset 0 -2px 0 rgba(0, 0, 0, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%);
    pointer-events: none;
  }

  &::after {
    content: " ";
    transition: all 0.2s ease;
    background: transparent;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      0 0 0 3px var(--border-color),
      0 6px 20px var(--shadow-color),
      0 0 20px var(--glow-color),
      inset 0 2px 0 rgba(255, 255, 255, 0.2),
      inset 0 -2px 0 rgba(0, 0, 0, 0.4);
  }

  &:hover::after {
    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.2), transparent 70%);
  }

  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 
      0 0 0 2px var(--border-color),
      0 2px 8px var(--shadow-color),
      inset 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  ${(props) => props.$highlighted && css`
    animation: ${betHover} 1.5s ease-in-out infinite;
    transform: scale(1.05);
    
    &::after {
      background: radial-gradient(circle at center, rgba(255, 215, 0, 0.3), transparent 70%);
    }
  `}
`

export const StyledTable = styled.div`
  display: grid;
  gap: 6px;
  padding: 12px;
  background: linear-gradient(145deg, rgba(26, 26, 26, 0.9), rgba(15, 15, 15, 0.95));
  border-radius: 12px;
  border: 2px solid rgba(255, 215, 0, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  max-width: 100%;
  width: fit-content;
`

export const ChipContainer = styled.div`
  position: absolute;
  z-index: 100;
  top: -5px;
  right: -5px;
  transform: scale(1);
  animation: ${chipPulse} 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
  pointer-events: none;
`

export const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
`

export const StatBox = styled.div<{ $type: 'wager' | 'potential' }>`
  background: rgba(15, 18, 25, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 20px 16px;
  text-align: center;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$type === 'wager'
      ? 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
      : 'linear-gradient(90deg, #22c55e, #16a34a)'};
    border-radius: 8px 8px 0 0;
  }

  & > div:first-child {
    font-size: 22px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 6px;
    font-family: 'Russo One', sans-serif;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  & > div:last-child {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: 'Russo One', sans-serif;
  }

  &:hover {
    background: rgba(15, 18, 25, 0.95);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
`
