
import React, { useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
import {
  WalletModalProvider
} from '@solana/wallet-adapter-react-ui'
import {
  MobileWalletAdapter,
  createDefaultAuthorizationResultCache,
} from '@solana-mobile/wallet-adapter-mobile'
import { clusterApiUrl } from '@solana/web3.js'
import { GambaProvider } from 'gamba-react-v2'
import { GambaUiProvider } from 'gamba-react-ui-v2'

// Detecta si es un dispositivo móvil
const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)

export const WalletConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const endpoint = clusterApiUrl('mainnet-beta')

  const wallets = useMemo(() => {
    if (isMobile) {
      return [
        new MobileWalletAdapter({
          appIdentity: {
            name: 'Banabets',
            uri: 'https://banabets.com',
            icon: 'https://banabets.com/icon-192x192.png',
          },
          authorizationResultCache: createDefaultAuthorizationResultCache(),
        })
      ]
    }
    return [] // puedes agregar otros wallets aquí para desktop si lo deseas
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <GambaProvider>
            <GambaUiProvider>
              {children}
            </GambaUiProvider>
          </GambaProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
