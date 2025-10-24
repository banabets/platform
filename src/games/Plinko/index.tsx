import { GambaUi, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import React from 'react'
import { PEG_RADIUS, PLINKO_RAIUS, Plinko as PlinkoGame, PlinkoProps, barrierHeight, barrierWidth, bucketHeight } from './game'

import BUMP from './bump.mp3'
import FALL from './fall.mp3'
import WIN from './win.mp3'

function usePlinko(props: PlinkoProps, deps: React.DependencyList) {
  const [plinko, set] = React.useState<PlinkoGame>(null!)

  React.useEffect(
    () => {
      const p = new PlinkoGame(props)
      set(p)
      return () => p.cleanup()
    },
    deps,
  )

  return plinko
}

const DEGEN_BET = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 10, 10, 10, 15]
const BET = [.5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 3, 3, 3, 3, 3, 3, 3, 6]

export default function Plinko() {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const [wager, setWager] = useWagerInput()
  const [debug, setDebug] = React.useState(false)
  const [degen, setDegen] = React.useState(false)
  const sounds = useSound({
    bump: BUMP,
    win: WIN,
    fall: FALL,
  })

  const pegAnimations = React.useRef<Record<number, number>>({})
  const bucketAnimations = React.useRef<Record<number, number>>({})

  // Particle system for visual effects
  const particles = React.useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    color: string
    size: number
    type: 'spark' | 'dust' | 'trail'
  }>>([])

  // Ball trail points for motion blur effect
  const ballTrail = React.useRef<Array<{x: number, y: number, alpha: number}>>([])

  const bet = degen ? DEGEN_BET : BET
  const rows = degen ? 12 : 14

  const multipliers = React.useMemo(() => Array.from(new Set(bet)), [bet])

  // Particle system functions
  const createSparkParticles = (x: number, y: number, count: number = 5) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 3
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color: Math.random() > 0.5 ? '#ffffff' : '#ffff88',
        size: 1 + Math.random() * 2,
        type: 'spark'
      })
    }
  }

  const createDustParticles = (x: number, y: number) => {
    if (Math.random() < 0.1) { // Occasional dust
      particles.current.push({
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1,
        maxLife: 1,
        color: '#ffffff',
        size: 0.5 + Math.random() * 1,
        type: 'dust'
      })
    }
  }

  const updateParticles = (deltaTime: number) => {
    // Update existing particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i]
      p.x += p.vx * deltaTime
      p.y += p.vy * deltaTime
      p.vy += 0.1 * deltaTime // Gravity for sparks
      p.life -= deltaTime * 2

      if (p.life <= 0) {
        particles.current.splice(i, 1)
      }
    }

    // Add cosmic dust occasionally
    if (Math.random() < 0.02) {
      createDustParticles(
        Math.random() * (plinko?.width || 400),
        Math.random() * (plinko?.height || 600)
      )
    }
  }

  const plinko = usePlinko({
    rows,
    multipliers,
    onContact(contact) {
      if (contact.peg && contact.plinko) {
        pegAnimations.current[contact.peg.plugin.pegIndex] = 1
        sounds.play('bump', { playbackRate: 1 + Math.random() * .05 })

        // Create spark particles at collision point
        const worldPos = contact.peg.position
        createSparkParticles(worldPos.x, worldPos.y, 3 + Math.floor(Math.random() * 3))
      }
      if (contact.barrier && contact.plinko) {
        sounds.play('bump', { playbackRate: .5 + Math.random() * .05 })
      }
      if (contact.bucket && contact.plinko) {
        bucketAnimations.current[contact.bucket.plugin.bucketIndex] = 1
        sounds.play(contact.bucket.plugin.bucketMultiplier >= 1 ? 'win' : 'fall')
      }
    },
  }, [rows, multipliers])

  const play = async () => {
    await game.play({ wager, bet })
    const result = await game.result()

    // Clear particles and trail
    particles.current.length = 0
    ballTrail.current.length = 0

    plinko.reset()
    plinko.run(result.multiplier)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Canvas
          render={({ ctx, size }, clock) => {
            if (!plinko) return

            const bodies = plinko.getBodies()

            const xx = size.width / plinko.width
            const yy = size.height / plinko.height
            const s = Math.min(xx, yy)

            // Update particle system
            updateParticles(1/60) // Assuming 60fps

            ctx.clearRect(0, 0, size.width, size.height)
            ctx.fillStyle = '#0b0b13'
            ctx.fillRect(0, 0, size.width, size.height)

            // Add subtle starfield effect
            for (let i = 0; i < 50; i++) {
              const x = (i * 37) % size.width
              const y = (i * 23) % size.height
              const alpha = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
              ctx.beginPath()
              ctx.arc(x, y, 1, 0, Math.PI * 2)
              ctx.fill()
            }
            ctx.save()
            ctx.translate(size.width / 2 - plinko.width / 2 * s, size.height / 2 - plinko.height / 2 * s)
            ctx.scale(s, s)
            if (debug) {
              ctx.beginPath()
              bodies.forEach(
                ({ vertices }, i) => {
                  ctx.moveTo(vertices[0].x, vertices[0].y)
                  for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y)
                  }
                  ctx.lineTo(vertices[0].x, vertices[0].y)
                },
              )
              ctx.lineWidth = 1
              ctx.strokeStyle = '#fff'
              ctx.stroke()
            } else {
              bodies.forEach(
                (body, i) => {
                  const { label, position } = body
                  if (label === 'Peg') {
                    ctx.save()
                    ctx.translate(position.x, position.y)

                    const animation = pegAnimations.current[body.plugin.pegIndex] ?? 0

                    if (pegAnimations.current[body.plugin.pegIndex]) {
                      pegAnimations.current[body.plugin.pegIndex] *= .9
                    }
                    ctx.scale(1 + animation * .4, 1 + animation * .4)

                    // Enhanced peg colors with gradual transitions - more vibrant and metallic
                    const time = Date.now() * 0.001
                    const pegHue = (position.y * 0.5 + position.x * 0.3 + time * 30) % 360
                    const saturation = 85 + animation * 10
                    const lightness = 65 + animation * 15

                    // Outer glow effect
                    ctx.shadowColor = 'hsla(' + pegHue + ', 100%, 70%, 0.6)'
                    ctx.shadowBlur = 8 + animation * 4
                    ctx.fillStyle = 'hsla(' + pegHue + ', ' + saturation + '%, ' + lightness + '%, 0.4)'
                    ctx.beginPath()
                    ctx.arc(0, 0, PEG_RADIUS + 6, 0, Math.PI * 2)
                    ctx.fill()

                    // Main peg body with metallic effect
                    ctx.shadowBlur = 0
                    const gradient = ctx.createRadialGradient(0, -PEG_RADIUS/2, 0, 0, 0, PEG_RADIUS)
                    gradient.addColorStop(0, 'hsla(' + pegHue + ', 90%, 85%, 1)')
                    gradient.addColorStop(0.7, 'hsla(' + pegHue + ', 95%, 75%, 1)')
                    gradient.addColorStop(1, 'hsla(' + pegHue + ', 100%, 50%, 1)')
                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(0, 0, PEG_RADIUS, 0, Math.PI * 2)
                    ctx.fill()

                    // Highlight reflection
                    ctx.fillStyle = 'hsla(' + pegHue + ', 100%, 95%, 0.8)'
                    ctx.beginPath()
                    ctx.arc(-PEG_RADIUS/3, -PEG_RADIUS/3, PEG_RADIUS/3, 0, Math.PI * 2)
                    ctx.fill()

                    ctx.restore()
                  }
                  if (label === 'Plinko') {
                    // Update ball trail
                    ballTrail.current.push({
                      x: position.x,
                      y: position.y,
                      alpha: 1
                    })

                    // Keep only last 8 trail points
                    if (ballTrail.current.length > 8) {
                      ballTrail.current.shift()
                    }

                    // Fade trail points
                    ballTrail.current.forEach((point, index) => {
                      point.alpha = (index + 1) / ballTrail.current.length
                    })

                    ctx.save()
                    ctx.translate(position.x, position.y)

                    // Enhanced ball with 3D-like appearance
                    const ballHue = (i * 45 + Date.now() * 0.1) % 360

                    // Outer glow with bloom effect
                    ctx.shadowColor = 'hsla(' + ballHue + ', 100%, 70%, 0.8)'
                    ctx.shadowBlur = 20
                    ctx.fillStyle = 'hsla(' + ballHue + ', 80%, 70%, 0.4)'
                    ctx.beginPath()
                    ctx.arc(0, 0, PLINKO_RAIUS * 2.2, 0, Math.PI * 2)
                    ctx.fill()

                    // Main ball body with spherical gradient
                    ctx.shadowBlur = 0
                    const ballGradient = ctx.createRadialGradient(
                      -PLINKO_RAIUS/3, -PLINKO_RAIUS/3, 0,
                      0, 0, PLINKO_RAIUS
                    )
                    ballGradient.addColorStop(0, 'hsla(' + ballHue + ', 90%, 95%, 1)')
                    ballGradient.addColorStop(0.6, 'hsla(' + ballHue + ', 85%, 80%, 1)')
                    ballGradient.addColorStop(1, 'hsla(' + ballHue + ', 80%, 60%, 1)')
                    ctx.fillStyle = ballGradient
                    ctx.beginPath()
                    ctx.arc(0, 0, PLINKO_RAIUS, 0, Math.PI * 2)
                    ctx.fill()

                    // Highlight for 3D effect
                    ctx.fillStyle = 'hsla(' + ballHue + ', 100%, 98%, 0.9)'
                    ctx.beginPath()
                    ctx.arc(-PLINKO_RAIUS/4, -PLINKO_RAIUS/4, PLINKO_RAIUS/3, 0, Math.PI * 2)
                    ctx.fill()

                    // Inner shadow for depth
                    ctx.fillStyle = 'hsla(' + ballHue + ', 70%, 40%, 0.3)'
                    ctx.beginPath()
                    ctx.arc(PLINKO_RAIUS/3, PLINKO_RAIUS/3, PLINKO_RAIUS/4, 0, Math.PI * 2)
                    ctx.fill()

                    ctx.restore()
                  }
                  if (label === 'Bucket') {
                    const animation = bucketAnimations.current[body.plugin.bucketIndex] ?? 0

                    if (bucketAnimations.current[body.plugin.bucketIndex]) {
                      bucketAnimations.current[body.plugin.bucketIndex] *= .9
                    }

                    ctx.save()
                    ctx.translate(position.x, position.y)

                    // Enhanced bucket design based on multiplier value
                    const multiplier = body.plugin.bucketMultiplier
                    let bucketHue, bucketSaturation, bucketLightness

                    if (multiplier >= 6) {
                      // High multipliers - gold/yellow
                      bucketHue = 45
                      bucketSaturation = 85
                      bucketLightness = 65
                    } else if (multiplier >= 3) {
                      // Medium multipliers - orange/red
                      bucketHue = 25
                      bucketSaturation = 90
                      bucketLightness = 60
                    } else if (multiplier >= 1) {
                      // Low multipliers - blue/purple
                      bucketHue = 240
                      bucketSaturation = 70
                      bucketLightness = 55
                    } else {
                      // Loss buckets - gray
                      bucketHue = 0
                      bucketSaturation = 0
                      bucketLightness = 40
                    }

                    const bucketAlpha = 0.1 + animation * 0.3

                    // Bucket background with glow effect
                    ctx.save()
                    ctx.translate(0, bucketHeight / 2)
                    ctx.scale(1, 1 + animation * 2)

                    // Outer glow
                    ctx.shadowColor = 'hsla(' + bucketHue + ', ' + bucketSaturation + '%, ' + bucketLightness + '%, 0.8)'
                    ctx.shadowBlur = 15 + animation * 10
                    ctx.fillStyle = 'hsla(' + bucketHue + ', ' + bucketSaturation + '%, ' + bucketLightness + '%, ' + bucketAlpha + ')'
                    ctx.fillRect(-30, -bucketHeight, 60, bucketHeight)

                    // Main bucket body
                    ctx.shadowBlur = 0
                    const bucketGradient = ctx.createLinearGradient(-25, -bucketHeight, 25, 0)
                    bucketGradient.addColorStop(0, 'hsla(' + bucketHue + ', ' + bucketSaturation + '%, ' + (bucketLightness + 20) + '%, 0.9)')
                    bucketGradient.addColorStop(1, 'hsla(' + bucketHue + ', ' + bucketSaturation + '%, ' + (bucketLightness - 10) + '%, 0.9)')
                    ctx.fillStyle = bucketGradient
                    ctx.fillRect(-25, -bucketHeight, 50, bucketHeight)

                    ctx.restore()

                    // Enhanced text rendering
                    ctx.font = 'bold 18px Arial'
                    ctx.textAlign = 'center'

                    // Text shadow/outline
                    ctx.lineWidth = 4
                    ctx.lineJoin = 'round'
                    ctx.strokeStyle = 'hsla(' + bucketHue + ', ' + bucketSaturation + '%, 20%, 1)'
                    ctx.strokeText('x' + multiplier, 0, 0)

                    // Main text
                    const textBrightness = multiplier >= 1 ? 95 : 80
                    ctx.fillStyle = 'hsla(' + bucketHue + ', ' + bucketSaturation + '%, ' + textBrightness + '%, 1)'
                    ctx.fillText('x' + multiplier, 0, 0)

                    ctx.restore()
                  }
                  if (label === 'Barrier') {
                    ctx.save()
                    ctx.translate(position.x, position.y)

                    // Enhanced barrier with subtle glow and texture
                    ctx.shadowColor = '#ffffff40'
                    ctx.shadowBlur = 3
                    ctx.fillStyle = '#ffffff15'
                    ctx.fillRect(-barrierWidth / 2, -barrierHeight / 2, barrierWidth, barrierHeight)

                    // Add subtle border
                    ctx.shadowBlur = 0
                    ctx.strokeStyle = '#ffffff30'
                    ctx.lineWidth = 1
                    ctx.strokeRect(-barrierWidth / 2, -barrierHeight / 2, barrierWidth, barrierHeight)

                    ctx.restore()
                  }
                },
              )
            }

            // Render ball trail
            if (ballTrail.current.length > 1) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
              ctx.lineWidth = 2
              ctx.lineCap = 'round'
              ctx.lineJoin = 'round'
              ctx.beginPath()

              ballTrail.current.forEach((point, index) => {
                const alpha = point.alpha * 0.5
                if (index === 0) {
                  ctx.moveTo(point.x, point.y)
                } else {
                  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
                  ctx.lineTo(point.x, point.y)
                }
              })
              ctx.stroke()
            }

            // Render particles
            particles.current.forEach(particle => {
              ctx.save()
              ctx.globalAlpha = particle.life
              ctx.fillStyle = particle.color

              if (particle.type === 'spark') {
                // Spark particles with glow
                ctx.shadowColor = particle.color
                ctx.shadowBlur = particle.size * 2
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fill()
              } else if (particle.type === 'dust') {
                // Dust particles - subtle
                ctx.shadowBlur = 0
                ctx.globalAlpha = particle.life * 0.3
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fill()
              }

              ctx.restore()
            })

            ctx.restore()
          }}
        />
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <span>🎯</span>
          <span>Mode:</span>
          <GambaUi.Switch
            disabled={gamba.isPlaying}
            checked={degen}
            onChange={setDegen}
          />
          <span style={{ color: degen ? '#ff6b6b' : '#4ecdc4', fontWeight: 'bold' }}>
            {degen ? 'DEGEN' : 'CLASSIC'}
          </span>
        </div>

        {window.location.origin.includes('localhost') && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fff',
              fontSize: '12px'
            }}>
              <span>🔧</span>
              <span>Debug:</span>
              <GambaUi.Switch checked={debug} onChange={setDebug} />
            </div>
            <GambaUi.Button
              onClick={() => plinko.single()}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Test
            </GambaUi.Button>
            <GambaUi.Button
              onClick={() => plinko.runAll()}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Simulate
            </GambaUi.Button>
          </div>
        )}

        <GambaUi.PlayButton onClick={() => play()}>
          Drop Ball
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  )
}
