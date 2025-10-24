// src/games/Slots/index.tsx
import { GameResult } from 'gamba-core-v2'
import { GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import React, { useEffect, useRef } from 'react'
import { ItemPreview } from './ItemPreview'
import { Slot } from './Slot'
import { StyledSlots, Grid, TopMask } from './Slots.styles'
import { HeaderBar } from './HeaderBar'
import {
  FINAL_DELAY,
  LEGENDARY_THRESHOLD,
  NUM_SLOTS,
  REVEAL_SLOT_DELAY,
  SLOT_ITEMS,
  SOUND_LOSE,
  SOUND_PLAY,
  SOUND_REVEAL,
  SOUND_REVEAL_LEGENDARY,
  SOUND_SPIN,
  SOUND_WIN,
  SPIN_DELAY,
  SlotItem,
} from './constants'
import { generateBetArray, getSlotCombination } from './utils'

function Messages({ messages }: {messages: string[]}) {
  const [messageIndex, setMessageIndex] = React.useState(0)
  React.useEffect(() => {
    const timeout = setInterval(() => setMessageIndex((x) => (x + 1) % messages.length), 2500)
    return () => clearInterval(timeout)
  }, [messages])
  return <>{messages[messageIndex]}</>
}

export default function Slots() {
  const gamba = GambaUi.useGame()
  const game = GambaUi.useGame()
  const pool = useCurrentPool()
  const [spinning, setSpinning] = React.useState(false)
  const [spinId, setSpinId] = React.useState(0)
  const playEpoch = React.useRef(0)
  const [result, setResult] = React.useState<GameResult>()
  const [good, setGood] = React.useState(false)
  const [revealedSlots, setRevealedSlots] = React.useState(0)
  const [wager, setWager] = useWagerInput()
  const [hitMultiplier, setHitMultiplier] = React.useState<number | null>(null)
  const [combination, setCombination] = React.useState(
    Array.from({ length: NUM_SLOTS }).map(() => SLOT_ITEMS[0]),
  )
  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    reveal: SOUND_REVEAL,
    revealLegendary: SOUND_REVEAL_LEGENDARY,
    spin: SOUND_SPIN,
    play: SOUND_PLAY,
  })
  const bet = React.useMemo(() => generateBetArray(pool.maxPayout, wager), [pool.maxPayout, wager])
  const timeout = useRef<any>()
  const isValid = bet.some((x) => x > 1)

  useEffect(() => () => { timeout.current && clearTimeout(timeout.current) }, [])

  const revealSlot = (combination: SlotItem[], slot = 0, epoch = playEpoch.current) => {
    if (epoch !== playEpoch.current) return;
    sounds.play('reveal', { playbackRate: 1.1 })
    const allSame = combination.slice(0, slot + 1).every((item, index, arr) => !index || item === arr[index - 1])
    if (combination[slot].multiplier >= LEGENDARY_THRESHOLD && allSame) sounds.play('revealLegendary')
    setRevealedSlots(slot + 1)
    if (slot < NUM_SLOTS - 1) {
      timeout.current = setTimeout(() => revealSlot(combination, slot + 1, epoch), REVEAL_SLOT_DELAY)
    } else {
      sounds.sounds.spin.player.stop()
      timeout.current = setTimeout(() => {
        if (epoch !== playEpoch.current) return;
        setSpinning(false)
        if (allSame) { setGood(true); sounds.play('win') } else sounds.play('lose')
        // volver a estado idle con spinners después de un rato
        setTimeout(() => { if (epoch === playEpoch.current) setRevealedSlots(0) }, 1500)
      }, FINAL_DELAY)
    }
  }

  const play = async () => {
    // cancel previous timers and advance epoch
    if (timeout.current) { clearTimeout(timeout.current) }
    playEpoch.current += 1
    const epoch = playEpoch.current
    setSpinId((x) => x + 1)
    try {
      setSpinning(true)
      setResult(undefined)
      await game.play({ wager, bet })
      sounds.play('play')
      setRevealedSlots(0); setGood(false)
      const startTime = Date.now()
      sounds.play('spin', { playbackRate: .5 })
      const result = await gamba.result()
      // Encender chip del multiplicador
      setHitMultiplier(result.multiplier)
      setTimeout(() => setHitMultiplier(null), 1500)
      const resultDelay = Date.now() - startTime
      const revealDelay = Math.max(0, SPIN_DELAY - resultDelay)
      const combination = getSlotCombination(NUM_SLOTS, result.multiplier, bet)
      setCombination(combination); setResult(result)
      timeout.current = setTimeout(() => revealSlot(combination, 0, epoch), revealDelay)
    } catch (err) {
      setSpinning(false); setRevealedSlots(NUM_SLOTS)
      throw err
    }
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Responsive>
          <StyledSlots className="candy-board-clip">
            <TopMask />
            <HeaderBar left={<ItemPreview betArray={bet} hitMultiplier={hitMultiplier} />} />
            <Grid>
              {combination.map((slot, i) => (
                <Slot key={i} index={i} revealed={revealedSlots > i} item={slot} good={good} spinning={spinning} spinId={spinId} />
              ))}
            </Grid>
            <div className="result" data-good={good} style={{ marginTop: 12 }}>
              {spinning ? (
                <Messages messages={['Spinning!', 'Good luck']} />
              ) : result ? (
                <>Payout: <TokenValue mint={result.token} amount={result.payout} /></>
              ) : isValid ? (
                <Messages messages={['SPIN ME!', 'FEELING LUCKY?']} />
              ) : (
                <>❌ Choose a lower wager!</>
              )}
            </div>
          </StyledSlots>
        </GambaUi.Responsive>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />
        <GambaUi.PlayButton disabled={!isValid} onClick={play}>Spin</GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  )
}
