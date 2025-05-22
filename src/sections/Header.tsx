import {
  GambaUi,
  TokenValue,
  useCurrentPool,
  useGambaPlatformContext,
  useUserBalance,
} from 'gamba-react-ui-v2'
import React, { useState, useEffect } from 'react'
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

/* ─────── Hook local para precio de Solana ─────── */
function useSolPriceInline() {
  const [price, setPrice] = useState<number | null>(null)
  const [previousPrice, setPreviousPrice] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        const data = await res.json()
        const newPrice = data.solana.usd
        setPreviousPrice(price)
        setPrice(newPrice)
        setLastUpdated(new Date())
      } catch (err) {
        console.error('Failed to fetch SOL price', err)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 10000)
    return () => clearInterval(interval)
  }, [price])

  return { price, previousPrice, lastUpdated }
}

/* ─────── estilos ─────────────────────────────── */

const StyledHeader = styled.div`
  position: fixed;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  width: 90%;
  max-width: 1400px;
  height: 100px;
  padding: 0 32px;

  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(18px);
  border-radius: 16px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);

  @media (max-width: 600px) {
    width: 95%;
    flex-direction: column;
    height: auto;
    padding: 8px 16px 4px 16px;
    margin-bottom: -20px;
    top: 12px;
  }
`

const Logo = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  text-decoration: none;
  margin-top: 6px;

  img {
    height: 45px;
    transition: height 0.3s ease;
  }

  @media (max-width: 600px) {
    justify-content: center;
    width: 100%;
    margin: 0 auto 8px auto;

    img {
      height: 50px;
      display: block;
      margin: 0 auto;
    }
  }
`

const SolPrice = styled.span<{ color: 'green' | 'red' | 'gray' }>`
  font-size: 14px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 8px;
  margin-left: 8px;
  white-space: nowrap;
  background: #111;

  color: ${({ color }) =>
    color === 'green' ? '#00ff7f' : color === 'red' ? '#ff6b6b' : '#aaa'};

  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 600px) {
    font-size: 12px;
    padding: 2px 6px;
  }
`

const Tooltip = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #999;
  white-space: nowrap;

  @media (max-width: 600px) {
    display: none;
  }
`

const PriceWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Bonus = styled.button<{ noBackground?: boolean }>`
  background-color: ${({ noBackground }) => (noBackground ? 'transparent' : '#1f1f1f')};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: ${({ noBackground }) => (noBackground ? 'transparent' : '#333')};
  }

  @media (max-width: 600px) {
    padding: 4px 8px;
    font-size: 12px;
  }
`

const JackpotBonus = styled(Bonus)`
  font-size: 18px;
  font-weight: 700;
  padding: 8px 16px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  color: #000;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.8);
  border-radius: 12px;

  &:hover {
    background: linear-gradient(90deg, #f59e0b, #d97706);
    box-shadow: 0 0 12px rgba(217, 119, 6, 1);
  }

  @media (max-width: 1024px) {
    font-size: 14px;
    padding: 6px 12px;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    color: #000;
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.8);
  }
`

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: nowrap;
  overflow-x: visible;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
    margin-top: -5px;
    overflow-x: visible;
    flex-wrap: nowrap;
  }
`

const PopupContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 512px;
  height: 512px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  z-index: 2000;
`

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: #ccc;
  }
`

const ClaimButton = styled.button`
  background-color: #333;
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 20px;

  &:hover {
    background-color: #555;
  }
`

/* ─────── componente principal ───────────────────────────────── */

export default function Header() {
  const pool = useCurrentPool()
  const context = useGambaPlatformContext()
  const balance = useUserBalance()
  const isDesktop = useMediaQuery('lg')

  const [bonusHelp, setBonusHelp] = useState(false)
  const [jackpotHelp, setJackpotHelp] = useState(false)
  const [showDailyChest, setShowDailyChest] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const { price, previousPrice, lastUpdated } = useSolPriceInline()

  const priceColor =
    previousPrice === null || price === null
      ? 'gray'
      : price > previousPrice
      ? 'green'
      : price < previousPrice
      ? 'red'
      : 'gray'

  const priceIcon =
    previousPrice === null || price === null
      ? ''
      : price > previousPrice
      ? '🔺'
      : price < previousPrice
      ? '🔻'
      : ''

  const secondsAgo = lastUpdated
    ? Math.round((Date.now() - lastUpdated.getTime()) / 1000)
    : null

  const tooltipText = secondsAgo !== null ? `Updated ${secondsAgo}s ago` : ''

  return (
    <>
      {bonusHelp && (
        <Modal onClose={() => setBonusHelp(false)}>
          <h1>Bonus ✨</h1>
          <p>
            You have <b><TokenValue amount={balance.bonusBalance} /></b> worth of free plays.
          </p>
          <p>A small fee is still needed from your wallet for each play.</p>
        </Modal>
      )}

      {jackpotHelp && (
        <Modal onClose={() => setJackpotHelp(false)}>
          <h1>Jackpot 💰</h1>
          <p><b><TokenValue amount={pool.jackpotBalance} /></b> currently in the Jackpot.</p>
          <p>It grows with every bet. Enable to have a chance to win it.</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{context.defaultJackpotFee === 0 ? 'DISABLED' : 'ENABLED'}</span>
            <GambaUi.Switch
              checked={context.defaultJackpotFee > 0}
              onChange={(checked) =>
                context.setDefaultJackpotFee(checked ? PLATFORM_JACKPOT_FEE : 0)
              }
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
          {price && (
            <PriceWrapper>
              <SolPrice color={priceColor}>
                {priceIcon} ${price.toFixed(2)}
              </SolPrice>
              {tooltipText && <Tooltip>{tooltipText}</Tooltip>}
            </PriceWrapper>
          )}
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
