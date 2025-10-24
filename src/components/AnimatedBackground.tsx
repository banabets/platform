import React, { useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'

const BackgroundContainer = styled.div<{ $isHalloween: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;

  /* Background especial de Halloween */
  ${({ $isHalloween }) => $isHalloween && `
    background-image: url('https://getwallpapers.com/wallpaper/full/5/c/0/291652.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;

    /* Overlay para mantener legibilidad */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1;
    }

    /* Ajustar z-index de elementos hijos */
    > * {
      position: relative;
      z-index: 2;
    }
  `}

  @media (max-width: 800px) {
    ${({ $isHalloween }) => $isHalloween && `
      background-attachment: scroll;
      background-size: cover;
    `}
  }

  /* Elementos muy sutiles de Halloween */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      /* Telarañas sutiles */
      radial-gradient(circle at 10% 20%, rgba(150, 150, 150, 0.015) 1px, transparent 1px),
      radial-gradient(circle at 90% 10%, rgba(140, 140, 140, 0.012) 1px, transparent 1px),
      /* Elementos decorativos de Halloween */
      radial-gradient(ellipse at 25% 75%, rgba(255, 140, 0, 0.008) 1px, transparent 2px),
      radial-gradient(ellipse at 75% 25%, rgba(138, 43, 226, 0.006) 1px, transparent 2px);
    background-size: 120px 120px, 100px 100px, 150px 100px, 130px 90px;
    opacity: 0.12;
    animation: halloweenFloat 30s ease-in-out infinite;
  }

  @keyframes halloweenFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-2px) rotate(0.5deg); }
    50% { transform: translateY(-4px) rotate(0deg); }
    75% { transform: translateY(-2px) rotate(-0.5deg); }
  }

  /* Más sutil en móvil */
  @media (max-width: 800px) {
    &::after {
      opacity: 0.12;
    }
  }
`



const ParticleField = styled.canvas<{ $isHalloween?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ $isHalloween }) => $isHalloween ? 0.15 : 0.35}; /* Menos visible durante Halloween */

  @media (max-width: 800px) {
    opacity: ${({ $isHalloween }) => $isHalloween ? 0.1 : 0.28}; /* Aún más sutil en móvil */
  }
`



const GradientOverlay = styled.div<{ $isHalloween?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ $isHalloween }) => $isHalloween ? 0.3 : 1};
  transition: opacity 0.5s ease;
  background: #0f172a; /* Color sólido azul oscuro */

  /* Fondo sólido en móvil */
  @media (max-width: 800px) {
    background: #0f172a; /* Color sólido azul oscuro móvil */
  }
