import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { GambaUi, TokenValue, useCurrentPool, useGambaPlatformContext, useUserBalance } from 'gamba-react-ui-v2'
import { Modal } from './Modal'
import TokenSelect from '../sections/TokenSelect'
import { UserButton } from '../sections/UserButton'
import { PLATFORM_JACKPOT_FEE } from '../constants'

// Componente para el header superior
export const TopHeader = () => {
  const pool = useCurrentPool()
  const context = useGambaPlatformContext()
  const balance = useUserBalance()
  const [prices, setPrices] = useState({
    solana: { price: null, change: null },
    jupiter: { price: null, change: null },
    bonk: { price: null, change: null }
  })
  const [jackpotHelp, setJackpotHelp] = useState(false)
  const [bonusHelp, setBonusHelp] = useState(false)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,jupiter,bonk&vs_currencies=usd&include_24hr_change=true')
        const data = await res.json()

        setPrices({
          solana: {
            price: data.solana?.usd?.toFixed(2) || null,
            change: data.solana?.usd_24h_change?.toFixed(2) || null
          },
          jupiter: {
            price: data.jupiter?.usd?.toFixed(4) || null,
            change: data.jupiter?.usd_24h_change?.toFixed(2) || null
          },
          bonk: {
            price: data.bonk?.usd ? data.bonk.usd.toFixed(8) : null,
            change: data.bonk?.usd_24h_change?.toFixed(2) || null
          },
        })
      } catch (error) {
        console.error("Error fetching prices:", error)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Bonus info */}
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

      {/* Jackpot info */}
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


      <HeaderContainer>
        <LeftGroup>
          {/* Solana Price */}
          <TokenPrice>
            <TokenIcon src="https://images.seeklogo.com/logo-png/42/2/solana-sol-logo-png_seeklogo-423095.png" alt="SOL" />
            <PriceText>{prices.solana.price ? `$${prices.solana.price}` : '...'}</PriceText>
            {prices.solana.change && (
              <PriceChange change={parseFloat(prices.solana.change)}>
                {parseFloat(prices.solana.change) >= 0 ? '↗' : '↘'} {Math.abs(parseFloat(prices.solana.change)).toFixed(1)}%
              </PriceChange>
            )}
          </TokenPrice>

          {/* Jupiter Price */}
          <TokenPrice>
            <TokenIcon src="https://s2.coinmarketcap.com/static/img/coins/64x64/29210.png" alt="JUP" />
            <PriceText>{prices.jupiter.price ? `$${prices.jupiter.price}` : '...'}</PriceText>
            {prices.jupiter.change && (
              <PriceChange change={parseFloat(prices.jupiter.change)}>
                {parseFloat(prices.jupiter.change) >= 0 ? '↗' : '↘'} {Math.abs(parseFloat(prices.jupiter.change)).toFixed(1)}%
              </PriceChange>
            )}
          </TokenPrice>

          {/* Bonk Price */}
          <TokenPrice>
            <TokenIcon src="https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f617277656176652e6e65742f685169505a4f73525a584758424a645f3832506856646c4d5f68414373545f713677717766356353593749" alt="BONK" />
            <PriceText>{prices.bonk.price ? `$${prices.bonk.price}` : '...'}</PriceText>
            {prices.bonk.change && (
              <PriceChange change={parseFloat(prices.bonk.change)}>
                {parseFloat(prices.bonk.change) >= 0 ? '↗' : '↘'} {Math.abs(parseFloat(prices.bonk.change)).toFixed(1)}%
              </PriceChange>
            )}
          </TokenPrice>

          {balance.bonusBalance > 0 && (
            <BonusButton onClick={() => setBonusHelp(true)}>
              ✨ <TokenValue amount={balance.bonusBalance} />
            </BonusButton>
          )}
        </LeftGroup>

        {/* Jackpot in the center - more prominent */}
        <CenterGroup>
          {pool.jackpotBalance > 0 && (
            <FeaturedJackpotButton onClick={() => setJackpotHelp(true)}>
              <JackpotIcon>🏆</JackpotIcon>
              <JackpotText>
                <JackpotLabel>JACKPOT</JackpotLabel>
                <JackpotValue>
                  <TokenValue amount={pool.jackpotBalance} />
                </JackpotValue>
              </JackpotText>
            </FeaturedJackpotButton>
          )}
        </CenterGroup>

            <RightGroup>
              <SocialIcons />
              <TokenSelect />
              <div style={{ zIndex: 10000, position: 'relative' }}>
                <UserButton />
              </div>
            </RightGroup>
      </HeaderContainer>
    </>
  )
}

