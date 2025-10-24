import { useCallback, useEffect, useRef } from 'react'
import { useAudioContext } from '../contexts/AudioContext'

// Hook que reemplaza useSound pero con manejo seguro de audio
export const useAudio = (soundMap: Record<string, string>) => {
  const { isAudioEnabled, enableAudio } = useAudioContext()
  const audioBuffersRef = useRef<Record<string, AudioBuffer | null>>({})
  const audioContextRef = useRef<AudioContext | null>(null)
  const loadingRef = useRef(false)

  // Crear AudioContext cuando esté disponible
  useEffect(() => {
    if (isAudioEnabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.error('Failed to create AudioContext:', error)
      }
    }
  }, [isAudioEnabled])

  // Cargar sonidos cuando el audio esté disponible
  const loadSounds = useCallback(async () => {
    if (!audioContextRef.current || loadingRef.current) return

    loadingRef.current = true
    const buffers: Record<string, AudioBuffer | null> = {}

    for (const [key, url] of Object.entries(soundMap)) {
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
        buffers[key] = audioBuffer
      } catch (error) {
        console.error(`Failed to load sound ${key}:`, error)
        buffers[key] = null
      }
    }

    audioBuffersRef.current = buffers
    loadingRef.current = false
  }, [])

  useEffect(() => {
    if (isAudioEnabled) {
      loadSounds()
    }
  }, [isAudioEnabled, loadSounds])

  // Función para reproducir sonidos
  const play = useCallback((soundKey: string) => {
    const buffer = audioBuffersRef.current[soundKey]
    const ctx = audioContextRef.current

    if (buffer && ctx && isAudioEnabled) {
      try {
        // Reanudar contexto si está suspendido
        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start()
      } catch (error) {
        console.error(`Failed to play sound ${soundKey}:`, error)
      }
    }
  }, [isAudioEnabled])

  // Función para reproducir sonidos con fallback a enableAudio
  const playSafe = useCallback(async (soundKey: string) => {
    if (!isAudioEnabled) {
      await enableAudio()
    }
    play(soundKey)
  }, [isAudioEnabled, enableAudio, play])

  return {
    play,
    playSafe,
    sounds: audioBuffersRef.current,
    isAudioEnabled,
    loading: loadingRef.current
  }
}
