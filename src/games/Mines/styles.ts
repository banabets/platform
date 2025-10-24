import styled, { css, keyframes } from 'styled-components'
import { CellStatus } from './types'

const tickingAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
    box-shadow:
      0 8px 20px rgba(139, 115, 85, 0.8),
      0 0 0 3px rgba(160, 140, 110, 0.6),
      inset 0 2px 4px rgba(255, 255, 255, 0.2),
      inset 0 -3px 6px rgba(0, 0, 0, 0.4);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.2) saturate(1.1);
    box-shadow:
      0 12px 28px rgba(139, 115, 85, 1),
      0 0 0 4px rgba(160, 140, 110, 0.8),
      inset 0 3px 6px rgba(255, 255, 255, 0.3),
      inset 0 -4px 8px rgba(0, 0, 0, 0.5);
  }
`

const goldReveal = keyframes`
  0% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
  50% {
    transform: scale(1.15);
    filter: brightness(1.5) saturate(1.3);
  }
  100% {
    transform: scale(1);
    filter: brightness(1.2) saturate(1.1);
  }
`

const mineReveal = keyframes`
  0% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
  50% {
    transform: scale(1.2);
    filter: brightness(1.3) saturate(1.2);
  }
  100% {
    transform: scale(1);
    filter: brightness(1.1) saturate(1);
  }
`

const hoverPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`

export const Container2 = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr;
  height: 100%;
  background-image: url('https://img.freepik.com/premium-vector/enchanting-ancient-mystical-ruins-lush-jungle_1316704-38332.jpg?semt=ais_hybrid&w=740&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  gap: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(1px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(218, 165, 32, 0.1) 0%, transparent 40%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.4) 100%);
    pointer-events: none;
  }
`

export const Container = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 14px;
  user-select: none;
  backdrop-filter: blur(20px);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: radial-gradient(circle at center, rgba(138, 43, 226, 0.1) 0%, transparent 70%);
    border-radius: 20px;
    z-index: -1;
  }
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 15px;
  padding: 25px;
  background: rgba(15, 18, 25, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  border: 3px solid rgba(218, 165, 32, 0.8);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.8),
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 3px 8px rgba(255, 215, 0, 0.2),
    inset 0 -4px 12px rgba(0, 0, 0, 0.4),
    inset 4px 0 8px rgba(255, 215, 0, 0.1);
  position: relative;
  transform: perspective(1200px) rotateX(1deg);

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(45deg, rgba(218, 165, 32, 0.8), rgba(255, 215, 0, 0.6), rgba(218, 165, 32, 0.8));
    border-radius: 23px;
    z-index: -1;
    opacity: 0.4;
  }

  &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.8), transparent);
    border-radius: 2px;
  }
`

export const Levels = styled.div`
  border-radius: 12px;
  color: #ffffff;
  background: rgba(15, 18, 25, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  height: 60px;
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  transform: perspective(1000px) rotateX(1deg);

  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg,
      rgba(255, 193, 7, 0.1) 0%,
      transparent 50%,
      rgba(255, 193, 7, 0.05) 100%);
    pointer-events: none;
  }
`

export const Level = styled.div<{$active: boolean}>`
  margin: 0 auto;
  width: 25%;
  text-align: center;
  padding: 6px 0;
  opacity: 0.7;
  text-wrap: nowrap;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  & > div:first-child {
    font-size: 10px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1px;
  }

  & > div:last-child {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  ${(props) => props.$active && css`
    opacity: 1;

    & > div:first-child {
      color: #ffc107;
      font-weight: 600;
    }

    & > div:last-child {
      color: #ffffff;
      text-shadow: 0 0 8px rgba(255, 193, 7, 0.5);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, #ffc107, #ff8c00);
      border-radius: 1px;
    }
  `}
`

