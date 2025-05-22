
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
  gap: 4px;
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
  margin-left: 2px;
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
