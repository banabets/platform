
import { GambaUi, useGame, useWagerInput } from 'gamba-react-ui-v2'
import React from 'react'
import CustomSlider from './Slider'
import {
  ChartWrapper,
  ScreenWrapper,
} from './styles'
import { calculateBetArray } from './utils'

export default function CryptoChartGame() {
  const [wager, setWager] = useWagerInput()
  const [multiplierTarget, setMultiplierTarget] = React.useState(1.5)
  const [currentMultiplier, setCurrentMultiplier] = React.useState(0)
  const [basePrice] = React.useState(160)
  const [gameState, setGameState] = React.useState<'idle' | 'win' | 'crash'>('idle')
  const [candles, setCandles] = React.useState<Array<{
    open: number;
    close: number;
    high: number;
    low: number;
    isRed: boolean;
  }>>([])
  const [finalMultiplier, setFinalMultiplier] = React.useState(0)

  const viewBoxWidth = 300
  const viewBoxHeight = 100
  const animationRef = React.useRef<NodeJS.Timeout | null>(null)
  const game = useGame()

  const generateCandle = (prevClose: number) => {
    const trendUp = 0.7
    const noise = (Math.random() - 0.5) * 1.5

    let open = prevClose
    let close = prevClose + trendUp + noise

    let isRed = false

    if (Math.random() < 0.35) {
      close = Math.max(1, prevClose - Math.random() * 2)
      isRed = true
    }

    const high = Math.max(open, close) + Math.random() * 0.5
    const low = Math.min(open, close) - Math.random() * 0.5

    return { open, close, high, low, isRed }
  }

  const animate = (current: number, target: number, win: boolean) => {
    setCurrentMultiplier(current)

    setCandles(prev => {
      const last = prev[prev.length - 1]
      const prevClose = last ? last.close : 100
      const newCandle = generateCandle(prevClose)
      return [...prev, newCandle]
    })

    if (current >= target) {
      setGameState(win ? 'win' : 'crash')
      setCurrentMultiplier(target)
      setFinalMultiplier(target)
      return
    }
    animationRef.current = setTimeout(() => animate(current + 0.03, target, win), 100)
  }

  const calculateBiasedLowMultiplier = (targetMultiplier: number) => {
    const randomValue = Math.random()
    const maxPossibleMultiplier = Math.min(targetMultiplier, 12)
    const exponent = randomValue > 0.95 ? 2.8 : (targetMultiplier > 10 ? 5 : 6)
    const result = 1 + Math.pow(randomValue, exponent) * (maxPossibleMultiplier - 1)
    return parseFloat(result.toFixed(2))
  }

  const play = async () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    setGameState('idle')
    setCandles([])
    const betArray = calculateBetArray(multiplierTarget)
    await game.play({ wager, bet: betArray })
    const result = await game.result()
    const win = result.payout > 0
    const targetMultiplier = win ? multiplierTarget : calculateBiasedLowMultiplier(multiplierTarget)
    animate(0, targetMultiplier, win)
  }

  const Candle = ({
    index,
    open,
    close,
    high,
    low,
    minPrice,
    maxPrice,
    isNew
  }: {
    index: number;
    open: number;
    close: number;
    high: number;
    low: number;
    minPrice: number;
    maxPrice: number;
    isNew?: boolean;
  }) => {
    const isUp = close >= open
    const color = isUp ? 'url(#greenGradient)' : 'url(#redGradient)'
    const shadowColor = isUp ? 'url(#greenShadow)' : 'url(#redShadow)'
    const wickColor = isUp ? '#00ff88' : '#ff6b6b'
    const wickGlowColor = isUp ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 107, 107, 0.6)'
    const scaleY = viewBoxHeight / (maxPrice - minPrice)

    const openY = viewBoxHeight - (open - minPrice) * scaleY
    const closeY = viewBoxHeight - (close - minPrice) * scaleY
    const highY = viewBoxHeight - (high - minPrice) * scaleY
    const lowY = viewBoxHeight - (low - minPrice) * scaleY

    const height = Math.max(6, Math.abs(closeY - openY))
    const bodyWidth = 8
    const wickWidth = isUp ? 1.5 : 1.2
    const x = index * 12

    // Calcular si es una vela pequeña (doji-like)
    const isDoji = height < 8

    return (
      <g
        transform={`translate(${x},0)`}
        style={{
          animation: isNew ? 'candleAppear 0.4s ease-out' : 'none'
        }}
      >
        {/* Sombra externa sutil */}
        <ellipse
          cx={0}
          cy={(openY + closeY) / 2}
          rx={bodyWidth / 2 + 2}
          ry={height / 2 + 2}
          fill={shadowColor}
          opacity="0.3"
        />

        {/* Sombra del wick superior */}
        <line
          x1={-0.5}
          y1={highY}
          x2={0.5}
          y2={highY}
          stroke={wickGlowColor}
          strokeWidth="3"
          opacity="0.4"
        />

        {/* Sombra del wick inferior */}
        <line
          x1={-0.5}
          y1={lowY}
          x2={0.5}
          y2={lowY}
          stroke={wickGlowColor}
          strokeWidth="3"
          opacity="0.4"
        />

        {/* Líneas de alta/baja (wick) mejoradas */}
        <line
          x1={0}
          y1={highY}
          x2={0}
          y2={Math.min(openY, closeY) - 1}
          stroke={wickColor}
          strokeWidth={wickWidth}
          strokeLinecap="round"
        />
        <line
          x1={0}
          y1={Math.max(openY, closeY) + 1}
          x2={0}
          y2={lowY}
          stroke={wickColor}
          strokeWidth={wickWidth}
          strokeLinecap="round"
        />

        {/* Sombra del cuerpo de la vela */}
        <rect
          x={-bodyWidth/2 - 0.5}
          y={Math.min(openY, closeY) - 0.5}
          width={bodyWidth + 1}
          height={height + 1}
          fill={isUp ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 107, 107, 0.2)'}
          rx={1}
        />

        {/* Cuerpo principal de la vela con gradiente mejorado */}
        <rect
          x={-bodyWidth/2}
          y={Math.min(openY, closeY)}
          width={bodyWidth}
          height={height}
          fill={color}
          rx={isDoji ? 0.5 : 1}
          stroke={wickColor}
          strokeWidth="0.3"
          filter={isNew ? 'url(#premiumGlow)' : 'none'}
        />

        {/* Efecto de brillo superior para velas alcistas */}
        {isUp && (
          <rect
            x={-bodyWidth/2}
            y={Math.min(openY, closeY)}
            width={bodyWidth}
            height={height * 0.3}
            fill="rgba(255, 255, 255, 0.1)"
            rx={1}
            opacity="0.6"
          />
        )}

        {/* Efecto de profundidad para velas bajistas */}
        {!isUp && (
          <rect
            x={-bodyWidth/2}
            y={Math.max(openY, closeY) - height * 0.3}
            width={bodyWidth}
            height={height * 0.3}
            fill="rgba(0, 0, 0, 0.2)"
            rx={1}
          />
        )}
      </g>
    )
  }

  const allHighs = candles.map(c => c.high)
  const allLows = candles.map(c => c.low)
  const maxPrice = Math.max(...allHighs, 105)
  const minPrice = Math.min(...allLows, 95)
  const buffer = 10
  const adjustedMin = Math.max(0, minPrice - buffer)
  const adjustedMax = maxPrice + buffer

  const statusText = gameState === 'win'
    ? `MOON 🚀 (${finalMultiplier.toFixed(2)}x)`
    : gameState === 'crash'
      ? `RUGGED 💥 (${finalMultiplier.toFixed(2)}x)`
      : ''

  const statusColor = gameState === 'win' ? '#00c853' : gameState === 'crash' ? '#d50000' : '#ffffff'
  const bgColor = gameState === 'win'
    ? '#003300'
    : gameState === 'crash'
      ? '#330000'
      : '#000000'

  const offsetX = Math.max(0, candles.length * 12 - viewBoxWidth)
  const simulatedPrice = (basePrice * (currentMultiplier || 1)).toFixed(2)

  return (
    <>
      <GambaUi.Portal target="screen">
        <ScreenWrapper style={{
          background: gameState === 'idle'
            ? 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' // Background más real de chart
            : bgColor,
          position: 'relative',
          transition: 'background 0.5s ease-in-out',
        }}>
          {(gameState === 'idle') && (
            <ChartWrapper>
              <svg width="100%" height="100%" viewBox={`${offsetX} 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="none">
                <defs>
                  {/* Gradientes para velas premium */}
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff88" />
                    <stop offset="20%" stopColor="#00ee7a" />
                    <stop offset="50%" stopColor="#00dd77" />
                    <stop offset="80%" stopColor="#00cc66" />
                    <stop offset="100%" stopColor="#00aa55" />
                  </linearGradient>
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="20%" stopColor="#ff5c5c" />
                    <stop offset="50%" stopColor="#ff5555" />
                    <stop offset="80%" stopColor="#ff4444" />
                    <stop offset="100%" stopColor="#cc3333" />
                  </linearGradient>

                  {/* Gradientes para sombras */}
                  <radialGradient id="greenShadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(0, 255, 136, 0.4)" />
                    <stop offset="100%" stopColor="rgba(0, 255, 136, 0.1)" />
                  </radialGradient>
                  <radialGradient id="redShadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255, 107, 107, 0.4)" />
                    <stop offset="100%" stopColor="rgba(255, 107, 107, 0.1)" />
                  </radialGradient>

                  {/* Gradiente para el fondo del grid - estilo chart profesional */}
                  <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(10, 10, 10, 0.98)" />
                    <stop offset="50%" stopColor="rgba(20, 20, 20, 0.95)" />
                    <stop offset="100%" stopColor="rgba(10, 10, 10, 0.98)" />
                  </linearGradient>

                  {/* Filtros mejorados para velas */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  {/* Filtro premium para velas nuevas */}
                  <filter id="premiumGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMorphology operator="dilate" radius="1"/>
                    <feColorMatrix type="matrix" values="1 0.8 0.6 0 0  0.8 1 0.4 0 0  0.6 0.4 1 0 0  0 0 0 1 0"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Fondo con gradiente sutil */}
                <rect
                  x={offsetX}
                  y={0}
                  width={viewBoxWidth}
                  height={viewBoxHeight}
                  fill="url(#gridGradient)"
                />

                {/* Grid estilo chart profesional */}
                {[...Array(8)].map((_, i) => (
                  <line
                    key={`grid-${i}`}
                    x1={offsetX}
                    x2={offsetX + viewBoxWidth}
                    y1={(i + 1) * (viewBoxHeight / 9)}
                    y2={(i + 1) * (viewBoxHeight / 9)}
                    stroke="rgba(55, 65, 81, 0.25)" // gray-700 con opacidad muy baja
                    strokeWidth="0.3"
                    opacity="0.3"
                  />
                ))}
                {/* Grid vertical sutil */}
                {[...Array(4)].map((_, i) => (
                  <line
                    key={`vgrid-${i}`}
                    x1={offsetX + (i + 1) * (viewBoxWidth / 5)}
                    x2={offsetX + (i + 1) * (viewBoxWidth / 5)}
                    y1={0}
                    y2={viewBoxHeight}
                    stroke="rgba(55, 65, 81, 0.15)"
                    strokeWidth="0.2"
                    opacity="0.2"
                  />
                ))}

                {/* Grupo de velas con animación */}
                <g>
                  {candles.map((candle, idx) => (
                    <Candle
                      key={idx}
                      index={idx}
                      open={candle.open}
                      close={candle.close}
                      high={candle.high}
                      low={candle.low}
                      minPrice={adjustedMin}
                      maxPrice={adjustedMax}
                      isNew={idx === candles.length - 1}
                    />
                  ))}
                </g>

                {/* Línea de tendencia sutil */}
                {candles.length > 1 && (
                  <path
                    d={`M${0 * 12} ${viewBoxHeight - (candles[0].close - adjustedMin) * (viewBoxHeight / (adjustedMax - adjustedMin))}
                      ${candles.slice(1).map((candle, idx) =>
                        `L${(idx + 1) * 12} ${viewBoxHeight - (candle.close - adjustedMin) * (viewBoxHeight / (adjustedMax - adjustedMin))}`
                      ).join(' ')}`}
                    stroke="rgba(0, 255, 136, 0.4)"
                    strokeWidth="1"
                    fill="none"
                    filter="url(#glow)"
                  />
                )}
              </svg>

              {/* Panel superior organizado */}
              <div style={{
                position: 'absolute',
                top: 15,
                left: 15,
                right: 15,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* Panel izquierdo: Símbolo y precio */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {/* Indicador de Solana */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(10, 10, 10, 0.85)',
                    padding: '6px 10px',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00ff88 0%, #00dd77 50%, #00aa55 100%)',
                      marginRight: 6,
                      boxShadow: '0 0 8px rgba(0, 255, 136, 0.6)',
                      animation: 'pulse 2s infinite'
                    }} />
                    <div style={{
                      color: '#00ff88',
                      fontSize: 14,
                      fontWeight: 'bold',
                      textShadow: '0 0 5px rgba(0, 255, 136, 0.3)'
                    }}>
                      SOL/USD
                    </div>
                  </div>

                  {/* Precio actual */}
                  <div style={{
                    color: '#00ff88',
                    fontSize: 28,
                    fontWeight: 'bold',
                    textShadow: '0 0 12px rgba(0, 255, 136, 0.8)',
                    background: 'rgba(10, 10, 10, 0.85)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    backdropFilter: 'blur(12px)'
                  }}>
                    ${simulatedPrice}
                  </div>
                </div>

                {/* Panel derecho: Multiplicador */}
                <div style={{
                  color: '#00ff88',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textShadow: '0 0 12px rgba(0, 255, 136, 0.8)',
                  background: 'rgba(10, 10, 10, 0.85)',
                  padding: '6px 14px',
                  borderRadius: '14px',
                  border: '1px solid rgba(0, 255, 136, 0.4)',
                  backdropFilter: 'blur(12px)'
                }}>
                  {currentMultiplier.toFixed(2)}x
                </div>
              </div>

              {/* Barra de progreso avanzada */}
              <div style={{
                position: 'absolute',
                bottom: 15,
                left: 15,
                right: 15,
                height: 6,
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0, 255, 136, 0.3)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (currentMultiplier / multiplierTarget) * 100)}%`,
                  background: 'linear-gradient(90deg, #00ff88, #00cc66)',
                  borderRadius: 3,
                  transition: 'width 0.1s ease-out',
                  boxShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
                  position: 'relative'
                }}>
                  {/* Indicador de pulso cuando está cerca del objetivo */}
                  {currentMultiplier / multiplierTarget > 0.8 && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '20px',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8))',
                      animation: 'progressPulse 1s ease-in-out infinite'
                    }} />
                  )}
                </div>

                {/* Marcador del objetivo */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '100%',
                  width: '2px',
                  background: '#00ff88',
                  boxShadow: '0 0 8px #00ff88'
                }} />
              </div>

              {/* Indicador de proximidad al objetivo */}
              {currentMultiplier / multiplierTarget > 0.7 && (
                <div style={{
                  position: 'absolute',
                  bottom: 30,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  border: '1px solid #00ff88',
                  color: '#00ff88',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  animation: 'alertPulse 0.8s ease-in-out infinite',
                  backdropFilter: 'blur(10px)'
                }}>
                  🎯 Close to Target!
                </div>
              )}

              {/* Indicador de volatilidad - menos prominente */}
              <div style={{
                position: 'absolute',
                bottom: 50,
                right: 15,
                background: 'rgba(10, 10, 10, 0.6)',
                padding: '3px 6px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 165, 0, 0.2)',
                color: '#ffa500',
                fontSize: '9px',
                fontWeight: '500',
                opacity: 0.7,
                backdropFilter: 'blur(8px)'
              }}>
                VOLATILE
              </div>

              {/* Panel inferior derecho - indicadores sutiles */}
              <div style={{
                position: 'absolute',
                bottom: 25,
                right: 15,
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                {/* Contador de tiempo estimado */}
                <div style={{
                  background: 'rgba(10, 10, 10, 0.6)',
                  padding: '3px 6px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  color: '#00ff88',
                  fontSize: '9px',
                  fontWeight: '500',
                  opacity: 0.7,
                  backdropFilter: 'blur(8px)'
                }}>
                  {Math.max(1, Math.round((multiplierTarget - currentMultiplier) / 0.03))}s
                </div>
              </div>
            </ChartWrapper>
          )}
          {(gameState === 'win' || gameState === 'crash') && (
            <>
              {/* Overlay con efecto de desenfoque */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: gameState === 'win'
                  ? 'radial-gradient(circle, rgba(0, 200, 100, 0.3) 0%, rgba(0, 100, 50, 0.6) 50%, rgba(0, 50, 25, 0.8) 100%)'
                  : 'radial-gradient(circle, rgba(200, 0, 0, 0.3) 0%, rgba(100, 0, 0, 0.6) 50%, rgba(50, 0, 0, 0.8) 100%)',
                backdropFilter: 'blur(2px)',
                animation: 'fadeIn 0.3s ease-out',
                zIndex: 5
              }} />

              {/* Partículas de fondo */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                zIndex: 6
              }}>
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: '4px',
                      height: '4px',
                      background: gameState === 'win' ? '#00ff88' : '#ff4757',
                      borderRadius: '50%',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `particleFloat ${2 + Math.random() * 3}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 2}s`,
                      boxShadow: `0 0 ${gameState === 'win' ? '10px' : '8px'} ${gameState === 'win' ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 71, 87, 0.6)'}`
                    }}
                  />
                ))}
              </div>

              {/* Contenedor principal del resultado */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 10,
                animation: 'resultSlideIn 0.8s ease-out'
              }}>
                {/* Emoji principal con glow */}
                <div style={{
                  fontSize: gameState === 'win' ? '120px' : '100px',
                  marginBottom: '20px',
                  animation: gameState === 'win' ? 'moonBounce 1s ease-out infinite alternate' : 'crashShake 0.5s ease-in-out infinite',
                  textShadow: gameState === 'win'
                    ? '0 0 30px #00ff88, 0 0 60px #00ff88, 0 0 90px #00ff88'
                    : '0 0 30px #ff4757, 0 0 60px #ff4757, 0 0 90px #ff4757'
                }}>
                  {gameState === 'win' ? '🚀' : '💥'}
                </div>

                {/* Texto principal */}
                <div style={{
                  color: statusColor,
                  fontSize: gameState === 'win' ? '48px' : '42px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  textShadow: `0 0 20px ${statusColor}, 0 0 40px ${statusColor}`,
                  animation: 'textGlow 1.5s ease-in-out infinite alternate'
                }}>
                  {gameState === 'win' ? 'MOON' : 'RUGGED'}
                </div>

                {/* Multiplicador */}
                <div style={{
                  color: '#fff',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  border: `2px solid ${statusColor}`,
                  display: 'inline-block',
                  marginBottom: '20px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  boxShadow: `0 0 20px ${statusColor}50`,
                  animation: 'multiplierPulse 1s ease-in-out infinite'
                }}>
                  {finalMultiplier.toFixed(2)}x
                </div>

                {/* Mensaje adicional */}
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginTop: '15px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)'
                }}>
                  {gameState === 'win'
                    ? '🎉 Congratulations! You caught the moon!'
                    : '😢 Better luck next time, anon!'
                  }
                </div>
              </div>

            </>
          )}
        </ScreenWrapper>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />
        <CustomSlider value={multiplierTarget} onChange={setMultiplierTarget} />
        <GambaUi.PlayButton onClick={play}>Play</GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  )
}