export const CellButton = styled.button<{status: CellStatus, selected: boolean}>`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(145deg, #8B7355 0%, #7B6345 30%, #6B5B47 70%, #8B7355 100%),
    url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B7355' fill-opacity='0.8'%3E%3Crect x='0' y='0' width='25' height='25'/%3E%3Crect x='25' y='25' width='25' height='25'/%3E%3C/g%3E%3Cg fill='%23A09070' fill-opacity='0.6'%3E%3Crect x='25' y='0' width='25' height='25'/%3E%3Crect x='0' y='25' width='25' height='25'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 100%, 50px 50px;
  border: 2px solid rgba(139, 115, 85, 0.8);
  border-radius: 4px;
  font-weight: 600;
  aspect-ratio: 1;
  width: 65px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 11px;
  cursor: pointer;
  color: rgba(245, 245, 220, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);

  /* Textura de muro de piedra */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      /* Líneas de cemento entre piedras */
      linear-gradient(to right, transparent 0%, rgba(139, 115, 85, 0.3) 50%, transparent 100%),
      linear-gradient(to bottom, transparent 0%, rgba(139, 115, 85, 0.3) 50%, transparent 100%),
      /* Sombras y relieves */
      radial-gradient(circle at 20% 20%, rgba(139, 115, 85, 0.4) 0%, transparent 30%),
      radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 40%);
    border-radius: 4px;
    opacity: 0.7;
    mix-blend-mode: multiply;
  }

  /* Textura de piedra adicional */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(160, 140, 110, 0.3) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(90, 70, 50, 0.25) 1px, transparent 1px);
    background-size: 15px 15px;
    border-radius: 4px;
    opacity: 0.4;
    mix-blend-mode: overlay;
  }

  ${(props) => props.selected && css`
    animation: ${tickingAnimation} 0.8s ease infinite;
    z-index: 10;
    opacity: 1!important;
    box-shadow:
      0 10px 24px rgba(139, 115, 85, 0.9),
      0 0 0 3px rgba(160, 140, 110, 0.7),
      inset 0 3px 6px rgba(255, 255, 255, 0.3),
      inset 0 -4px 8px rgba(0, 0, 0, 0.5);
  `}

  ${(props) => props.status === 'gold' && css`
    background:
      linear-gradient(145deg,
        #FFD700 0%,
        #FFA500 30%,
        #FF8C00 70%,
        #DAA520 100%),
      url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFD700' fill-opacity='0.4'%3E%3Crect x='0' y='0' width='25' height='25'/%3E%3Crect x='25' y='25' width='25' height='25'/%3E%3C/g%3E%3Cg fill='%23FFA500' fill-opacity='0.3'%3E%3Crect x='25' y='0' width='25' height='25'/%3E%3Crect x='0' y='25' width='25' height='25'/%3E%3C/g%3E%3C/svg%3E");
    background-size: 100%, 50px 50px;
    border: 3px solid #FFD700;
    box-shadow:
      0 8px 24px rgba(255, 193, 7, 0.6),
      0 0 0 3px rgba(255, 193, 7, 0.7),
      inset 0 2px 6px rgba(255, 255, 255, 0.4),
      inset 0 -3px 8px rgba(0, 0, 0, 0.4);
    animation: ${goldReveal} 0.6s ease;
    opacity: 1;
    color: #FFFFFF;
    font-weight: 800;
    text-shadow:
      0 1px 2px rgba(0, 0, 0, 0.9),
      0 2px 4px rgba(0, 0, 0, 0.8),
      0 0 6px rgba(255, 215, 0, 0.8);
    z-index: 15;

    &::before {
      background:
        /* Líneas de cemento doradas más sutiles */
        linear-gradient(to right, transparent 0%, rgba(255, 215, 0, 0.4) 50%, transparent 100%),
        linear-gradient(to bottom, transparent 0%, rgba(255, 215, 0, 0.4) 50%, transparent 100%),
        /* Sombras y relieves dorados más sutiles */
        radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.5) 0%, transparent 30%),
        radial-gradient(circle at 80% 80%, rgba(218, 165, 32, 0.4) 0%, transparent 40%);
      opacity: 0.6;
      mix-blend-mode: multiply;
    }

    &::after {
      background-image:
        radial-gradient(circle at 25% 25%, rgba(255, 215, 0, 0.4) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(255, 193, 7, 0.3) 1px, transparent 1px);
      background-size: 15px 15px;
      opacity: 0.4;
      mix-blend-mode: overlay;
    }
  `}

  ${(props) => props.status === 'mine' && css`
    background:
      linear-gradient(145deg,
        #DC143C 0%,
        #B22222 40%,
        #8B0000 100%);
    box-shadow:
      0 8px 24px rgba(220, 20, 60, 0.8),
      0 0 0 3px rgba(220, 20, 60, 1),
      inset 0 2px 6px rgba(255, 255, 255, 0.3),
      inset 0 -3px 8px rgba(0, 0, 0, 0.5);
    z-index: 10;
    animation: ${mineReveal} 0.4s ease;
    opacity: 1;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);

    &::before {
      background:
        radial-gradient(circle at 20% 80%, rgba(178, 34, 34, 0.4) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 0, 0, 0.3) 0%, transparent 50%);
      opacity: 0.7;
    }
  `}

  ${(props) => props.status === 'hidden' && css`
    &:disabled {
      opacity: 0.7;
      filter: brightness(0.8) contrast(0.9);
    }
  `}

  &:disabled {
    cursor: default;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.05);
    border-color: rgba(139, 115, 85, 1);
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.7),
      inset 0 3px 6px rgba(255, 255, 255, 0.4),
      inset 0 -4px 8px rgba(0, 0, 0, 0.6);

    &::before {
      opacity: 0.9;
    }

    &::after {
      opacity: 0.6;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
    transition: all 0.1s ease;
  }
`

export const StatusBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  background: rgba(15, 18, 25, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  & > div:first-child {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    font-family: 'Russo One', sans-serif;

    &:first-child {
      color: #FF6B6B;
      font-weight: 700;
    }

    &:last-child {
      color: #22c55e;
      font-weight: 700;
    }
  }
`