const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 120px;
  right: 0;
  height: 85px;
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(15, 15, 20, 0.35) 50%, rgba(0, 0, 0, 0.4) 100%),
    linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%, rgba(167, 139, 250, 0.02) 100%);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 25px;
  z-index: 1000; /* Asegurar que esté encima del contenido */
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.2),
    0 1px 6px rgba(167, 139, 250, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  @media (max-width: 800px) {
  left: 0;
    height: 75px;
    padding: 0 15px;
  }
`

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    gap: 6px;
  }

  @media (max-width: 800px) {
    display: none;
  }
`

const CenterGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
`

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;

  @media (max-width: 800px) {
    gap: 8px;
  }
`

const FeaturedJackpotButton = styled.button`
  background:
    linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%),
    linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(255, 215, 0, 0.1) 100%),
    radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
  color: #000;
  border: 3px solid rgba(255, 215, 0, 0.9);
  border-radius: 12px;
  padding: 6px 20px;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow:
    0 0 15px rgba(251, 191, 36, 0.6),
    0 0 30px rgba(245, 158, 11, 0.3),
    0 0 45px rgba(217, 119, 6, 0.15),
    inset 0 1px 3px rgba(255, 255, 255, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 200px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-family: 'Russo One', sans-serif;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.7s ease;
  }


  &:hover {
    background:
      linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%),
      linear-gradient(45deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(255, 215, 0, 0.15) 100%),
      radial-gradient(circle at center, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
    transform: translateY(-4px) scale(1.03) rotate(-1deg);
    box-shadow:
      0 0 35px rgba(251, 191, 36, 1.2),
      0 0 70px rgba(245, 158, 11, 0.8),
      0 0 100px rgba(217, 119, 6, 0.5),
      0 8px 25px rgba(0, 0, 0, 0.4),
      inset 0 2px 6px rgba(255, 255, 255, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-2px) scale(0.97) rotate(0.5deg);
    transition: all 0.1s ease;
  }

  @keyframes jackpotPulse {
    0%, 100% {
      box-shadow:
        0 0 25px rgba(251, 191, 36, 0.9),
        0 0 50px rgba(245, 158, 11, 0.5),
        0 0 75px rgba(217, 119, 6, 0.3),
        inset 0 2px 6px rgba(255, 255, 255, 0.3);
    }
    50% {
      box-shadow:
        0 0 35px rgba(251, 191, 36, 1.2),
        0 0 70px rgba(245, 158, 11, 0.8),
        0 0 100px rgba(217, 119, 6, 0.5),
        inset 0 2px 6px rgba(255, 255, 255, 0.4);
    }
  }


  animation: jackpotPulse 2.5s ease-in-out infinite;

  @media (max-width: 1024px) {
    padding: 6px 18px;
    font-size: 14px;
    min-width: 180px;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 5px 16px;
    font-size: 12px;
    min-width: 160px;
    gap: 6px;
  }
`

const JackpotIcon = styled.div`
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
  animation: jackpotIconDance 3s ease-in-out infinite;
  position: relative;
  z-index: 4;

  &::before {
    content: '💰';
    position: absolute;
    top: -4px;
    left: -4px;
    font-size: 10px;
    animation: moneyFloat 2s ease-in-out infinite alternate;
    opacity: 0.7;
  }

  &::after {
    content: '⭐';
    position: absolute;
    top: -3px;
    right: -3px;
    font-size: 8px;
    animation: starTwinkle 1.5s ease-in-out infinite;
  }

  @keyframes jackpotIconDance {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.1) rotate(-5deg); }
    50% { transform: scale(1.2) rotate(5deg); }
    75% { transform: scale(1.1) rotate(-3deg); }
  }

  @keyframes moneyFloat {
    0% { transform: translateY(0) scale(0.8); opacity: 0.5; }
    100% { transform: translateY(-4px) scale(1); opacity: 0.8; }
  }

  @keyframes starTwinkle {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
  }

  @media (max-width: 768px) {
    font-size: 16px;

    &::before {
      font-size: 8px;
      top: -3px;
      left: -3px;
    }

    &::after {
      font-size: 6px;
      top: -2px;
      right: -2px;
    }
  }
`

const JackpotText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`

const JackpotLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.8);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 9px;
  }
`

const JackpotValue = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: #000;
  text-shadow:
    0 1px 2px rgba(255, 255, 255, 0.8),
    0 0 8px rgba(255, 215, 0, 0.5);

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`

const JackpotButton = styled.button`
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.8);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #f59e0b, #d97706);
    box-shadow: 0 0 12px rgba(217, 119, 6, 1);
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 6px 10px;
    font-size: 13px;
  }
