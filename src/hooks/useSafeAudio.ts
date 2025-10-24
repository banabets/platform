import { useCallback, useEffect, useRef, useState } from 'react'

// Hook para manejar audio de forma segura con Chrome
export const useSafeAudio = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const userInteractedRef = useRef(false)

  // Función para inicializar audio después de interacción del usuario
  const enableAudio = useCallback(async () => {
    if (isAudioEnabled) return

    try {
      // Crear AudioContext después de la interacción del usuario
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

      // En algunos navegadores, el AudioContext se crea en estado 'suspended'
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      setAudioContext(ctx)
      setIsAudioEnabled(true)
      userInteractedRef.current = true

      console.log('🎵 Audio enabled successfully')
    } catch (error) {
      console.error('Failed to enable audio:', error)
    }
  }, [isAudioEnabled])

  // Función para reproducir audio de forma segura
  const playAudio = useCallback(async (audioBuffer: AudioBuffer) => {
    if (!isAudioEnabled || !audioContext) {
      // Si el audio no está habilitado, intentar habilitarlo
      await enableAudio()
      // Si aún no está habilitado después del intento, salir
      if (!isAudioEnabled || !audioContext) return
    }

    try {
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.start()
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }, [isAudioEnabled, audioContext, enableAudio])

  // Efecto para detectar la primera interacción del usuario
  useEffect(() => {
    if (userInteractedRef.current) return

    const handleUserInteraction = () => {
      if (!userInteractedRef.current) {
        enableAudio()
      }
    }

    // Escuchar varios eventos de interacción
    const events = ['click', 'touchstart', 'keydown', 'scroll']
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [enableAudio])

  return {
    isAudioEnabled,
    enableAudio,
    playAudio,
    audioContext
  }
}
