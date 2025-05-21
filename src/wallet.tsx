import React, { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  SolanaMobileWalletAdapter,
  createDefaultAuthorizationResultCache,
  createDefaultAddressSelector,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'
import { GambaProvider } from 'gamba-react-v2'
import { GambaUiProvider } from 'gamba-react-ui-v2'

// Detecta dispositivos móviles
const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)

export const WalletConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const network = WalletAdapterNetwork.MainnetBeta
  const endpoint = clusterApiUrl(network)

  const wallets = useMemo(() => {
    if (isMobile) {
      return [
        new SolanaMobileWalletAdapter({
          addressSelector: createDefaultAddressSelector(),
          appIdentity: {
            name: 'Banabets',
            uri: 'https://tu-dapp.com',
            icon: 'https://tu-dapp.com/icon-192x192.png',
          },
          authorizationResultCache: createDefaultAuthorizationResultCache(),
          cluster: network,
          onWalletNotFound: createDefaultWalletNotFoundHandler(),
        })
      ]
    }
    return [] // Puedes agregar adaptadores web como Phantom si lo deseas.
  }, [network])

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
