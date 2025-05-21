
import React, { useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
import {
  WalletModalProvider
} from '@solana/wallet-adapter-react-ui'
import { MobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile'
import { clusterApiUrl } from '@solana/web3.js'
import { GambaProvider } from 'gamba-react-v2'
import { GambaUiProvider } from 'gamba-react-ui-v2'

require('@solana/wallet-adapter-react-ui/styles.css')

export const WalletConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const endpoint = clusterApiUrl('mainnet-beta')

  const wallets = useMemo(() => [
    new MobileWalletAdapter({
      appIdentity: {
        name: 'Banabets',
      },
      authorizationResultCache: 'default',
      cluster: 'mainnet-beta',
    })
  ], [])

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
