import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const AnalyticsContainer = styled.div`
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  font-size: 14px;
`

const AnalyticsTitle = styled.h3`
  margin: 0 0 16px 0;
  color: var(--text-color);
  font-size: 18px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`

const StatCard = styled.div`
  background: var(--background-secondary);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-color);
`

const StatTitle = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 8px;
`

const StatValue = styled.div`
  color: var(--text-color);
  font-size: 24px;
  font-weight: 600;
`

interface AnalyticsData {
  totalEvents: number
  gameClicks: Record<string, number>
  pageViews: Record<string, number>
  sessionDuration: number
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    // Solo mostrar en desarrollo
    if (!import.meta.env.DEV) return

    const loadAnalytics = () => {
      try {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')

        const gameClicks: Record<string, number> = {}
        const pageViews: Record<string, number> = {}
        let totalSessionTime = 0
        let sessionCount = 0

        events.forEach((event: any) => {
          if (event.category === 'interaction' && event.action === 'click' && event.label?.startsWith('game_card_')) {
            const gameId = event.label.replace('game_card_', '')
            gameClicks[gameId] = (gameClicks[gameId] || 0) + 1
          }

          if (event.event === 'page_view') {
            const page = event.label || event.url
            pageViews[page] = (pageViews[page] || 0) + 1
          }

          if (event.event === 'time_spent' && event.value) {
            totalSessionTime += event.value
            sessionCount++
          }
        })

        const avgSessionDuration = sessionCount > 0 ? totalSessionTime / sessionCount : 0

        setData({
          totalEvents: events.length,
          gameClicks,
          pageViews,
          sessionDuration: Math.round(avgSessionDuration)
        })
      } catch (error) {
        console.error('Error loading analytics:', error)
      }
    }

    loadAnalytics()
    // Recargar cada 30 segundos
    const interval = setInterval(loadAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  // Solo mostrar en desarrollo
  if (!import.meta.env.DEV || !data) return null

  const topGames = Object.entries(data.gameClicks)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const topPages = Object.entries(data.pageViews)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  return (
    <AnalyticsContainer>
      <AnalyticsTitle>📊 Analytics (Desarrollo)</AnalyticsTitle>
      <StatsGrid>
        <StatCard>
          <StatTitle>Total Eventos</StatTitle>
          <StatValue>{data.totalEvents}</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Tiempo Promedio Sesión</StatTitle>
          <StatValue>{data.sessionDuration}s</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Juegos Más Clickeados</StatTitle>
          <StatValue>
            {topGames.length > 0 ? (
              topGames.map(([game, clicks]) => (
                <div key={game} style={{ fontSize: '14px', marginBottom: '4px' }}>
                  {game}: {clicks}
                </div>
              ))
            ) : 'Ninguno'}
          </StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Páginas Más Vistas</StatTitle>
          <StatValue>
            {topPages.length > 0 ? (
              topPages.map(([page, views]) => (
                <div key={page} style={{ fontSize: '14px', marginBottom: '4px' }}>
                  {page}: {views}
                </div>
              ))
            ) : 'Ninguna'}
          </StatValue>
        </StatCard>
      </StatsGrid>
    </AnalyticsContainer>
  )
}