`

const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  twinkle?: boolean
  twinkleSpeed?: number
  twinkleOffset?: number
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Detectar si estamos en octubre (Halloween) - TEMPORALMENTE SIEMPRE TRUE PARA TESTING
  const isHalloween = true // new Date().getMonth() === 9 // Octubre es el mes 9 (0-indexed)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Crear partículas con elementos de Halloween
    const particles: Particle[] = []
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 15))

    for (let i = 0; i < particleCount; i++) {
      const isTwinkler = Math.random() < 0.4 // 40% de las partículas titilan (más)

      let color: string
      let halloweenType: 'ghost' | 'bat' | 'pumpkin' | 'spider' | null = null

      // Si estamos en octubre (Halloween), mostrar elementos de Halloween
      if (isHalloween) {
        // Más calabazas y fantasmas, menos murciélagos y arañas
        const halloweenTypes = ['ghost', 'pumpkin', 'ghost', 'pumpkin', 'ghost', 'pumpkin'] as const
        halloweenType = halloweenTypes[Math.floor(Math.random() * halloweenTypes.length)]
        color = halloweenType === 'pumpkin' ? '#FF6B35' : halloweenType === 'ghost' ? '#E8F4F8' : '#55d292'
      } else {
        // Fuera de Halloween, usar lógica aleatoria para elementos de Halloween
        const isHalloweenRandom = Math.random() < 0.35 // 35% de elementos de Halloween
        if (isHalloweenRandom) {
          const halloweenTypes = ['ghost', 'pumpkin', 'ghost', 'pumpkin', 'ghost', 'pumpkin'] as const
          halloweenType = halloweenTypes[Math.floor(Math.random() * halloweenTypes.length)]
          color = halloweenType === 'pumpkin' ? '#FF6B35' : halloweenType === 'ghost' ? '#E8F4F8' : '#55d292'
        } else {
          // Partículas normales del mismo color verde
          color = '#55d292'
        }
      }

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2, // Más velocidad horizontal
        vy: (Math.random() - 0.5) * 0.6, // Menos velocidad vertical para movimiento más natural
        size: Math.random() * 5 + 2, // Tamaños más variados
        opacity: Math.random() * 0.6 + 0.2, // Más opacas
        color,
        twinkle: isTwinkler,
        twinkleSpeed: isTwinkler ? Math.random() * 0.03 + 0.015 : 0,
        twinkleOffset: isTwinkler ? Math.random() * Math.PI * 2 : 0,
        halloweenType
      } as Particle & { halloweenType?: 'ghost' | 'bat' | 'pumpkin' | 'spider' | null })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        // Actualizar posición
        particle.x += particle.vx
        particle.y += particle.vy

        // Rebotar en los bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Calcular opacidad con efecto twinkle si aplica
        let currentOpacity = particle.opacity
        if (particle.twinkle) {
          particle.twinkleOffset! += particle.twinkleSpeed!
          currentOpacity *= (Math.sin(particle.twinkleOffset!) * 0.3 + 0.7)
        }

        // Dibujar partícula con forma variable
        ctx.globalAlpha = currentOpacity

        const halloweenParticle = particle as Particle & { halloweenType?: 'ghost' | 'bat' | 'pumpkin' | 'spider' | null }

        // Elementos de Halloween mejorados
        if (halloweenParticle.halloweenType === 'ghost') {
          // Dibujar fantasma más detallado y expresivo
          const ghostSize = particle.size * 1.2

          // Cuerpo principal del fantasma
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y - ghostSize)
          ctx.quadraticCurveTo(particle.x - ghostSize, particle.y - ghostSize, particle.x - ghostSize, particle.y)
          ctx.quadraticCurveTo(particle.x - ghostSize, particle.y + ghostSize * 0.7, particle.x, particle.y + ghostSize * 0.7)
          ctx.quadraticCurveTo(particle.x + ghostSize, particle.y + ghostSize * 0.7, particle.x + ghostSize, particle.y)
          ctx.quadraticCurveTo(particle.x + ghostSize, particle.y - ghostSize, particle.x, particle.y - ghostSize)
          ctx.fillStyle = '#E8F4F8' // Blanco fantasmal
          ctx.fill()

          // Detalles ondulados en la base (cola del fantasma)
          ctx.beginPath()
          ctx.moveTo(particle.x - ghostSize, particle.y + ghostSize * 0.7)
          ctx.quadraticCurveTo(particle.x - ghostSize * 0.5, particle.y + ghostSize * 0.9, particle.x, particle.y + ghostSize * 0.8)
          ctx.quadraticCurveTo(particle.x + ghostSize * 0.5, particle.y + ghostSize * 0.9, particle.x + ghostSize, particle.y + ghostSize * 0.7)
          ctx.fillStyle = '#E8F4F8' // Blanco fantasmal
          ctx.fill()

          // Ojos grandes y expresivos
          ctx.beginPath()
          ctx.arc(particle.x - ghostSize * 0.3, particle.y - ghostSize * 0.2, ghostSize * 0.18, 0, Math.PI * 2)
          ctx.arc(particle.x + ghostSize * 0.3, particle.y - ghostSize * 0.2, ghostSize * 0.18, 0, Math.PI * 2)
          ctx.fillStyle = '#000' // Negro para los ojos
          ctx.fill()

          // Brillos en los ojos para dar vida
          ctx.beginPath()
          ctx.arc(particle.x - ghostSize * 0.25, particle.y - ghostSize * 0.25, ghostSize * 0.05, 0, Math.PI * 2)
          ctx.arc(particle.x + ghostSize * 0.35, particle.y - ghostSize * 0.25, ghostSize * 0.05, 0, Math.PI * 2)
          ctx.fillStyle = '#FFF' // Blanco para los brillos
          ctx.fill()

        } else if (halloweenParticle.halloweenType === 'bat') {
          // Dibujar murciélago con color verde
          ctx.beginPath()
          // Alas
          ctx.ellipse(particle.x - particle.size * 0.8, particle.y, particle.size * 0.6, particle.size * 0.3, Math.PI / 4, 0, Math.PI * 2)
          ctx.ellipse(particle.x + particle.size * 0.8, particle.y, particle.size * 0.6, particle.size * 0.3, -Math.PI / 4, 0, Math.PI * 2)
          // Cuerpo
          ctx.ellipse(particle.x, particle.y + particle.size * 0.2, particle.size * 0.4, particle.size * 0.6, 0, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.fill()

          // Ojos pequeños para el murciélago
          ctx.beginPath()
          ctx.arc(particle.x - particle.size * 0.15, particle.y, particle.size * 0.08, 0, Math.PI * 2)
          ctx.arc(particle.x + particle.size * 0.15, particle.y, particle.size * 0.08, 0, Math.PI * 2)
          ctx.fillStyle = '#0d2a1f' // Verde oscuro para contraste
          ctx.fill()

        } else if (halloweenParticle.halloweenType === 'pumpkin') {
          // Dibujar calabaza más detallada con color naranja Halloween
          const pumpkinSize = particle.size * 0.9

          // Cuerpo principal de la calabaza
          ctx.beginPath()
          ctx.ellipse(particle.x, particle.y, pumpkinSize, pumpkinSize * 0.7, 0, 0, Math.PI * 2)
          ctx.fillStyle = '#FF6B35' // Naranja Halloween
          ctx.fill()

          // Líneas verticales características de la calabaza
          ctx.strokeStyle = '#D45500' // Naranja más oscuro
          ctx.lineWidth = 2
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8
            ctx.beginPath()
            ctx.moveTo(particle.x + Math.cos(angle) * pumpkinSize * 0.2, particle.y + Math.sin(angle) * pumpkinSize * 0.2)
            ctx.lineTo(particle.x + Math.cos(angle) * pumpkinSize * 0.9, particle.y + Math.sin(angle) * pumpkinSize * 0.9)
            ctx.stroke()
          }

          // Tallo curvado
          ctx.beginPath()
          ctx.ellipse(particle.x, particle.y - pumpkinSize * 1.1, pumpkinSize * 0.12, pumpkinSize * 0.25, -0.3, 0, Math.PI * 2)
          ctx.fillStyle = '#2D5016' // Verde oscuro para el tallo
          ctx.fill()

          // Ojos triangulares más definidos
          ctx.beginPath()
          ctx.moveTo(particle.x - pumpkinSize * 0.4, particle.y - pumpkinSize * 0.2)
          ctx.lineTo(particle.x - pumpkinSize * 0.2, particle.y + pumpkinSize * 0.1)
          ctx.lineTo(particle.x - pumpkinSize * 0.6, particle.y + pumpkinSize * 0.1)
          ctx.closePath()
          ctx.moveTo(particle.x + pumpkinSize * 0.4, particle.y - pumpkinSize * 0.2)
          ctx.lineTo(particle.x + pumpkinSize * 0.2, particle.y + pumpkinSize * 0.1)
          ctx.lineTo(particle.x + pumpkinSize * 0.6, particle.y + pumpkinSize * 0.1)
          ctx.closePath()
          ctx.fillStyle = '#000' // Negro para los ojos
          ctx.fill()

          // Boca triangular con dientes
          ctx.beginPath()
          ctx.moveTo(particle.x - pumpkinSize * 0.35, particle.y + pumpkinSize * 0.3)
          ctx.lineTo(particle.x - pumpkinSize * 0.15, particle.y + pumpkinSize * 0.45)
          ctx.lineTo(particle.x - pumpkinSize * 0.05, particle.y + pumpkinSize * 0.35)
          ctx.lineTo(particle.x + pumpkinSize * 0.05, particle.y + pumpkinSize * 0.45)
          ctx.lineTo(particle.x + pumpkinSize * 0.15, particle.y + pumpkinSize * 0.35)
          ctx.lineTo(particle.x + pumpkinSize * 0.35, particle.y + pumpkinSize * 0.45)
          ctx.lineTo(particle.x + pumpkinSize * 0.35, particle.y + pumpkinSize * 0.3)
          ctx.closePath()
          ctx.fillStyle = '#000' // Negro para la boca
          ctx.fill()

        } else if (halloweenParticle.halloweenType === 'spider') {
          // Dibujar araña con color verde
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.fill()

          // Ojos pequeños para la araña
          ctx.beginPath()
          ctx.arc(particle.x - particle.size * 0.15, particle.y - particle.size * 0.1, particle.size * 0.08, 0, Math.PI * 2)
          ctx.arc(particle.x + particle.size * 0.15, particle.y - particle.size * 0.1, particle.size * 0.08, 0, Math.PI * 2)
          ctx.fillStyle = '#0d2a1f' // Verde oscuro para los ojos
          ctx.fill()

          // Patas con color verde
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4
            const legLength = particle.size * 0.8
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particle.x + Math.cos(angle) * legLength, particle.y + Math.sin(angle) * legLength)
            ctx.strokeStyle = particle.color
            ctx.lineWidth = 1.5
            ctx.stroke()
          }

        } else if (particle.color === '#FFD700' || particle.color === '#FFA500') {
          // Dibujar estrella
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
            const x = particle.x + Math.cos(angle) * particle.size
            const y = particle.y + Math.sin(angle) * particle.size
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)

            const innerAngle = angle + Math.PI / 5
            const innerX = particle.x + Math.cos(innerAngle) * (particle.size * 0.4)
            const innerY = particle.y + Math.sin(innerAngle) * (particle.size * 0.4)
            ctx.lineTo(innerX, innerY)
          }
          ctx.closePath()
          ctx.fillStyle = particle.color
          ctx.fill()

          // Añadir brillo especial para doradas
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.globalAlpha = particle.opacity * 0.2
          ctx.fill()
        } else {
          // Dibujar círculo normal
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.fill()

          // Añadir brillo
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.globalAlpha = particle.opacity * 0.3
          ctx.fill()
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])


  return (
    <BackgroundContainer $isHalloween={isHalloween}>
      <GradientOverlay $isHalloween={isHalloween} />
      <ParticleField ref={canvasRef} $isHalloween={isHalloween} />

    </BackgroundContainer>
  )
}
