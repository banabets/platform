import { GambaTransaction } from 'gamba-core-v2'
import { useGambaEventListener, useGambaEvents, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { PLATFORM_CREATOR_ADDRESS, RPC_ENDPOINT } from '../../constants'
import { Connection, PublicKey } from '@solana/web3.js'

interface Params {
  showAllPlatforms?: boolean
}

const EXCLUDED_WALLET = new PublicKey("2fop1Dg4SqeKSt9oZEF2caCfVurxzzwmMuTsVtACv4fX")

export function useRecentPlays(params: Params = {}) {
  const { showAllPlatforms = false } = params
  const location = useLocation()
  const userAddress = useWalletAddress()

  const connection = new Connection(RPC_ENDPOINT ?? 'https://api.mainnet-beta.solana.com')
  const previousEvents = useGambaEvents(
    'GameSettled',
    { address: !showAllPlatforms ? PLATFORM_CREATOR_ADDRESS : undefined },
  )

  const [newEvents, setEvents] = React.useState<GambaTransaction<'GameSettled'>[]>([])

  useGambaEventListener(
    'GameSettled',
    async (event) => {
      if (!showAllPlatforms && !event.data.creator.equals(PLATFORM_CREATOR_ADDRESS)) return

      const isExcludedWallet = event.data.user.equals(EXCLUDED_WALLET)

      // Solo verificar confirmación si es una wallet problemática
      if (isExcludedWallet) {
        try {
          const status = await connection.getSignatureStatus(event.signature)
          const confirmed = status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized'
          if (!confirmed) return // ❌ ignorar jugadas de esa wallet si no están confirmadas
        } catch (e) {
          console.error("Error checking transaction status", e)
          return
        }
      }

      const delay = event.data.user.equals(userAddress) && ['plinko', 'slots'].some((x) => location.pathname.includes(x)) ? 3000 : 1
      setTimeout(() => {
        setEvents((events) => [event, ...events])
      }, delay)
    },
    [location.pathname, userAddress, showAllPlatforms],
  )

  return React.useMemo(() => [...newEvents, ...previousEvents], [newEvents, previousEvents])
}
