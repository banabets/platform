import {
  GambaUi,
  useWagerInput,
  useCurrentToken,
  useCurrentPool,
  useTokenBalance,
} from 'gamba-react-ui-v2'
import React from 'react'

const pulseFadeStyle = `
  .pulse-fade { animation: pulseFade 1.6s infinite; }
  @keyframes pulseFade { 0% { opacity: .3 } 50% { opacity: 1 } 100% { opacity: .3 } }
`

import { Paytable } from './Paytable'
import { PokerCard } from './PokerCard'
import { JACKS_OR_BETTER_BET_ARRAY, HAND_BY_INDEX } from './betArray'

type HandType =
  | 'Bust' | 'Pair' | 'Three of a Kind' | 'Straight' | 'Full House' | 'Four of a Kind' | 'Jackpot'
interface HandTemplate { name: string; type: HandType }

const HAND_TEMPLATES: Record<number, HandTemplate> = {
  0: { name: 'No Win',          type: 'Bust' },
  1: { name: 'Pair',            type: 'Pair' },
  2: { name: 'Pair',            type: 'Pair' },
  3: { name: 'Three of a Kind', type: 'Three of a Kind' },
  4: { name: 'Straight',        type: 'Straight' },
  5: { name: 'Full House',      type: 'Full House' },
  6: { name: 'Four of a Kind',  type: 'Four of a Kind' },
  7: { name: 'No Win',          type: 'Bust' },
  8: { name: 'Three of a Kind', type: 'Three of a Kind' },
  9: { name: 'Jackpot',         type: 'Jackpot' },
}

const clampIndex = (i: number) =>
  Math.min(Math.max(0, i), Math.min(HAND_BY_INDEX.length, JACKS_OR_BETTER_BET_ARRAY.length) - 1)

const templateFromIndex = (i: number) => {
  const maxIdx = Math.min(HAND_BY_INDEX.length, JACKS_OR_BETTER_BET_ARRAY.length) - 1
  const clamped = Math.min(Math.max(0, i), maxIdx)
  const label = (HAND_BY_INDEX[clamped] || 'Bust') as HandType
  const byName = Object.entries(HAND_TEMPLATES).find(([, t]) => t.type === label)
  if (byName) return (byName as any)[1] as HandTemplate
  return HAND_TEMPLATES[0]
}

function getPokerHandCards(type: HandType) {
  switch (type) {
    case 'Pair':
      return [
        { rank: 0, suit: 0 }, { rank: 0, suit: 1 }, { rank: 7, suit: 2 }, { rank: 9, suit: 3 }, { rank: 11, suit: 0 },
      ]
    case 'Three of a Kind':
      return [
        { rank: 2, suit: 0 }, { rank: 2, suit: 1 }, { rank: 2, suit: 2 }, { rank: 7, suit: 3 }, { rank: 9, suit: 0 },
      ]
    case 'Straight':
      return [
        { rank: 4, suit: 0 }, { rank: 5, suit: 1 }, { rank: 6, suit: 2 }, { rank: 7, suit: 3 }, { rank: 8, suit: 0 },
      ]
    case 'Full House':
      return [
        { rank: 3, suit: 0 }, { rank: 3, suit: 1 }, { rank: 3, suit: 2 }, { rank: 6, suit: 0 }, { rank: 6, suit: 1 },
      ]
    case 'Four of a Kind':
      return [
        { rank: 8, suit: 0 }, { rank: 8, suit: 1 }, { rank: 8, suit: 2 }, { rank: 8, suit: 3 }, { rank: 5, suit: 0 },
      ]
    case 'Jackpot':
      return [
        { rank: 0, suit: 0 }, { rank: 0, suit: 1 }, { rank: 0, suit: 2 }, { rank: 0, suit: 3 }, { rank: 12, suit: 0 },
      ]
    default:
      return [
        { rank: 10, suit: 0 }, { rank: 8, suit: 1 }, { rank: 5, suit: 2 }, { rank: 2, suit: 3 }, { rank: 1, suit: 0 },
      ]
  }
}

