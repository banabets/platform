
import { GambaTransaction } from 'gamba-core-v2'
import { useGambaEventListener, useGambaEvents, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { PLATFORM_CREATOR_ADDRESS } from '../../constants'
import { Connection } from '@solana/web3.js'

interface Params {
  showAllPlatforms?: boolean
}

export function useRecentPlays(params: Params = {}) {
  const { showAllPlatforms = false } = params
  const location = useLocation()
  const userAddress = useWalletAddress()

  const previousEvents = useGambaEvents(
    'GameSettled',
    { address: !showAllPlatforms ? PLATFORM_CREATOR_ADDRESS : undefined },
  )

  const [newEvents, setEvents] = React.useState<GambaTransaction<'GameSettled'>[]>([])
  const connection = new Connection("https://api.mainnet-beta.solana.com")

  useGambaEventListener(
    'GameSettled',
    async (event) => {
      if (!showAllPlatforms && !event.data.creator.equals(PLATFORM_CREATOR_ADDRESS)) return

      const ignoredWallet = "2fop1Dg4SqeKSt9oZEF2caCfVurxzzwmMuTsVtACv4fX"
      const isFromIgnored = event.data.user.toBase58() === ignoredWallet

      const delay = event.data.user.equals(userAddress) && ['plinko', 'slots'].some((x) => location.pathname.includes(x)) ? 3000 : 1

      setTimeout(async () => {
        const alreadyExists = newEvents.some(e => e.signature === event.signature)
        if (alreadyExists || isFromIgnored) return

        try {
          const statusResp = await connection.getSignatureStatus(event.signature)
          const confirmed = statusResp?.value?.confirmationStatus === "finalized" && !statusResp?.value?.err

          if (!confirmed) return
          setEvents((events) => [event, ...events])
        } catch (error) {
          console.error("Error verificando transacción:", error)
        }
      }, delay)
    },
    [location.pathname, userAddress, showAllPlatforms],
  )

  return React.useMemo(() => {
    return [...newEvents, ...previousEvents]
  }, [newEvents, previousEvents])
}
