import React from 'react'
import styled, { keyframes, css } from 'styled-components'

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18]

const spin = keyframes`
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(1080deg);
  }
`

const ballSpin = keyframes`
  0% {
    transform: rotateZ(0deg) translateY(-165px) rotateZ(0deg);
  }
  100% {
    transform: rotateZ(1080deg) translateY(-165px) rotateZ(-1080deg);
  }
`

const ballSpinMobile = keyframes`
  0% {
    transform: rotateZ(0deg) translateY(-118px) rotateZ(0deg);
  }
  100% {
    transform: rotateZ(1080deg) translateY(-118px) rotateZ(-1080deg);
  }
`

const WheelContainer = styled.div`
  position: relative;
  width: 420px;
  height: 420px;
  perspective: 1000px;
  perspective-origin: 50% 50%;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 300px;
    height: 300px;
  }
`

const WheelOuter = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #8B4513, #654321);
  padding: 15px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 -5px 15px rgba(0, 0, 0, 0.4),
    inset 0 5px 15px rgba(139, 69, 19, 0.3);
  position: relative;
  transform-style: preserve-3d;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95%;
    height: 95%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #A0522D, #654321);
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
  }
`

const WheelInner = styled.div<{ $spinning: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: #0a0a0a;
  transform-style: preserve-3d;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.8),
    inset 0 -5px 20px rgba(0, 0, 0, 0.6),
    inset 0 5px 10px rgba(255, 255, 255, 0.05);

  ${({ $spinning }) => $spinning && css`
    animation: ${spin} 3s cubic-bezier(0.17, 0.67, 0.38, 0.98) forwards;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 5%;
    left: 5%;
    right: 5%;
    bottom: 5%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a);
    box-shadow: inset 0 2px 15px rgba(0, 0, 0, 0.8);
  }
`

const NumbersRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90%;
  border-radius: 50%;
`

const NumberPocket = styled.div<{ $angle: number; $isRed: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  transform: rotate(${props => props.$angle}deg);
  transform-origin: center center;

  &::before {
    content: '';
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    width: 58px;
    height: 70px;
    background: ${props => props.$isRed 
      ? 'linear-gradient(180deg, #ff1744 0%, #c41035 100%)' 
      : 'linear-gradient(180deg, #1a1a1a 0%, #000000 100%)'};
    clip-path: polygon(30% 0%, 70% 0%, 85% 100%, 15% 100%);
    box-shadow: 
      inset 0 2px 5px rgba(255, 255, 255, 0.1),
      inset 0 -2px 5px rgba(0, 0, 0, 0.5),
      0 2px 8px rgba(0, 0, 0, 0.6);
    border: 1px solid ${props => props.$isRed 
      ? 'rgba(255, 50, 50, 0.5)' 
      : 'rgba(50, 50, 50, 0.5)'};

    @media (max-width: 600px) {
      width: 42px;
      height: 50px;
    }
  }
`

const NumberText = styled.div<{ $angle: number }>`
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%) rotate(${props => -props.$angle}deg);
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(255, 255, 255, 0.3);
  z-index: 10;
  font-family: 'Arial', sans-serif;

  @media (max-width: 600px) {
    font-size: 14px;
    top: 15%;
  }
`

const CenterCircle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle at 30% 30%, #ffd700, #b8860b);
  border-radius: 50%;
  border: 4px solid #8B4513;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #000;
  font-weight: bold;
  z-index: 20;
  box-shadow: 
    0 5px 20px rgba(0, 0, 0, 0.5),
    inset 0 2px 10px rgba(255, 255, 255, 0.3),
    inset 0 -2px 10px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);

  @media (max-width: 600px) {
    width: 60px;
    height: 60px;
    font-size: 18px;
  }
`

const BallIndicator = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid #ffd700;
  filter: drop-shadow(0 2px 8px rgba(255, 215, 0, 0.6));
  z-index: 100;

  &::after {
    content: '▼';
    position: absolute;
    top: -22px;
    left: -12px;
    font-size: 20px;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  }

  @media (max-width: 600px) {
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-top: 16px solid #ffd700;

    &::after {
      font-size: 16px;
      top: -18px;
      left: -10px;
    }
  }
`

const Ball = styled.div<{ $spinning: boolean; $winningNumber: number | null }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle at 35% 35%, #ffffff, #d0d0d0);
  border-radius: 50%;
  border: 2px solid #999;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.6),
    inset -2px -2px 5px rgba(0, 0, 0, 0.3),
    inset 2px 2px 5px rgba(255, 255, 255, 0.5);
  z-index: 30;

  ${({ $spinning, $winningNumber }) => {
    if ($spinning && !$winningNumber) {
      return css`
        animation: ${ballSpin} 2s linear infinite;
        
        @media (max-width: 600px) {
          animation: ${ballSpinMobile} 2s linear infinite;
        }
      `
    } else if ($winningNumber) {
      const angle = (($winningNumber - 1) * 360) / 18
      return css`
        transform: rotateZ(${angle}deg) translateY(-140px) rotateZ(-${angle}deg);
        
        @media (max-width: 600px) {
          transform: rotateZ(${angle}deg) translateY(-105px) rotateZ(-${angle}deg);
        }
      `
    }
    return css`
      display: none;
    `
  }}

  @media (max-width: 600px) {
    width: 16px;
    height: 16px;
  }
`

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.9);
  }
`

const WinningNumber = styled.div<{ $visible: boolean }>`
  display: none; /* Eliminado - el resultado ya aparece en la sección de Results */
`

export function Wheel({ spinning, winningNumber }: { spinning: boolean; winningNumber: number | null }) {
  const numbers = Array.from({ length: 18 }, (_, i) => i + 1)

  return (
    <WheelContainer>
      <WinningNumber $visible={!!winningNumber && !spinning}>
        {winningNumber}
      </WinningNumber>
      
      <BallIndicator />

      <WheelOuter>
        <WheelInner $spinning={spinning}>
          <NumbersRing>
            {numbers.map((number, index) => {
              const angle = (index * 360) / 18
              const isRed = RED_NUMBERS.includes(number)

              return (
                <NumberPocket key={number} $angle={angle} $isRed={isRed}>
                  <NumberText $angle={angle}>
                    {number}
                  </NumberText>
                </NumberPocket>
              )
            })}
          </NumbersRing>

          <CenterCircle>
            0
          </CenterCircle>

          <Ball $spinning={spinning} $winningNumber={winningNumber} />
        </WheelInner>
      </WheelOuter>
    </WheelContainer>
  )
}
