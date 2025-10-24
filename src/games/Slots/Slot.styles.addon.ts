
import styled from 'styled-components'

export const SymbolImg = styled.img`
  width: 84%;
  height: auto;
  will-change: transform;
  transition: transform 160ms ease;

  &.is-winning {
    filter: drop-shadow(0 0 8px rgba(255, 209, 102, .95));
    animation: hitPulse 700ms ease-out;
  }

  @keyframes hitPulse {
    0% { transform: scale(1) }
    50% { transform: scale(1.06) }
    100% { transform: scale(1) }
  }
`
