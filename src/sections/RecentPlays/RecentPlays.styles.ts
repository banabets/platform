import styled, { keyframes } from 'styled-components'

const jackpotGradient = keyframes`
  0% {
    background: linear-gradient(135deg, #ffd700, #ff4500, #ff1493);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 69, 0, 0.6), 0 0 60px rgba(255, 20, 147, 0.4);
  }
  25% {
    background: linear-gradient(135deg, #ff4500, #32cd32, #ffd700);
    box-shadow: 0 0 25px rgba(255, 69, 0, 0.8), 0 0 45px rgba(50, 205, 50, 0.6), 0 0 65px rgba(255, 215, 0, 0.4);
  }
  50% {
    background: linear-gradient(135deg, #32cd32, #1e90ff, #ff4500);
    box-shadow: 0 0 30px rgba(50, 205, 50, 0.8), 0 0 50px rgba(30, 144, 255, 0.6), 0 0 70px rgba(255, 69, 0, 0.4);
  }
  75% {
    background: linear-gradient(135deg, #1e90ff, #ff1493, #32cd32);
    box-shadow: 0 0 25px rgba(30, 144, 255, 0.8), 0 0 45px rgba(255, 20, 147, 0.6), 0 0 65px rgba(50, 205, 50, 0.4);
  }
  100% {
    background: linear-gradient(135deg, #ff1493, #ffd700, #1e90ff);
    box-shadow: 0 0 20px rgba(255, 20, 147, 0.8), 0 0 40px rgba(255, 215, 0, 0.6), 0 0 60px rgba(30, 144, 255, 0.4);
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`

const skeletonAnimation = keyframes`
  0%, 100% {
    background: linear-gradient(90deg, #3a3a3a 25%, #555 50%, #3a3a3a 75%);
    background-size: 200px 100%;
  }
  50% {
    background: linear-gradient(90deg, #555 25%, #777 50%, #555 75%);
    background-size: 200px 100%;
  }
`

const slideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-30px) scale(0.95);
    filter: blur(5px);
  }
  50% {
    opacity: 0.7;
    transform: translateX(-5px) scale(0.98);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
`

const glowPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 10px rgba(255, 228, 45, 0.2),
      0 0 20px rgba(255, 228, 45, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow:
      0 0 15px rgba(255, 228, 45, 0.4),
      0 0 30px rgba(255, 228, 45, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`

const shimmerSlide = keyframes`
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(300%) skewX(-12deg);
  }
`

export const Container = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  box-sizing: border-box;
  background: rgba(15, 18, 25, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.02);
  position: relative;

  /* Scrollbar personalizado premium */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg,
      rgba(255, 228, 45, 0.8) 0%,
      rgba(255, 193, 7, 0.9) 50%,
      rgba(255, 228, 45, 0.8) 100%);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 10px rgba(255, 228, 45, 0.3);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg,
      rgba(255, 228, 45, 0.9) 0%,
      rgba(255, 193, 7, 1) 50%,
      rgba(255, 228, 45, 0.9) 100%);
    box-shadow: 0 0 15px rgba(255, 228, 45, 0.5);
  }
`

export const Profit = styled.div<{$win: boolean}>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$win
    ? 'rgba(34, 197, 94, 0.1)'
    : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.$win
    ? 'rgba(34, 197, 94, 0.3)'
    : 'rgba(239, 68, 68, 0.3)'};
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: ${props => props.$win ? '#22c55e' : '#ef4444'};
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$win
      ? 'rgba(34, 197, 94, 0.15)'
      : 'rgba(239, 68, 68, 0.15)'};
    transform: translateY(-1px);
  }
`


export const Jackpot = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #fbbf24;
  font-weight: 700;
  box-shadow: 0 0 8px rgba(255, 193, 7, 0.2);
`

export const Recent = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  font-size: 14px;
  color: #ffffff;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 228, 45, 0.2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    transition: all 0.1s ease;
  }
`


export const Skeleton = styled.div`
  height: 80px;
  width: 100%;
  border-radius: 12px;
  animation: ${skeletonAnimation} 2s infinite;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
`
