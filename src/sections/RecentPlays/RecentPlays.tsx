import { BPS_PER_WHOLE, GambaTransaction } from 'gamba-core-v2'
import { GambaUi, TokenValue, useTokenMeta } from 'gamba-react-ui-v2'
import React from 'react'
import { EXPLORER_URL, PLATFORM_CREATOR_ADDRESS } from '../../constants'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { extractMetadata } from '../../utils'
import { Container, Jackpot, Profit, Recent, Skeleton } from './RecentPlays.styles'
import { ShareModal } from './ShareModal'
import { useRecentPlays } from './useRecentPlays'

function TimeDiff({ time, suffix = 'ago' }: { time: number, suffix?: string }) {
  const diff = (Date.now() - time)
  return React.useMemo(() => {
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours >= 1) {
      return hours + 'h ' + suffix
    }
    if (minutes >= 1) {
      return minutes + 'm ' + suffix
    }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <div style={{ position: 'relative' }}>
          <img
            src={game?.meta.image}
            style={{
              height: '56px',
              width: '56px',
              objectFit: 'cover',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '22px',
            height: '22px',
            background: profit > 0 ? '#22c55e' : '#ef4444',
            borderRadius: '50%',
            border: '2px solid rgba(15, 18, 25, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
          }}>
            {profit > 0 ? '↑' : '↓'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          <div style={{
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '14px',
            letterSpacing: '0.025em',
          }}>
            {data.user.toBase58().substring(0, 8)}...
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            fontWeight: '500',
          }}>
            {game?.meta.name || 'Unknown Game'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {md && profit > 0 && (
          <div style={{
            color: 'rgba(34, 197, 94, 0.8)',
            fontSize: '12px',
            fontWeight: '600',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '6px',
            padding: '2px 8px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}>
            {multiplier.toFixed(2)}x
          </div>
        )}

        <Profit $win={profit > 0}>
          <img src={token.image} height="16px" style={{
            borderRadius: '50%',
          }} />
          <TokenValue amount={Math.abs(profit)} mint={data.tokenMint} />
        </Profit>

        {data.jackpotPayoutToUser.toNumber() > 0 && (
          <Jackpot>
            +<TokenValue mint={data.tokenMint} amount={data.jackpotPayoutToUser.toNumber()} />
          </Jackpot>
        )}
      </div>
    </>
  )
}

export default function RecentPlays() {
  const events = useRecentPlays({ showAllPlatforms: false })
  const [selectedGame, setSelectedGame] = React.useState<GambaTransaction<'GameSettled'>>()
  const md = useMediaQuery('md')

  return (
    <Container>
      {selectedGame && (
        <ShareModal event={selectedGame} onClose={() => setSelectedGame(undefined)} />
      )}

      <div style={{
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: '500',
          letterSpacing: '0.025em',
        }}>
          Latest gaming activity
        </p>
      </div>

      {!events.length && Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} />
      ))}

      {events.map(
        (tx, index) => (
          <Recent
            key={tx.signature}
            onClick={() => setSelectedGame(tx)}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <RecentPlay event={tx} />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '4px'
            }}>
              <TimeDiff time={tx.time} suffix={md ? 'ago' : ''} />
              {md && (
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500',
                }}>
                  Click to share
                </div>
              )}
            </div>
          </Recent>
        ),
      )}
    </Container>
  )
}
