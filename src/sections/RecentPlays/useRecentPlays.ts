
import { GambaTransaction } from 'gamba-core-v2'
import { useGambaEventListener, useGambaEvents, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { PLATFORM_CREATOR_ADDRESS } from '../../constants'

interface Params {
  showAllPlatforms?: boolean
}

export function useRecentPlays(params: Params = {}) {
  const { showAllPlatforms = false } = params
  const location = useLocation()
  const userAddress = useWalletAddress()

  // Fetch previous events
  const previousEvents = useGambaEvents(
    'GameSettled',
    { address: !showAllPlatforms ? PLATFORM_CREATOR_ADDRESS : undefined },
  )

  const [newEvents, setEvents] = React.useState<GambaTransaction<'GameSettled'>[]>([])

  // Listen for new events
  useGambaEventListener(
    'GameSettled',
    (event) => {
      // Ignore events that occured on another platform
      if (!showAllPlatforms && !event.data.creator.equals(PLATFORM_CREATOR_ADDRESS)) return

      // Opcional: ignorar eventos de una wallet problemática
      const ignoredWallet = "2fop1Dg4SqeKSt9oZEF2caCfVurxzzwmMuTsVtACv4fX"
      const isFromIgnored = event.data.user.toBase58() === ignoredWallet

      const delay = event.data.user.equals(userAddress) && ['plinko', 'slots'].some((x) => location.pathname.includes(x)) ? 3000 : 1

      setTimeout(() => {
        setEvents((events) => {
          const alreadyExists = events.some(e => e.signature === event.signature)
          if (alreadyExists || isFromIgnored) return events
          return [event, ...events]
        })
      }, delay)
    },
    [location.pathname, userAddress, showAllPlatforms],
  )

  // Merge previous & new events
  return React.useMemo(() => {
    return [...newEvents, ...previousEvents]
  }, [newEvents, previousEvents])
}
