import { useCallback, useEffect } from 'react'
import { GAMES } from '../games'

// Juegos más populares (basado en lógica de negocio)
const POPULAR_GAMES = ['jackpot', 'slots', 'dice', 'flip', 'crash']

export const useGamePreloader = () => {
  const preloadGame = useCallback((gameId: string) => {
    const game = GAMES.find(g => g.id === gameId)
    if (game && game.app) {
      // Preload del componente
      game.app._payload?._result?.then?.()
      // Preload de assets críticos
      if (game.meta.image) {
        const img = new Image()
        img.src = game.meta.image
      }
    }
  }, [])

  const preloadPopularGames = useCallback(() => {
    // Preload juegos populares después de que la página cargue
    const timer = setTimeout(() => {
      POPULAR_GAMES.forEach(gameId => {
        preloadGame(gameId)
      })
    }, 2000) // Después de 2 segundos para no interferir con la carga inicial

    return () => clearTimeout(timer)
  }, [preloadGame])

  const preloadOnHover = useCallback((gameId: string) => {
    // Preload cuando el usuario hace hover sobre un juego
    const timer = setTimeout(() => {
      preloadGame(gameId)
    }, 100) // Pequeño delay para evitar preload innecesario

    return () => clearTimeout(timer)
  }, [preloadGame])

  useEffect(() => {
    return preloadPopularGames()
  }, [preloadPopularGames])

  return {
    preloadGame,
    preloadOnHover,
    popularGames: POPULAR_GAMES
  }
}