export default function ProgressivePowerPoker() {
  React.useEffect(() => {
    if (!document.getElementById('pulse-fade-style')) {
      const style = document.createElement('style')
      style.id = 'pulse-fade-style'
      style.innerHTML = pulseFadeStyle
      document.head.appendChild(style)
    }
  }, [])

  const [wager, setWager] = useWagerInput()
  const game = GambaUi.useGame()
  const token = useCurrentToken()
  const pool = useCurrentPool()
  const { balance } = useTokenBalance()

  const [hand, setHand] = React.useState<{ name: string; type: HandType; payoutAtomic: number } | null>(null)
  const [revealing, setRevealing] = React.useState(false)
  const [inProgress, setInProgress] = React.useState(false)
  const [cardRevealed, setCardRevealed] = React.useState<boolean[]>([false, false, false, false, false])

  // Win banner
  const [showWin, setShowWin] = React.useState(false)

  // Profit tracked in the token actually used for the session
  const [sessionTokenMint, setSessionTokenMint] = React.useState<string | null>(null)
  const [sessionTokenSymbol, setSessionTokenSymbol] = React.useState<string>('...')
  const [sessionBase, setSessionBase] = React.useState<number>(1)
  const [profitAtomic, setProfitAtomic] = React.useState(0)

  const prettySessionTokens = (amtAtomic: number) =>
    (amtAtomic / sessionBase).toLocaleString(undefined, { maximumFractionDigits: 6 })

  // handle token change: reset session
  React.useEffect(() => {
    const mint = (token as any)?.mint
    if (mint && sessionTokenMint && mint !== sessionTokenMint) {
      setInProgress(false)
      setHand(null)
      setProfitAtomic(0)
      setCardRevealed([false, false, false, false, false])
      setShowWin(false)
      setSessionTokenMint(mint)
      setSessionTokenSymbol(token?.symbol ?? '...')
      setSessionBase(10 ** (token?.decimals ?? 0))
    }
  }, [token?.mint])

  // Track timeouts
  const timeoutsRef = React.useRef<number[]>([])
  const pushTimeout = (id: number) => { timeoutsRef.current.push(id) }
  const clearAllTimeouts = () => {
    for (const id of timeoutsRef.current) clearTimeout(id)
    timeoutsRef.current = []
  }
  React.useEffect(() => () => clearAllTimeouts(), [])

  const play = async (customWager?: number) => {
    clearAllTimeouts()
    setHand(null)
    setCardRevealed([false, false, false, false, false])
    setRevealing(true)
    setShowWin(false)

    let currentWager = Number(customWager ?? wager)
    if (!isFinite(currentWager) || isNaN(currentWager) || currentWager <= 0) {
      setRevealing(false)
      return
    }

    const betLen = Array.isArray(JACKS_OR_BETTER_BET_ARRAY) ? JACKS_OR_BETTER_BET_ARRAY.length : 0
    if (betLen !== 64) {
      console.error('Bet array length must be 64. Got:', betLen)
      setRevealing(false); setInProgress(false); return
    }

    try {
      await game.play({
        wager: currentWager,
        bet: JACKS_OR_BETTER_BET_ARRAY,
      })

      const result = await game.result()
      const rawIndex = Number((result as any)?.resultIndex ?? 0)
      const handLen = HAND_BY_INDEX.length
      if (!Number.isInteger(rawIndex) || handLen <= 0) {
        console.error('Bad game state', { rawIndex, handLen })
        setRevealing(false); setInProgress(false); return
      }

      const modIndex = ((rawIndex % betLen) + betLen) % betLen
      const resultIndex = Math.min(modIndex, Math.min(betLen, handLen) - 1)

      const template = templateFromIndex(resultIndex)
      const mult = (JACKS_OR_BETTER_BET_ARRAY[resultIndex] ?? 0)
      const payoutAtomic = Math.round(mult * currentWager)

      // Reveal with a short stagger
      pushTimeout(window.setTimeout(() => {
        setHand({ ...template, payoutAtomic })
        setProfitAtomic(prev => prev + payoutAtomic - currentWager)
        for (let i = 0; i < 5; i++) {
          pushTimeout(window.setTimeout(() => {
            setCardRevealed(prev => {
              const arr = [...prev]; arr[i] = true; return arr
            })
            if (i === 4) {
              setRevealing(false)
              if (payoutAtomic > 0 && template.type !== 'Bust') {
                setShowWin(true)
                pushTimeout(window.setTimeout(() => setShowWin(false), 1800))
              }
            }
          }, 300 + i * 160))
        }
        if (template.type === 'Bust') {
          setInProgress(false)
        }
      }, 500))
    } catch (e) {
      console.error('PP play error:', e)
      setRevealing(false); setInProgress(false)
    }
  }

  const handleStart = () => {
    setSessionTokenMint((token as any)?.mint ?? null)
    setSessionTokenSymbol(token?.symbol ?? '...')
    setSessionBase(10 ** (token?.decimals ?? 0))
    setProfitAtomic(0)

    setInProgress(true)
    play()
  }
  const handleContinue = () => {
    play()
  }
  const handleCashOut = () => {
    setInProgress(false)
    setHand(null)
    setProfitAtomic(0)
    setCardRevealed([false, false, false, false, false])
    setShowWin(false)
  }

  const tokenBase = 10 ** (token?.decimals ?? 0)
  const prettyToken = (amtAtomic: number) =>
    (amtAtomic / tokenBase).toLocaleString(undefined, { maximumFractionDigits: 6 })

  return (
    <>
      <GambaUi.Portal target="screen">
        <div style={{ display: 'flex', flexDirection: 'row', gap: 24, padding: 24, alignItems: 'stretch', minHeight: 480 }}>
          {/* Left: Main stage */}
          <div style={{ 
            flex: '1 1 0%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `url("/public/tablenew.png") center/cover no-repeat`,
            borderRadius: 14, padding: '16px 18px', margin: '8px auto', width: '100%' 
          }}>
            <h3 style={{ margin: 4, fontSize: 18, opacity: .9 }}>Progressive Power Poker</h3>

            {showWin && hand && hand.type !== 'Bust' && (
              <div style={{
                marginTop: 8,
                background: 'linear-gradient(135deg, rgba(40,200,120,.15), rgba(40,200,120,.35))',
                border: '1px solid rgba(40,200,120,.45)',
                borderRadius: 10,
                padding: '8px 12px',
                fontWeight: 700,
              }}>
                You won with: <span style={{ color: '#aaffcc' }}>{hand.type}</span> • +{prettySessionTokens(hand.payoutAtomic)} {sessionTokenSymbol}
              </div>
            )}

            {/* Cards */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, margin: '22px 0 12px 0' }}>
              {(hand ? getPokerHandCards(hand.type) : Array(5).fill(null)).map((card, i) => {
                const showFace = !!(hand && cardRevealed[i])
                return (
                  <div key={i} style={{
                    position: 'relative', width: 92, height: 132,
                    perspective: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                        transform: `rotateY(${showFace ? 0 : 180}deg)`,
                        transition: 'transform .35s',
                      }}>
                        {hand ? <PokerCard rank={(card as any).rank} suit={(card as any).suit} /> :
                          <div className="pulse-fade" style={{
                            width: '100%', height: '100%', borderRadius: 12, border: '1px dashed #fff2',
                            display: 'grid', placeItems: 'center', fontSize: 26, color: '#fff7'
                          }}>?</div>}
                      </div>
                      <div style={{
                        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                        background: 'url("/public/card.png") center/cover no-repeat',
                        borderRadius: 12, transform: `rotateY(${showFace ? 180 : 0}deg)`, backfaceVisibility: 'hidden',
                        transition: 'transform .35s',
                      }}>
                        BANABETS
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Profit */}
            <div style={{ marginTop: 8, width: '100%' }}>
              <p style={{ fontWeight: 600, fontSize: 18, textAlign: 'center', margin: 0 }}>
                {(() => {
                  const p = profitAtomic
                  if (p === 0) return <>Currently: <span style={{ color: '#ffe082' }}>EVEN</span></>
                  if (p < 0) return <>Current Loss: <span style={{ color: '#ff7f7f' }}>{prettySessionTokens(-p)} {sessionTokenSymbol}</span></>
                  return <>Current Profit: <span style={{ color: '#7fff7f' }}>{prettySessionTokens(p)} {sessionTokenSymbol}</span></>
                })()}
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {!inProgress && (
                <GambaUi.PlayButton onClick={handleStart} disabled={revealing || !wager}>
                  <span style={{ fontSize: 18 }}>Start Progressive</span>
                </GambaUi.PlayButton>
              )}
              {inProgress && (
                <>
                  <GambaUi.PlayButton
                    onClick={handleContinue}
                    disabled={revealing}
                    style={{
                      background: '#FDD835', color: '#111',
                      border: '1px solid #00000022', boxShadow: '0 2px 0 #CEB52C',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>Continue</span>
                  </GambaUi.PlayButton>
                  <GambaUi.PlayButton
                    onClick={handleCashOut}
                    disabled={revealing}
                    style={{
                      background: '#FDD835', color: '#111',
                      border: '1px solid #00000022', boxShadow: '0 2px 0 #CEB52C',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>Cash Out</span>
                  </GambaUi.PlayButton>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#111', padding: 16, borderRadius: 12, width: 280 }}>
            {/* Token card */}
            <div style={{
              background: 'linear-gradient(135deg, #1b5e20, #388e3c 60%, #fdd835)',
              border: '2px solid #ffeb3b55',
              borderRadius: 14,
              padding: '12px 14px',
              boxShadow: '0 0 12px rgba(0,0,0,.4) inset, 0 0 8px rgba(255,235,59,.3)',
            }}>
              <div style={{ fontSize: 12, opacity: .9, color: '#fff' }}>Token</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2, color: '#fff' }}>
                {token?.symbol ?? '...'}
              </div>
              <div style={{ fontSize: 13, marginTop: 4, color: '#ffee58' }}>
                Balance: <b>{prettyToken(Number(balance ?? 0))} {token?.symbol}</b>
              </div>
            </div>

            <div><Paytable /></div>

            {/* WagerInput con contenedor estilizado */}
            <div style={{ background: '#2C2541', borderRadius: 12, padding: 6 }}>
              <GambaUi.WagerInput value={wager} onChange={setWager} />
            </div>
          </div>
        </div>
      </GambaUi.Portal>
    </>
  )
}
