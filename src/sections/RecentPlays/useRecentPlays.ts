import { GambaTransaction } from 'gamba-core-v2'
import { useGambaEventListener, useGambaEvents, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { PLATFORM_CREATOR_ADDRESS, RPC_ENDPOINT } from '../../constants'
import { Connection } from '@solana/web3.js'

interface Params {
  showAllPlatforms?: boolean
}

export function useRecentPlays(params: Params = {}) {
  const { showAllPlatforms = false } = params
  const location = useLocation()
  const userAddress = useWalletAddress()

  const connection = new Connection(RPC_ENDPOINT ?? 'https://api.mainnet-beta.solana.com')

  // Eventos anteriores (cargados desde el historial)
  const previousEvents = useGambaEvents(
    'GameSettled',
    { address: !showAllPlatforms ? PLATFORM_CREATOR_ADDRESS : undefined },
  )

  const [newEvents, setEvents] = React.useState<GambaTransaction<'GameSettled'>[]>([])

  // Escuchar nuevos eventos y verificar si están confirmados
  useGambaEventListener(
    'GameSettled',
    async (event) => {
      if (!showAllPlatforms && !event.data.creator.equals(PLATFORM_CREATOR_ADDRESS)) return

      try {
        const status = await connection.getSignatureStatus(event.signature)
        const confirmed = status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized'
        if (!confirmed) return
      } catch (e) {
        console.error("Error checking transaction status", e)
        return
      }

      const delay = event.data.user.equals(userAddress) && ['plinko', 'slots'].some((x) => location.pathname.includes(x)) ? 3000 : 1
      setTimeout(() => {
        setEvents((events) => [event, ...events])
      }, delay)
    },
    [location.pathname, userAddress, showAllPlatforms],
  )

  return React.useMemo(
    () => {
      return [...newEvents, ...previousEvents]
    },
    [newEvents, previousEvents],
  )
}
