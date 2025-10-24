import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'
import React, { Suspense } from 'react'
import { Route, Routes, useLocation, Link } from 'react-router-dom'
import { Modal } from './components/Modal'
import { TOS_HTML } from './constants'
import { useToast } from './hooks/useToast'
import { useUserStore } from './hooks/useUserStore'
import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import RecentPlays from './sections/RecentPlays/RecentPlays'
import Toasts from './sections/Toasts'
import { MainWrapper, TosInner, TosWrapper } from './styles'
import TrollBox from './components/TrollBox'
import LeaderboardsModal from './components/LeaderboardsModal'
import Sidebar, { TopHeader } from './components/Sidebar'
// import { InstallPrompt } from './components/InstallPrompt'
import { AnimatedBackground } from './components/AnimatedBackground'

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function ErrorHandler() {
  const walletModal = useWalletModal()
  const toast = useToast()
  const [error, setError] = React.useState<Error>()

  useTransactionError((error) => {
    if (error.message === 'NOT_CONNECTED') {
      walletModal.setVisible(true)
      return
    }
    toast({ title: '❌ Transaction error', description: error.error?.errorMessage ?? error.message })
  })

  return (
    <>
      {error && (
        <Modal onClose={() => setError(undefined)}>
          <h1>Error occurred</h1>
          <p>{error.message}</p>
        </Modal>
      )}
    </>
  )
}

// Hook para detectar si es escritorio
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth > 768)

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isDesktop
}


export default function App() {
  const newcomer = useUserStore((state) => state.newcomer)
  const set = useUserStore((state) => state.set)
  const isDesktop = useIsDesktop()
  const [showLeaderboard, setShowLeaderboard] = React.useState(false)
  const user = useUserStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AnimatedBackground />

      {/* Leaderboards Modal */}
      {showLeaderboard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200 }}>
          <LeaderboardsModal
            creator={'Etnd3K8ZkMoUivezmxxaRkZBvVFTAvuQftpfvLyjhjBp'}
            onClose={() => setShowLeaderboard(false)}
          />
        </div>
      )}

      <TopHeader />
      {isDesktop && <Sidebar onShowLeaderboard={() => setShowLeaderboard(true)} />}
      <div
        style={{
          flex: 1,
          marginLeft: isDesktop ? 120 : 0,
          marginTop: isDesktop ? 85 : 60,
          marginRight: isDesktop ? 80 : 0,
          overflowX: 'hidden',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        {newcomer && (
          <Modal>
            <h1>Welcome</h1>
            <TosWrapper>
              <TosInner dangerouslySetInnerHTML={{ __html: TOS_HTML }} />
            </TosWrapper>
            <p>By playing on our platform, you confirm your compliance.</p>
            <GambaUi.Button main onClick={() => set({ newcomer: false })}>
              Acknowledge
            </GambaUi.Button>
          </Modal>
        )}

            <ScrollToTop />
            <ErrorHandler />
            <Toasts />
            {/* <InstallPrompt /> */}
        <MainWrapper>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/:gameId" element={<Game />} />
          </Routes>
          <h2 style={{ textAlign: 'center' }}>Recent Plays</h2>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <RecentPlays />
          </div>
        </MainWrapper>
      </div>
      <TrollBox />
    </div>
  )
}
