import React, { Component, ReactNode } from 'react'
import { LoadingSkeleton } from './LoadingSkeleton'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  type?: 'game' | 'dashboard' | 'sidebar' | 'trollbox' | 'default'
}

interface State {
  hasError: boolean
  error?: Error
}

export class SuspenseBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SuspenseBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          color: '#ff6b6b'
        }}>
          <h3>⚠️ Algo salió mal</h3>
          <p>Estamos trabajando para solucionarlo. Intenta recargar la página.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#5865f2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Recargar página
          </button>
        </div>
      )
    }

    const { fallback, type = 'default' } = this.props

    if (fallback) {
      return <React.Suspense fallback={fallback}>{this.props.children}</React.Suspense>
    }

    let skeletonFallback: ReactNode

    switch (type) {
      case 'game':
        skeletonFallback = <LoadingSkeleton.GameGrid count={1} />
        break
      case 'dashboard':
        skeletonFallback = <LoadingSkeleton.GameGrid />
        break
      case 'sidebar':
        skeletonFallback = <LoadingSkeleton.Sidebar />
        break
      case 'trollbox':
        skeletonFallback = <LoadingSkeleton.TrollBox />
        break
      default:
        skeletonFallback = <LoadingSkeleton.Text width="100%" height="200px" />
    }

    return <React.Suspense fallback={skeletonFallback}>{this.props.children}</React.Suspense>
  }
}

// Componente de carga optimista para juegos populares
export const LazyGame = ({ game }: { game: any }) => (
  <SuspenseBoundary type="game">
    <React.Suspense fallback={<LoadingSkeleton.GameCard />}>
      <game.app />
    </React.Suspense>
  </SuspenseBoundary>
)
