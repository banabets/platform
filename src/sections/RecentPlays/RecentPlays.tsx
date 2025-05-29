import { BPS_PER_WHOLE, GambaTransaction } from 'gamba-core-v2'
import { GambaUi, TokenValue, useTokenMeta } from 'gamba-react-ui-v2'
import React, { useEffect, useState, useRef } from 'react'
import { EXPLORER_URL, PLATFORM_CREATOR_ADDRESS } from '../../constants'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { extractMetadata } from '../../utils'
import { Container, Jackpot, Profit, Recent, Skeleton } from './RecentPlays.styles'
import { ShareModal } from './ShareModal'
import { useRecentPlays } from './useRecentPlays'
import styled from 'styled-components'

function TimeDiff({ time, suffix = 'ago' }: { time: number, suffix?: string }) {
  const diff = (Date.now() - time)
  return React.useMemo(() => {
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours >= 1) return hours + 'h ' + suffix
    if (minutes >= 1) return minutes + 'm ' + suffix
    return 'Just now'
  }, [diff])
}

function RecentPlay({ event }: { event: GambaTransaction<'GameSettled'> }) {
  const data = event.data
  const token = useTokenMeta(data.tokenMint)
  const md = useMediaQuery('md')

  const multiplier = data.bet[data.resultIndex.toNumber()] / BPS_PER_WHOLE
  const wager = data.wager.toNumber()
  const payout = multiplier * wager
  const profit = payout - wager
  const { game } = extractMetadata(event)

  return (
    <>
      <img
        src={game?.meta.image}
        style={{ height: '2.5em', width: '2.5em', objectFit: 'cover', borderRadius: '6px', border: '2px solid gold', boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)' }}
      />
      <div style={{ color: 'var(--gamba-ui-primary-color)' }}>{data.user.toBase58().substring(0, 4)}...</div>
      {md && (profit >= 0 ? ' won ' : ' lost ')}
      <Profit $win={profit > 0}>
        <img src={token.image} height="20px" style={{ borderRadius: '50%' }} />
        <TokenValue amount={Math.abs(profit)} mint={data.tokenMint} />
      </Profit>
      {md && (
        <>
          {profit > 0 && <div>({multiplier.toFixed(2)}x)</div>}
          {data.jackpotPayoutToUser.toNumber() > 0 && (
            <Jackpot>
              +<TokenValue mint={data.tokenMint} amount={data.jackpotPayoutToUser.toNumber()} />
            </Jackpot>
          )}
        </>
      )}
    </>
  )
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  padding: 16px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: flex-start;
  margin-top: 9px;
`

const SolPriceBox = styled.div`
  background: none;
  border: 2px solid rgba(0, 255, 0, 0.4); /* verde */
  border-radius: 12px;
  padding: 12px 16px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5), 0 0 5px rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
`


const AltcoinList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  background: none;
  border: 2px solid rgba(0, 255, 0, 0.4); /* borde verde */
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5), 0 0 5px rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  transition: transform 0.2s;
`

const CoinRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 6px rgba(255, 215, 0, 0.2), 0 0 4px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
  }
`
const CoinName = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
`

const CoinStats = styled.div`
  font-size: 12px;
  color: #ccc;
  display: grid;
  text-align: right;
  grid-template-rows: repeat(3, auto);
`

const CoinLogo = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
`

export default function RecentPlays() {
  const events = useRecentPlays({ showAllPlatforms: false })
  const [selectedGame, setSelectedGame] = useState<GambaTransaction<'GameSettled'>>()
  const md = useMediaQuery('md')
  const [solPrice, setSolPrice] = useState<string | null>(() => {
  return localStorage.getItem('solPrice')
})
  const [solChange, setSolChange] = useState<number | null>(() => {
  const stored = localStorage.getItem('solChange')
  return stored ? parseFloat(stored) : null
})
  const [solHistory, setSolHistory] = useState<number[]>([])
  const [memecoins, setMemecoins] = useState<any[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fetchSol = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/solana')
        const json = await res.json()
        const currentPrice = parseFloat(json.market_data.current_price.usd)
        setSolPrice(currentPrice.toFixed(2))
        localStorage.setItem('solPrice', currentPrice.toFixed(2))
        const priceChange = parseFloat(json.market_data.price_change_percentage_24h)
        setSolChange(priceChange)
        localStorage.setItem('solChange', priceChange.toString())
        const prices = json.market_data.sparkline_7d.price.slice(-30)
        setSolHistory(prices)
      } catch (e) {
        console.error('SOL price error', e)
      }
    }

    const fetchMemecoins = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=solana-ecosystem&order=volume_desc&per_page=50&page=1')
        const json = await res.json()
        const excludeList = ['solana', 'usd-coin', 'tether', 'wrapped-solana']
        const filtered = json
          .filter((coin: any) => !excludeList.includes(coin.id.toLowerCase()))
          .slice(0, 6)
        setMemecoins(filtered)
        localStorage.setItem('memecoins', JSON.stringify(filtered))
      } catch (e) {
        console.error('Memecoins fetch error', e)
      }
    }


    fetchSol()
    fetchMemecoins()
    const interval = setInterval(() => {
      fetchSol()
      fetchMemecoins()
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || solHistory.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const width = canvas.width
    const height = canvas.height
    const max = Math.max(...solHistory)
    const min = Math.min(...solHistory)

    ctx.beginPath()
    ctx.moveTo(0, height - ((solHistory[0] - min) / (max - min)) * height)
    solHistory.forEach((val, i) => {
      const x = (i / (solHistory.length - 1)) * width
      const y = height - ((val - min) / (max - min)) * height
      ctx.lineTo(x, y)
    })
    ctx.strokeStyle = 'gold'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [solHistory])

  return (
    <Layout>
      <Container>
        {selectedGame && <ShareModal event={selectedGame} onClose={() => setSelectedGame(undefined)} />}
        {!events.length && Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)}
        {events.map((tx) => (
          <Recent key={tx.signature} onClick={() => setSelectedGame(tx)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5em' }}>
              <RecentPlay event={tx} />
            </div>
            <TimeDiff time={tx.time} suffix={md ? 'ago' : ''} />
          </Recent>
        ))}
      </Container>

      <RightPanel>
    <SolPriceBox title="Solana price updated every 20 seconds via CoinGecko API">
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
    <span>SOL – ${solPrice ?? '...'}</span>
    {solChange !== null && (
      <span style={{ 
        color: solChange >= 0 ? 'limegreen' : 'tomato', 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {solChange >= 0 ? '▲' : '▼'} {Math.abs(solChange).toFixed(2)}%
      </span>
    )}
  </div>
</SolPriceBox>

        <AltcoinList>
         <div style={{ fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>
  Top Solana Coins
</div>
          {Array.isArray(memecoins) && memecoins.length > 0 ? (
            memecoins.map((coin, idx) => (
              <CoinRow key={coin.id}>
                <CoinName><CoinLogo src={coin.image} alt={coin.name} />{coin.name}</CoinName>
                <CoinStats>
                  <div>${coin.current_price.toFixed(4)}</div>
                  <div>{coin.current_price.toFixed(2)}%</div>
                  <div>Vol: ${coin.total_volume.toLocaleString()}</div>
                </CoinStats>
              </CoinRow>
            ))
          ) : (
            <div>Loading...</div>
          )}
        </AltcoinList>
      </RightPanel>
    </Layout>
  )
}
