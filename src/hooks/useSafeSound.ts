import { useCallback, useEffect, useRef } from 'react'
import { useSafeAudio } from './useSafeAudio'

// Hook personalizado para sonidos que respeta las políticas de Chrome
export const useSafeSound = (soundMap: Record<string, string>) => {
  const { isAudioEnabled, playAudio, audioContext } = useSafeAudio()
  const audioBuffersRef = useRef<Record<string, AudioBuffer | null>>({})
  const [loading, setLoading] = useRef(false)

  // Cargar sonidos
  const loadSounds = useCallback(async () => {
    if (!audioContext || loading.current) return

    loading.current = true
    const buffers: Record<string, AudioBuffer | null> = {}

    for (const [key, url] of Object.entries(soundMap)) {
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        buffers[key] = audioBuffer
      } catch (error) {
        console.error(`Failed to load sound ${key}:`, error)
        buffers[key] = null
      }
    }

    audioBuffersRef.current = buffers
    loading.current = false
  }, [audioContext])

  // Cargar sonidos cuando el audio esté disponible
  useEffect(() => {
    if (isAudioEnabled) {
      loadSounds()
    }
  }, [isAudioEnabled, loadSounds])

  // Función para reproducir sonidos
  const play = useCallback((soundKey: string) => {
    const buffer = audioBuffersRef.current[soundKey]
    if (buffer && isAudioEnabled) {
      playAudio(buffer)
    }
  }, [isAudioEnabled, playAudio])

  // Función para reproducir sonidos con manejo de errores
  const playSafe = useCallback(async (soundKey: string) => {
    try {
      play(soundKey)
    } catch (error) {
      console.warn(`Failed to play sound ${soundKey}:`, error)
    }
  }, [play])

  return {
    play,
    playSafe,
    sounds: audioBuffersRef.current,
    isAudioEnabled,
    loading: loading.current
  }
}
