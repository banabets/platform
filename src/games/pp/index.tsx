import {
  GambaUi,
  useCurrentToken,
  useCurrentPool,
  useTokenBalance,
} from 'gamba-react-ui-v2'
import React from 'react'

const pulseFadeStyle = `
  .pulse-fade {
    animation: pulseFade 1.6s infinite;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2));
    border: 1px solid rgba(255,255,255,0.3);
  }
  @keyframes pulseFade {
    0% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
    100% { opacity: 0.4; transform: scale(1); }
  }

  .pp-win-banner {
    animation: winSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: linear-gradient(135deg, rgba(76,175,80,0.9), rgba(139,195,74,0.9));
    border: 2px solid rgba(76,175,80,0.8);
    box-shadow: 0 4px 20px rgba(76,175,80,0.4);
  }

  @keyframes winSlideIn {
    0% { transform: translateY(-20px) scale(0.9); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }

  .pp-card-flip {
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .pp-card-front, .pp-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 12px;
  }

  .pp-card-back {
    transform: rotateY(180deg);
  }
`

/** ===== Responsive dentro del Portal ===== */
const responsiveMobileStyles = `
  /* ---- Cartas (desktop por defecto) ---- */
  .pp-root .pp-card { width: 92px; height: 132px; }

  /* Móviles comunes (<= 480px) */
  @media (max-width: 480px){
    .pp-root .pp-cards { gap: 10px !important; margin: 14px 0 8px 0 !important; }
    .pp-root .pp-card  { width: 56px !important; height: 80px !important; }
  }

  /* Móviles muy estrechos (<= 360px) */
  @media (max-width: 360px){
    .pp-root .pp-card  { width: 50px !important; height: 72px !important; }
  }

  /* ---- Layout: ocultar sidebar en móvil y expandir juego ---- */
  @media (max-width: 768px){
    .pp-root .pp-layout { flex-direction: column !important; align-items: center !important; gap: 12px !important; }
    .pp-root .pp-sidebar { display: none !important; }
    .pp-root .pp-game { width: 100% !important; max-width: 100% !important; }
  }
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
  // Solo inyecta el efecto de pulso al <head>
  React.useEffect(() => {
    let el = document.getElementById('pulse-fade-style') as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = 'pulse-fade-style'
      document.head.appendChild(el)
    }
    el.innerHTML = pulseFadeStyle
  }, [])

  const [wager, setWager] = React.useState(1)
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
        {/* CSS responsive dentro del árbol del juego */}
        <div className="pp-root">
          <style id="pp-responsive-inline">{responsiveMobileStyles}</style>

          {/* Layout principal mejorado */}
          <div className="pp-layout" style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 24,
            padding: 24,
            alignItems: 'stretch',
            minHeight: 480,
            background: `
              linear-gradient(135deg,
                #0d2818 0%,
                #1a3a2e 25%,
                #0f3320 50%,
                #1a3a2e 75%,
                #0d2818 100%
              ),
              radial-gradient(circle at 30% 30%, rgba(34, 139, 34, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(46, 139, 87, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(34, 139, 34, 0.04) 0%, transparent 60%)
            `,
            borderRadius: 16,
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)'
          }}>
            {/* Left: Main stage con mejor diseño */}
            <div className="pp-game" style={{
              flex: '1 1 0%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,215,0,0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(46,139,87,0.08) 0%, transparent 50%),
                linear-gradient(135deg, rgba(13,40,24,0.95) 0%, rgba(26,58,46,0.95) 100%)
              `,
              borderRadius: 16,
              padding: '20px 24px',
              margin: '8px auto',
              width: '100%',
              border: '2px solid rgba(255,215,0,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,215,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <h3 style={{
                margin: 4,
                fontSize: 20,
                fontWeight: 700,
                opacity: 0.9,
                color: '#FFD700',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                textAlign: 'center'
              }}>
                🃏 Progressive Power Poker 🃏
              </h3>

              {showWin && hand && hand.type !== 'Bust' && (
                <div className="pp-win-banner" style={{
                  marginTop: 8,
                  padding: '12px 16px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  textAlign: 'center',
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}>
                  🎉 You won with: <span style={{ color: '#ffffff', fontSize: 18 }}>{hand.type}</span> 🎉<br/>
                  <span style={{ fontSize: 14, opacity: 0.9 }}>
                    +{prettySessionTokens(hand.payoutAtomic)} {sessionTokenSymbol}
                  </span>
                </div>
              )}

              {/* Cards */}
              <div className="pp-cards" style={{ display: 'flex', justifyContent: 'center', gap: 14, margin: '22px 0 12px 0' }}>
                {(hand ? getPokerHandCards(hand.type) : Array(5).fill(null)).map((card, i) => {
                  const showFace = !!(hand && cardRevealed[i])
                  return (
                    <div key={i} className="pp-card" style={{
                      position: 'relative',
                      perspective: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div className="pp-card-flip" style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        transform: `rotateY(${showFace ? 0 : 180}deg)`,
                      }}>
                        <div className="pp-card-front">
                          {hand ? <PokerCard rank={(card as any).rank} suit={(card as any).suit} /> :
                            <div className="pulse-fade" style={{
                              width: '100%',
                              height: '100%',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: 32,
                              fontWeight: 'bold',
                              color: '#ffffff'
                            }}>?</div>}
                        </div>
                        <div className="pp-card-back" style={{
                          background: 'url("https://i.ibb.co/BVV3pYfW/card-min.png") center/cover no-repeat',
                          border: '2px solid rgba(255,215,0,0.3)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}></div>
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

              {/* Buttons mejorados */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
                {!inProgress && (
                  <GambaUi.PlayButton
                    onClick={handleStart}
                    disabled={revealing || !wager}
                    style={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      border: '2px solid rgba(76,175,80,0.3)',
                      boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                      fontSize: 16,
                      fontWeight: 700,
                      padding: '12px 20px',
                      borderRadius: 12,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(76,175,80,0.4)'
                      }
                    }}
                  >
                    Start Progressive
                  </GambaUi.PlayButton>
                )}
                {inProgress && (
                  <>
                    <GambaUi.PlayButton
                      onClick={handleContinue}
                      disabled={revealing}
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#000',
                        border: '2px solid rgba(255,215,0,0.3)',
                        boxShadow: '0 4px 15px rgba(255,215,0,0.3)',
                        fontSize: 16,
                        fontWeight: 700,
                        padding: '12px 20px',
                        borderRadius: 12,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(255,215,0,0.4)'
                        }
                      }}
                    >
                      🎲 Continue
                    </GambaUi.PlayButton>
                    <GambaUi.PlayButton
                      onClick={handleCashOut}
                      disabled={revealing}
                      style={{
                        background: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
                        border: '2px solid rgba(244,67,54,0.3)',
                        boxShadow: '0 4px 15px rgba(244,67,54,0.3)',
                        fontSize: 16,
                        fontWeight: 700,
                        padding: '12px 20px',
                        borderRadius: 12,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(244,67,54,0.4)'
                        }
                      }}
                    >
                      💰 Cash Out
                    </GambaUi.PlayButton>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar mejorado */}
            <div className="pp-sidebar" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: 'linear-gradient(135deg, rgba(13,40,24,0.95) 0%, rgba(26,58,46,0.95) 100%)',
              padding: 20,
              borderRadius: 16,
              width: 300,
              border: '2px solid rgba(255,215,0,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 5
            }}>
              {/* Token card mejorada */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(27,94,32,0.9) 0%, rgba(56,142,60,0.9) 60%, rgba(253,216,53,0.9) 100%)',
                border: '2px solid rgba(255,235,91,0.6)',
                borderRadius: 16,
                padding: '16px 18px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 0 20px rgba(253,216,53,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ fontSize: 12, opacity: 0.8, color: '#fff', position: 'relative', zIndex: 1 }}>Token</div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 18,
                  marginTop: 4,
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {token?.symbol ?? '...'}
                </div>
                <div style={{
                  fontSize: 14,
                  marginTop: 6,
                  color: '#ffee58',
                  fontWeight: 600,
                  position: 'relative',
                  zIndex: 1
                }}>
                  Balance: <b>{prettyToken(Number(balance ?? 0))} {token?.symbol}</b>
                </div>
              </div>

              <div><Paytable /></div>

              {/* WagerInput original */}
              <GambaUi.WagerInput value={wager} onChange={setWager} />
            </div>
          </div>
        </div>
      </GambaUi.Portal>
    </>
  )
}
