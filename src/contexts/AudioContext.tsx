import React, { createContext, useContext, useEffect, useState } from 'react'

// Contexto para manejar audio globalmente
interface AudioContextType {
  isAudioEnabled: boolean
  enableAudio: () => Promise<void>
}

const AudioContext = createContext<AudioContextType>({
  isAudioEnabled: false,
  enableAudio: async () => {}
})

// Hook para usar el contexto de audio
export const useAudioContext = () => {
  return useContext(AudioContext)
}

// Provider del contexto de audio
export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  const enableAudio = async () => {
    if (isAudioEnabled) return

    try {
      // Crear AudioContext después de interacción del usuario
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

      // En algunos navegadores, el AudioContext se crea suspendido
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      setAudioContext(ctx)
      setIsAudioEnabled(true)

      console.log('🎵 Audio context enabled globally')
    } catch (error) {
      console.error('Failed to enable global audio context:', error)
    }
  }

  // Detectar primera interacción del usuario
  useEffect(() => {
    const handleUserInteraction = () => {
      enableAudio()
    }

    // Escuchar eventos de interacción
    const events = ['click', 'touchstart', 'keydown', 'scroll']
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [])

  return (
    <AudioContext.Provider value={{ isAudioEnabled, enableAudio }}>
      {children}
    </AudioContext.Provider>
  )
}
