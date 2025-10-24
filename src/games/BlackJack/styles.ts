import styled, { css, keyframes } from 'styled-components'

const appear = keyframes`
  0% {
    transform: translateY(50px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.4); }
`

const slideIn = keyframes`
  0% { transform: translateX(-100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
`

const glowPulse = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`

export const Container = styled.div<{ $disabled?: boolean }>`
  user-select: none;
  transition: opacity .2s;
  ${({ $disabled }) => $disabled && css`
    pointer-events: none;
    opacity: .7;
  `}
`

export const CardArea = styled.div`
  border: none;
  border-radius: 0;
  padding: 10px;
  margin: 10px;
  width: ${window?.innerWidth && window.innerWidth > 768 ? '550px' : '500px'};
  min-height: ${window?.innerWidth && window.innerWidth > 768 ? '240px' : '200px'};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  box-shadow: none;
  position: relative;

  /* Patrón sutil de la mesa */
  .card-area-pattern {
    display: none;
  }
`

export const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${window?.innerWidth && window.innerWidth > 768 ? '20px' : '15px'};
  margin-bottom: 10px;
`

export const CardContainer = styled.div`
  margin: 0 ${window?.innerWidth && window.innerWidth > 768 ? '10px' : '8px'};
  animation: ${appear} 0.4s ease-out;
  position: relative;
`

export const Card = styled.div<{ color: string }>`
  height: ${window?.innerWidth && window.innerWidth > 768 ? '220px' : '180px'};
  width: ${window?.innerWidth && window.innerWidth > 768 ? '160px' : '130px'};
  font-size: ${window?.innerWidth && window.innerWidth > 768 ? '24px' : '20px'};
  padding: ${window?.innerWidth && window.innerWidth > 768 ? '10px' : '8px'};
  border-radius: ${window?.innerWidth && window.innerWidth > 768 ? '12px' : '10px'};
  box-shadow:
    0 10px 35px rgba(0, 0, 0, 0.9),
    0 20px 70px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(0, 0, 0, 0.2),
    inset 0 0 0 3px #ffffff,
    inset 0 0 0 5px #f8f8f8,
    inset 0 3px 6px rgba(255, 255, 255, 0.9),
    inset 0 -3px 6px rgba(0, 0, 0, 0.15);
  background:
    linear-gradient(145deg,
      #ffffff 0%,
      #fafafa 25%,
      #f5f5f5 50%,
      #fafafa 75%,
      #ffffff 100%
    ),
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 60%),
    radial-gradient(circle at 70% 70%, rgba(0,0,0,0.03) 0%, transparent 60%);
  border: ${window?.innerWidth && window.innerWidth > 768 ? '6px' : '5px'} solid #ffffff;
  position: relative;
  color: ${(props) => props.color || '#000'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  transform: perspective(1000px) rotateX(1deg);

  /* Efecto 3D adicional más pronunciado */
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    background:
      linear-gradient(145deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.2) 25%,
        rgba(200, 200, 200, 0.1) 50%,
        rgba(150, 150, 150, 0.2) 75%,
        rgba(100, 100, 100, 0.3) 100%
      ),
      linear-gradient(45deg,
        rgba(255, 255, 255, 0.3) 0%,
        transparent 30%,
        transparent 70%,
        rgba(0, 0, 0, 0.2) 100%
      );
    border-radius: 12px;
    z-index: -1;
    pointer-events: none;
    filter: blur(0.5px);
  }

  /* Sombra proyectada en la mesa */
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 4px;
    right: 4px;
    height: 16px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -2;
    filter: blur(2px);
  }

  &:hover {
    transform: perspective(1000px) translateY(-8px) rotateX(3deg) rotateY(-2deg) scale(1.02);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.9),
      0 24px 80px rgba(0, 0, 0, 0.6),
      0 0 20px rgba(255, 255, 0, 0.1),
      inset 0 0 0 2px #ffffff,
      inset 0 0 0 4px #f8f8f8,
      inset 0 2px 6px rgba(255, 255, 255, 1),
      inset 0 -2px 6px rgba(0, 0, 0, 0.2);
  }

  .rank {
    font-weight: bold;
    font-size: ${window?.innerWidth && window.innerWidth > 768 ? '28px' : '24px'};
    margin: 0;
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }

  .suit {
    font-size: ${window?.innerWidth && window.innerWidth > 768 ? '32px' : '28px'};
    margin: 0;
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }

  /* Símbolos en las esquinas como cartas reales */
  .top-left {
    position: absolute;
    top: ${window?.innerWidth && window.innerWidth > 768 ? '10px' : '8px'};
    left: ${window?.innerWidth && window.innerWidth > 768 ? '10px' : '8px'};
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
  }

  .bottom-right {
    position: absolute;
    bottom: ${window?.innerWidth && window.innerWidth > 768 ? '10px' : '8px'};
    right: ${window?.innerWidth && window.innerWidth > 768 ? '10px' : '8px'};
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    transform: rotate(180deg);
  }
`

export const Profit = styled.div<{ $isWin?: boolean }>`
  font-size: 20px;
  font-weight: bold;
  font-family: 'Arial', sans-serif;
  margin-top: 20px;
  text-align: center;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  animation: ${slideIn} 0.6s ease-out;

  ${({ $isWin }) => $isWin && css`
    color: #ffff00;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);
  `}
`

export const HandValue = styled.div<{ $isBlackjack?: boolean }>`
  font-size: 16px;
  font-weight: bold;
  font-family: 'Arial', sans-serif;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.8);
  padding: 4px 8px;
  border-radius: 6px;
  margin-top: 8px;
  border: 1px solid #8B4513;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);

  ${({ $isBlackjack }) => $isBlackjack && css`
    background: #FFD700;
    color: #000000;
    border: 2px solid #FFD700;
    font-weight: 900;
  `}
`