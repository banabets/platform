import styled, { keyframes } from 'styled-components'
import rocketAnimation from './rocket.gif'

const generateMultipleBoxShadows = (n: number) => {
  const maxX = window.innerWidth
  const maxY = 4000

  const starColors = ['#ffffff', '#f0f8ff', '#e6f3ff', '#ffe4e1', '#fff8dc', '#f0fff0']
  let value = `${Math.random() * maxX}px ${Math.random() * maxY}px ${starColors[Math.floor(Math.random() * starColors.length)]}`
  for (let i = 2; i <= n; i++) {
    value += `, ${Math.random() * maxX}px ${Math.random() * maxY}px ${starColors[Math.floor(Math.random() * starColors.length)]}`
  }
  return value
}

const shadowsSmall = generateMultipleBoxShadows(700)
const shadowsMedium = generateMultipleBoxShadows(200)
const shadowsBig = generateMultipleBoxShadows(100)

export const animStar = keyframes`
  from {
    transform: translateY(-100vh);
  }
  to {
    transform: translateY(0);
  }
`

export const twinkle = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
`

export const StarsLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  animation: ${animStar} linear infinite;
`

export const StarsLayer1 = styled(StarsLayer)`
  width: 1px;
  height: 1px;
  animation-duration: 150s;
  opacity: 1;
  transition: opacity 12s;
  box-shadow: ${shadowsSmall};
`

export const LineLayer1 = styled(StarsLayer)`
  width: 1px;
  height: 12px;
  top: -12px;
  animation-duration: 75s;
  opacity: 0;
  transition: opacity 2s;
  box-shadow: ${shadowsSmall};
`

export const StarsLayer2 = styled(StarsLayer)`
  width: 2px;
  height: 2px;
  animation-duration: 100s;
  box-shadow: ${shadowsMedium};
`

export const LineLayer2 = styled(StarsLayer)`
  width: 2px;
  height: 25px;
  top: -25px;
  animation-duration: 6s;
  opacity: 0;
  transition: opacity 1s;
  box-shadow: ${shadowsMedium};
`

export const StarsLayer3 = styled(StarsLayer)`
  width: 3px;
  height: 3px;
  animation-duration: 50s;
  box-shadow: ${shadowsBig};
`

export const LineLayer3 = styled(StarsLayer)`
  width: 2px;
  height: 50px;
  top: -50px;
  animation-duration: 3s;
  opacity: 0;
  transition: opacity 1s;
  box-shadow: ${shadowsBig};
`


export const TwinkleStars = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  animation: ${twinkle} 4s ease-in-out infinite;
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 30%;
    width: 2px;
    height: 2px;
    background: #87ceeb;
    border-radius: 50%;
    box-shadow:
      100px 200px #fff,
      200px 100px #f0f8ff,
      300px 300px #e6f3ff,
      400px 150px #ffe4e1,
      150px 350px #fff8dc;
  }
`

export const ScreenWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background:
    /* Nebulosa central azulada */
    radial-gradient(ellipse at center, rgba(30, 50, 80, 0.3) 0%, transparent 40%),
    /* Nebulosa superior rosada */
    radial-gradient(ellipse at 70% 20%, rgba(80, 40, 100, 0.2) 0%, transparent 50%),
    /* Nebulosa inferior verdosa */
    radial-gradient(ellipse at 30% 80%, rgba(40, 80, 60, 0.2) 0%, transparent 45%),
    /* Gradiente base del espacio profundo */
    radial-gradient(ellipse at bottom, #0a0a0f 0%, #000408 50%, #000000 100%),
    /* Capa de profundidad adicional */
    linear-gradient(180deg, rgba(10, 10, 15, 0.8) 0%, rgba(0, 0, 8, 0.9) 100%);
`

export const MultiplierText = styled.div`
  font-size: 48px;
  color: ${props => props.color || '#fff'}; // Use color prop or default to white
  text-shadow: 0 0 20px #fff;
  z-index: 1;
  font-family: monospace;
`


export const Rocket = styled.div`
  position: absolute;
  width: 120px;
  aspect-ratio: 1 / 1;
  background-image: url(${rocketAnimation});
  background-size: contain;
  background-repeat: no-repeat;
  transition: all 0.1s ease-out;
`


