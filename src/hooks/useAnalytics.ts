import { useCallback, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
  userId?: string
  sessionId: string
  userAgent: string
  url: string
}

// Generar ID de sesión único
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const useAnalytics = () => {
  const { publicKey } = useWallet()
  const userId = publicKey?.toBase58()
  const sessionId = generateSessionId()

  // Track evento
  const trackEvent = useCallback((
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number
  ) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      userId,
      sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // En desarrollo, loggear a consola
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', analyticsEvent)
    }

    // En producción, enviar a servicio de analytics
    // Por ahora, guardar en localStorage para análisis local
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
      events.push(analyticsEvent)

      // Mantener solo los últimos 1000 eventos
      if (events.length > 1000) {
        events.splice(0, events.length - 1000)
      }

      localStorage.setItem('analytics_events', JSON.stringify(events))
    } catch (error) {
      console.error('Error saving analytics event:', error)
    }

    // En producción, esto sería:
    // sendToAnalyticsService(analyticsEvent)
  }, [userId, sessionId])

  // Track navegación
  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', 'navigation', 'view', page)
  }, [trackEvent])

  // Track juegos
  const trackGameStart = useCallback((gameId: string) => {
    trackEvent('game_start', 'gaming', 'start', gameId)
  }, [trackEvent])

  const trackGameEnd = useCallback((gameId: string, result: 'win' | 'lose', amount?: number) => {
    trackEvent('game_end', 'gaming', 'end', `${gameId}_${result}`, amount)
  }, [trackEvent])

  // Track wallet
  const trackWalletConnect = useCallback((walletType: string) => {
    trackEvent('wallet_connect', 'wallet', 'connect', walletType)
  }, [trackEvent])

  const trackWalletDisconnect = useCallback(() => {
    trackEvent('wallet_disconnect', 'wallet', 'disconnect')
  }, [trackEvent])

  // Track transacciones
  const trackTransaction = useCallback((
    type: 'bet' | 'withdraw' | 'deposit',
    amount: number,
    token: string
  ) => {
    trackEvent('transaction', 'finance', type, token, amount)
  }, [trackEvent])

  // Track engagement
  const trackEngagement = useCallback((
    type: 'click' | 'hover' | 'scroll',
    element: string,
    details?: string
  ) => {
    trackEvent('engagement', 'interaction', type, `${element}${details ? `_${details}` : ''}`)
  }, [trackEvent])

  // Track errores
  const trackError = useCallback((
    error: string,
    context: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    trackEvent('error', 'system', severity, `${context}_${error}`)
  }, [trackEvent])

  // Auto-track page views
  useEffect(() => {
    trackPageView(window.location.pathname)

    const handleRouteChange = () => {
      trackPageView(window.location.pathname)
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [trackPageView])

  // Track tiempo en página
  useEffect(() => {
    const startTime = Date.now()

    const trackTimeSpent = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      trackEvent('time_spent', 'engagement', 'page_time', window.location.pathname, timeSpent)
    }

    const handleBeforeUnload = () => {
      trackTimeSpent()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackTimeSpent()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [trackEvent])

  return {
    trackEvent,
    trackPageView,
    trackGameStart,
    trackGameEnd,
    trackWalletConnect,
    trackWalletDisconnect,
    trackTransaction,
    trackEngagement,
    trackError
  }
}
