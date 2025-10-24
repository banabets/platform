import styled from 'styled-components'
import React from 'react'

export const ScreenWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: black;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }

  @keyframes candleAppear {
    0% {
      opacity: 0;
      transform: scaleY(0.1) scaleX(0.8);
    }
    40% {
      opacity: 0.7;
      transform: scaleY(1.1) scaleX(1.1);
    }
    70% {
      opacity: 0.9;
      transform: scaleY(0.95) scaleX(1.05);
    }
    100% {
      opacity: 1;
      transform: scaleY(1) scaleX(1);
    }
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.3);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.05);
    }
    70% {
      transform: translate(-50%, -50%) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes glowPulse {
    0%, 100% {
      filter: drop-shadow(0 0 5px rgba(0, 255, 136, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 15px rgba(0, 255, 136, 0.8));
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes particleFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.7;
    }
    25% {
      transform: translateY(-20px) rotate(90deg);
      opacity: 1;
    }
    50% {
      transform: translateY(-10px) rotate(180deg);
      opacity: 0.8;
    }
    75% {
      transform: translateY(-30px) rotate(270deg);
      opacity: 0.9;
    }
  }

  @keyframes resultSlideIn {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5) rotate(-10deg);
    }
    50% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
    }
  }

  @keyframes moonBounce {
    0% {
      transform: translateY(0px) scale(1);
    }
    100% {
      transform: translateY(-10px) scale(1.05);
    }
  }

  @keyframes crashShake {
    0%, 100% {
      transform: translateX(0px) rotate(0deg);
    }
    25% {
      transform: translateX(-5px) rotate(-2deg);
    }
    75% {
      transform: translateX(5px) rotate(2deg);
    }
  }

  @keyframes textGlow {
    0% {
      text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
    }
    100% {
      text-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 90px currentColor;
    }
  }

  @keyframes multiplierPulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 20px currentColor;
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 30px currentColor, 0 0 40px currentColor;
    }
  }


  @keyframes progressPulse {
    0%, 100% {
      opacity: 0.6;
      transform: scaleX(1);
    }
    50% {
      opacity: 1;
      transform: scaleX(1.2);
    }
  }

  @keyframes alertPulse {
    0%, 100% {
      transform: translateX(-50%) scale(1);
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }
    50% {
      transform: translateX(-50%) scale(1.05);
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
    }
  }
`

export const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const MultiplierText = styled.div<{ color: string }>`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 24px;
  color: ${(props) => props.color || 'white'};
`

export const Grid = styled.rect.attrs(() => ({
  width: '100%',
  height: '100%',
  fill: 'none',
  stroke: '#333',
  'stroke-width': 0.5,
}))``

// Componente Candle para renderizar velas japonesas (en el SVG)
type CandleProps = {
  x: number
  open: number
  close: number
  high: number
  low: number
}

export const Candle: React.FC<CandleProps> = ({ x, open, close, high, low }) => (
  <g transform={`translate(${x * 3},0)`}>
    <line
      x1={0}
      y1={100 - high}
      x2={0}
      y2={100 - low}
      stroke="#ffffff"
      strokeWidth={1}
    />
    <rect
      x={-1.5}
      y={100 - Math.max(open, close)}
      width={3}
      height={Math.max(2, Math.abs(close - open))}
      fill={close > open ? '#00ff00' : '#ff0000'}
    />
  </g>
)
