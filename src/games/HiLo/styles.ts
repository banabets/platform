import styled, { css, keyframes } from 'styled-components'

const appear = keyframes`
  0% {
    transform: scale(0.2) translateY(120px) rotateY(90deg) rotateX(45deg);
    opacity: 0;
    filter: blur(8px);
  }
  40% {
    transform: scale(1.1) translateY(-10px) rotateY(10deg) rotateX(0deg);
    opacity: 0.8;
    filter: blur(2px);
  }
  70% {
    transform: scale(0.95) translateY(5px) rotateY(-5deg) rotateX(0deg);
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    transform: scale(1) translateY(0) rotateY(0deg) rotateX(0deg);
    opacity: 1;
    filter: blur(0px);
  }
`

const cardSlideIn = keyframes`
  0% {
    transform: translateX(-200px) rotateY(-45deg);
    opacity: 0;
  }
  50% {
    transform: translateX(20px) rotateY(5deg);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0) rotateY(0deg);
    opacity: 1;
  }
`

const cardFlip = keyframes`
  0% {
    transform: rotateY(180deg) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: rotateY(90deg) scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: rotateY(0deg) scale(1);
    opacity: 1;
  }
`

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
`


export const Container = styled.div<{ $disabled?: boolean }>`
  user-select: none;
  background: #9967e300;
  transition: opacity .2s;
  ${({ $disabled }) => $disabled && css`
    pointer-events: none;
    opacity: .7;
  `}
`

export const Options = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
  align-items: center;
`

export const Option = styled.button<{ selected?: boolean }>`
  background: none;
  border: none;
  padding: 20px 30px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.selected ? '#ffe42d' : 'rgba(255, 255, 255, 0.8)'};
  min-width: 140px;
  min-height: 100px;

  /* Icono principal */
  & > div:first-child {
    font-size: 42px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
  }

  /* Texto */
  & > div:last-child {
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  /* Efectos hover */
  &:hover {
    color: #ffe42d;
    transform: translateY(-2px);

    & > div:first-child {
      transform: scale(1.1);
    }
  }

  /* Estado seleccionado */
  ${(props) => props.selected && css`
    color: #ffe42d;

    & > div:last-child {
      text-shadow:
        0 1px 3px rgba(0, 0, 0, 0.6),
        0 0 8px rgba(255, 228, 45, 0.4);
    }
  `}

  /* Responsive */
  @media (max-width: 600px) {
    min-width: 110px;
    min-height: 80px;
    padding: 16px 20px;

    & > div:first-child {
      font-size: 36px;
      margin-bottom: 6px;
    }

    & > div:last-child {
      font-size: 14px;
    }
  }
`

export const Profit = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  position: absolute;
  right: 20px;
  bottom: -100px;
  border-radius: 12px;
  padding: 12px 20px;
  background: #22c55e;
  border: 2px solid #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 180px;

  /* Icono de ganancia */
  &::before {
    content: '💰';
    margin-right: 8px;
  }

  /* Animación de entrada */
  animation: ${appear} 0.4s ease forwards;

  /* Efectos hover */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
  }

  &:active {
    transform: translateY(0);
    transition: all 0.1s ease;
  }

  /* Responsive */
  @media (max-width: 600px) {
    right: 10px;
    bottom: -80px;
    font-size: 16px;
    padding: 10px 16px;
    min-width: 140px;

    &::before {
      margin-right: 6px;
    }
  }
`

export const CardPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-radius: 16px;
  gap: 12px;
  padding: 20px;
  margin-top: 30px;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.01) 50%,
    transparent 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.1);

  /* Título del preview */
  &::before {
    content: 'Possible Next Cards';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #2d3748, #1a202c);
    color: rgba(255, 255, 255, 0.8);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }

  & > div {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    /* Indicador de probabilidad */
    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 193, 7, 0.6);
      opacity: 0;
      transition: all 0.3s ease;
    }
  }

  /* Responsive */
  @media (max-width: 600px) {
    padding: 16px;
    gap: 8px;
    margin-top: 20px;

    & > div {
      &:nth-child(n+8) {
        display: none;
      }
    }
  }
`

export const CardsContainer = styled.div`
  transition: transform .2s ease;
  perspective: 500px;
  display: flex;
  position: relative;
  justify-content: flex-end;
  align-items: center;
`

export const CardContainer = styled.div`
  position: absolute;
  bottom: 0;
  transition: all .4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(-12px 12px 8px rgba(0, 0, 0, 0.2));
  transform-origin: bottom center;
  perspective: 1000px;

  /* Animación de entrada mejorada */
  & > div {
    animation: ${appear} .6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* Efectos de profundidad */
  &:nth-child(2) {
    filter: drop-shadow(-8px 8px 6px rgba(0, 0, 0, 0.15));
  }

  &:nth-child(3) {
    filter: drop-shadow(-6px 6px 4px rgba(0, 0, 0, 0.12));
  }

  &:nth-child(4) {
    filter: drop-shadow(-4px 4px 3px rgba(0, 0, 0, 0.1));
  }

  &:nth-child(5) {
    filter: drop-shadow(-2px 2px 2px rgba(0, 0, 0, 0.08));
  }
`

export const Card = styled.div<{$small?: boolean}>`
  ${(props) => props.$small ? css`
    height: 50px;
    font-size: 18px;
    padding: 8px;
    border-radius: 8px;
  ` : css`
    height: 160px;
    font-size: 70px;
    padding: 15px;
    border-radius: 12px;
  `}
  position: relative;
  color: #1a1a1a;
  overflow: hidden;
  aspect-ratio: 4/5.5;
  cursor: ${props => props.$small ? 'pointer' : 'default'};
  transition: all 0.3s ease;

  /* Fondo sólido blanco */
  background: #ffffff;

  /* Borde simple negro */
  border: 2px solid #000000;

  /* Sombra simple */
  box-shadow: ${props => props.$small ? '0 3px 8px rgba(0, 0, 0, 0.25)' : '0 4px 8px rgba(0, 0, 0, 0.2)'};

  .rank {
    font-weight: bold;
    line-height: 1em;
    color: #000000;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .suit {
    position: absolute;
    right: ${props => props.$small ? '6px' : '8px'};
    bottom: ${props => props.$small ? '6px' : '8px'};
    width: ${props => props.$small ? '24px' : '40px'};
    height: ${props => props.$small ? '24px' : '40px'};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.8;
    filter: brightness(1.1);
  }

  /* Efecto hover para cartas pequeñas */
  ${props => props.$small && css`
    &:hover {
      transform: translateY(-3px) scale(1.08);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    }

    &:active {
      transform: translateY(-1px) scale(1.05);
      transition: all 0.1s ease;
    }
  `}

  /* Efecto especial para cartas grandes */
  ${props => !props.$small && css`
    /* Sombra más pronunciada para cartas grandes */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  `}
`
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

export const WarningMessage = styled.div`
  animation: ${float} 2s ease-in-out infinite;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateX(100%) translateY(-50%);
  background-color: rgba(255, 204, 0, 0.8);
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  color: black;
  white-space: nowrap;
  pointer-events: none;
`