`

const BonusButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
    color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 1024px) {
    padding: 4px 8px;
    font-size: 12px;
  }
`


const SolanaPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00ffa3;
  font-weight: 600;
  font-size: 1rem;
`

const TokenIcon = styled.img`
  width: 18px;
  height: 18px;
  filter: brightness(0.9);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px;
`

const TokenPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(5px);
  min-width: fit-content;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.18);
  }
`

const PriceText = styled.span`
  color: #ffffff;
  text-shadow: 0 0 4px rgba(0, 255, 163, 0.3);
  font-weight: 700;
`

const PriceChange = styled.span<{ change: number }>`
  font-size: 0.7rem;
  color: ${props => props.change >= 0 ? '#4ade80' : '#f87171'};
  font-weight: 600;
  text-shadow: 0 0 3px ${props => props.change >= 0 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'};
`


const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 120px;
  height: 100vh;
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(15, 15, 20, 0.25) 50%, rgba(0, 0, 0, 0.3) 100%),
    linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0%, transparent 50%, rgba(167, 139, 250, 0.015) 100%);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  z-index: 1000;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  align-items: center;
  box-shadow:
    0 0 20px rgba(0, 0, 0, 0.3),
    2px 0 10px rgba(167, 139, 250, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
`

const NavIcon = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 228, 45, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    color: #ffe42d;
    background:
      linear-gradient(135deg, rgba(255, 228, 45, 0.15) 0%, rgba(167, 139, 250, 0.1) 100%);
    transform: scale(1.08) translateY(-2px);
    box-shadow:
      0 8px 20px rgba(255, 228, 45, 0.25),
      0 4px 12px rgba(167, 139, 250, 0.15);
    backdrop-filter: blur(10px);

    &::before {
      left: 100%;
    }
  }

  &.active {
    color: #ffe42d;
    background:
      linear-gradient(135deg, rgba(255, 228, 45, 0.2) 0%, rgba(167, 139, 250, 0.15) 100%);
    box-shadow:
      0 6px 16px rgba(255, 228, 45, 0.3),
      0 4px 12px rgba(167, 139, 250, 0.2);
    backdrop-filter: blur(10px);
  }

  img {
    width: 32px;
    height: 32px;
    filter: brightness(0.9);
    transition: filter 0.3s ease;
    z-index: 1;
    position: relative;
  }

  &:hover img {
    filter: brightness(1.3);
  }
`


const Sidebar = ({ onShowLeaderboard }: { onShowLeaderboard?: () => void }) => {
  return (
    <>
      <TopHeader />
      <SidebarContainer>
      {/* Home */}
      <NavIcon to="/" title="Home">
        <img src="https://cdn-icons-png.flaticon.com/512/17604/17604657.png" alt="Home" />
      </NavIcon>

      {/* Games */}
      <NavIcon to="/dice" title="Dice">
        <img src="https://cdn-icons-png.flaticon.com/32/7469/7469372.png" alt="Dice" />
      </NavIcon>

      <NavIcon to="/blackjack" title="Blackjack">
        <img src="https://cdn-icons-png.flaticon.com/32/2316/2316698.png" alt="Blackjack" />
      </NavIcon>

      <NavIcon to="/slots" title="Slots">
        <img src="https://cdn-icons-png.flaticon.com/32/16037/16037628.png" alt="Slots" />
      </NavIcon>

      <NavIcon to="/flip" title="Coin Flip">
        <img src="https://cdn-icons-png.flaticon.com/512/8518/8518867.png" alt="Coin Flip" />
      </NavIcon>

      <NavIcon to="/hilo" title="Hi-Lo">
        <img src="https://cdn-icons-png.flaticon.com/32/11305/11305220.png" alt="Hi-Lo" />
      </NavIcon>

      <NavIcon to="/mines" title="Mines">
        <img src="https://cdn-icons-png.flaticon.com/32/17300/17300366.png" alt="Mines" />
      </NavIcon>

      <NavIcon to="/roulette" title="Roulette">
        <img src="https://cdn-icons-png.flaticon.com/32/16037/16037729.png" alt="Roulette" />
      </NavIcon>

      <NavIcon to="/plinko" title="Plinko">
        <img src="https://cdn-icons-png.flaticon.com/32/7037/7037815.png" alt="Plinko" />
      </NavIcon>

      <NavIcon to="/crash" title="Crash">
        <img src="https://cdn-icons-png.flaticon.com/32/7202/7202291.png" alt="Crash" />
      </NavIcon>

      <NavIcon to="/crypto-chart" title="Solana Chart">
        <img src="https://cdn-icons-png.flaticon.com/32/6329/6329225.png" alt="Solana Chart" />
      </NavIcon>

      {/* Leaderboard Button */}
      <LeaderboardSidebarButton onClick={onShowLeaderboard} title="🏆 GLOBAL LEADERBOARD 🏆">
        <LeaderboardGlow />
        <LeaderboardSidebarIcon>🏆</LeaderboardSidebarIcon>
        <LeaderboardSidebarText>
          <div style={{ fontSize: '9px', fontWeight: '900', color: '#ffd700', textShadow: '0 0 6px #ffd700' }}>
            LEADERBOARD
        </div>
        </LeaderboardSidebarText>
      </LeaderboardSidebarButton>
    </SidebarContainer>
    </>
  )
}

const LeaderboardSidebarButton = styled.button`
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  width: 100px;
  height: 60px;
  margin: 20px 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`

const LeaderboardGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(167, 139, 250, 0.05));
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;

  ${LeaderboardSidebarButton}:hover & {
    opacity: 1;
  }
`

const LeaderboardSidebarIcon = styled.div`
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  z-index: 2;
`

const LeaderboardSidebarText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  z-index: 2;
  text-align: center;
  line-height: 1;
`

// Componente de iconos sociales para el header
const SocialIcons = () => (
  <SocialIconsContainer>
    <SocialIcon href="https://x.com/banacasino" target="_blank" rel="noopener noreferrer" title="Twitter/X">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </SocialIcon>
    <SocialIcon href="https://discord.gg/banabets" target="_blank" rel="noopener noreferrer" title="Discord">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
      </svg>
    </SocialIcon>
    <SocialIcon href="https://banadegens.net" target="_blank" rel="noopener noreferrer" title="NFT's">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
    </SocialIcon>
  </SocialIconsContainer>
)

const SocialIconsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 8px;

  @media (max-width: 768px) {
    gap: 8px;
    margin-right: 6px;
  }
`

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`

export default Sidebar
