// ...importaciones
import {
  GambaUi,
  TokenValue,
  useCurrentPool,
  useGambaPlatformContext,
  useUserBalance,
} from 'gamba-react-ui-v2'
import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import LeaderboardsModal from '../components/LeaderboardsModal'
import {
  PLATFORM_JACKPOT_FEE,
  PLATFORM_CREATOR_ADDRESS,
} from '../constants'
import TokenSelect from './TokenSelect'
import { UserButton } from './UserButton'
import { useMediaQuery } from '../hooks/useMediaQuery'

// ...estilos StyledHeader, Logo, Bonus, JackpotBonus, RightGroup, etc.

export default function Header() {
  const pool = useCurrentPool()
  const context = useGambaPlatformContext()
  const balance = useUserBalance()
  const isDesktop = useMediaQuery('lg')

  const [bonusHelp, setBonusHelp] = React.useState(false)
  const [jackpotHelp, setJackpotHelp] = React.useState(false)
  const [showDailyChest, setShowDailyChest] = React.useState(false)
  const [showLeaderboard, setShowLeaderboard] = React.useState(false)

  return (
    <>
      {bonusHelp && (
        <Modal onClose={() => setBonusHelp(false)}>
          <h1>Bonus ✨</h1>
          <p>
            You have <b><TokenValue amount={balance.bonusBalance} /></b> worth of free plays.
            This bonus will be applied automatically when you play.
          </p>
          <p>Note that a fee is still needed from your wallet for each play.</p>
        </Modal>
      )}

      {jackpotHelp && (
        <Modal onClose={() => setJackpotHelp(false)}>
          <h1>Jackpot 💰</h1>
          <p style={{ fontWeight: 'bold' }}>
            There&apos;s <TokenValue amount={pool.jackpotBalance} /> in the Jackpot.
          </p>
          <p>
            The Jackpot is a prize pool that grows with every bet made. As the Jackpot grows,
            so does your chance of winning. Once a winner is selected, the value of the Jackpot
            resets and grows from there until a new winner is selected.
          </p>
          <p>
            You will be paying a maximum of {(PLATFORM_JACKPOT_FEE * 100).toLocaleString(undefined, { maximumFractionDigits: 4 })}% for each wager for a chance to win.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{context.defaultJackpotFee === 0 ? 'DISABLED' : 'ENABLED'}</span>
            <GambaUi.Switch
              checked={context.defaultJackpotFee > 0}
              onChange={(checked) => context.setDefaultJackpotFee(checked ? PLATFORM_JACKPOT_FEE : 0)}
            />
          </label>
        </Modal>
      )}

      {showLeaderboard && (
        <LeaderboardsModal
          creator={PLATFORM_CREATOR_ADDRESS.toBase58()}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showDailyChest && (
        <PopupContainer>
          <CloseButton onClick={() => setShowDailyChest(false)}>×</CloseButton>
          <h2>Daily Chest</h2>
          <p>Claim your daily chest to get more chances to win!</p>
          <ClaimButton onClick={() => alert('Claimed Daily Chest!')}>Claim</ClaimButton>
        </PopupContainer>
      )}

      <StyledHeader>
        <Logo to="/">
          <img alt="Gamba logo" src="/logo.svg" />
        </Logo>

        <RightGroup>
          {pool.jackpotBalance > 0 && (
            <JackpotBonus onClick={() => setJackpotHelp(true)}>
              💰 <TokenValue amount={pool.jackpotBalance} />
            </JackpotBonus>
          )}

          {balance.bonusBalance > 0 && (
            <Bonus onClick={() => setBonusHelp(true)}>
              ✨ <TokenValue amount={balance.bonusBalance} />
            </Bonus>
          )}

          {/* ✅ Solo visible en desktop */}
          {isDesktop && (
            <GambaUi.Button onClick={() => setShowLeaderboard(true)}>
              🏆 Leaderboard
            </GambaUi.Button>
          )}

          <TokenSelect />
          <UserButton />
        </RightGroup>
      </StyledHeader>

      {!isDesktop && <div style={{ height: '20px' }} />}
    </>
  )
}
