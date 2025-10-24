import { computed } from '@preact/signals-react'
import { GambaUi, TokenValue, useCurrentPool, useCurrentToken, useSound, useUserBalance } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import React from 'react'
import styled from 'styled-components'
import { Chip } from './Chip'
import { StatBox, StatsContainer, StyledResults } from './Roulette.styles'
import { Table } from './Table'
import { Wheel } from './Wheel'
import { CHIPS, SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'
import { addResult, bet, clearChips, results, selectedChip, totalChipValue } from './signals'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
  color: white;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 10px;
  }
`

const WheelSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
`

const TableSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 40px;
`
function Results() {
  const _results = computed(() => [...results.value].reverse().slice(0, 10)) // Solo mostrar los últimos 10 resultados
  return (
    <StyledResults>
      {_results.value.map((resultIndex, i) => {
        const number = typeof resultIndex === 'number' ? resultIndex + 1 : 'N/A'
        return (
          <div key={i}>
            {number}
          </div>
        )
      })}
    </StyledResults>
  )
}

function Stats() {
  const pool = useCurrentPool()
  const token = useCurrentToken()
  const balance = useUserBalance()
  const wager = totalChipValue.value * token.baseWager / 10_000

  const multiplier = Math.max(...bet.value)
  const maxPayout = multiplier * wager
  const maxPayoutExceeded = maxPayout > pool.maxPayout
  const balanceExceeded = wager > (balance.balance + balance.bonusBalance)

  return (
    <StatsContainer>
      <StatBox $type="wager">
        <div>
          {balanceExceeded ? (
            <span style={{ color: '#ff0066' }}>
              TOO HIGH
            </span>
          ) : (
            <TokenValue amount={wager} />
          )}
        </div>
        <div>Wager</div>
      </StatBox>
      <StatBox $type="potential">
        <div>
          {maxPayoutExceeded ? (
            <span style={{ color: '#ff0066' }}>
              TOO HIGH
            </span>
          ) : (
            <>
              <TokenValue amount={maxPayout} />
              <span style={{ fontSize: '14px', marginLeft: '4px' }}>
                ({multiplier.toFixed(2)}x)
              </span>
            </>
          )}
        </div>
        <div>Potential win</div>
      </StatBox>
    </StatsContainer>
  )
}

export default function Roulette() {
  const game = GambaUi.useGame()
  const token = useCurrentToken()
  const pool = useCurrentPool()
  const balance = useUserBalance()
  const gamba = useGamba()

  const [spinning, setSpinning] = React.useState(false)
  const [winningNumber, setWinningNumber] = React.useState<number | null>(null)

  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
  })

  const wager = totalChipValue.value * token.baseWager / 10_000

  const multiplier = Math.max(...bet.value)
  const maxPayout = multiplier * wager
  const maxPayoutExceeded = maxPayout > pool.maxPayout
  const balanceExceeded = wager > (balance.balance + balance.bonusBalance)

  const play = async () => {
    // Iniciar animación de giro
    setSpinning(true)
    setWinningNumber(null)
    sounds.play('play')
    
    // Realizar la apuesta en paralelo con la animación
    const resultPromise = game.play({
      bet: bet.value,
      wager,
    }).then(() => game.result())
    
    // Esperar mínimo 2 segundos para la animación inicial
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Obtener el resultado
    const result = await resultPromise
    
    // Asegurarnos de que resultIndex es un número válido
    const resultIndex = typeof result.resultIndex === 'number' 
      ? result.resultIndex 
      : result.resultIndex.toNumber()
    
    const number = resultIndex + 1 // Los índices van de 0-17, pero los números de 1-18
    
    // Establecer el número ganador para que la bola caiga ahí
    setWinningNumber(number)
    
    // Esperar 1 segundo más para que la bola caiga en el número
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Detener el giro y mostrar resultado
    setSpinning(false)
    addResult(resultIndex)
    
    if (result.payout > 0) {
      sounds.play('win')
    } else {
      sounds.play('lose')
    }
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Responsive>
          <Wrapper onContextMenu={(e) => e.preventDefault()}>
            <WheelSection>
              <Wheel spinning={spinning} winningNumber={winningNumber} />
              <Stats />
            </WheelSection>
            <TableSection>
              <Results />
              <Table />
            </TableSection>
          </Wrapper>
        </GambaUi.Responsive>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.Select
          options={CHIPS}
          value={selectedChip.value}
          onChange={(value) => selectedChip.value = value}
          label={(value) => (
            <>
              <Chip value={value} /> = <TokenValue amount={token.baseWager * value} />
            </>
          )}
        />
        <GambaUi.Button
          disabled={!wager || gamba.isPlaying}
          onClick={clearChips}
        >
          Clear
        </GambaUi.Button>
        <GambaUi.PlayButton disabled={!wager || balanceExceeded || maxPayoutExceeded} onClick={play}>
          Spin
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  )
}
