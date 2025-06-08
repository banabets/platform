import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'
import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Modal } from './components/Modal'
import { TOS_HTML } from './constants'
import { useToast } from './hooks/useToast'
import { useUserStore } from './hooks/useUserStore'
import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import RecentPlays from './sections/RecentPlays/RecentPlays'
import Toasts from './sections/Toasts'
import { MainWrapper, TosInner, TosWrapper } from './styles'
import TrollBox from './components/TrollBox'
import LeaderboardsModal from './components/LeaderboardsModal'
import Sidebar from './components/Sidebar'

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

  const shouldShowSidebar = isDesktop // ✅ Usamos esta variable para controlar sidebar y margen

  return (
    <div style={{ display: 'flex' }}>
      {shouldShowSidebar && <Sidebar />}
      <div style={{ flex: 1, marginLeft: shouldShowSidebar ? 260 : 0 }}>
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
        <Header />
        <div style={{ height: '50px', visibility: 'hidden', pointerEvents: 'none' }} />
        <Toasts />
        <MainWrapper>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/:gameId" element={<Game />} />
          </Routes>
          <h2 style={{ textAlign: 'center' }}>Recent Plays</h2>
          <RecentPlays />
        </MainWrapper>
        <TrollBox />
      </div>
    </div>
  )
}
