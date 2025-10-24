import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const ENV_PREFIX = ['VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 4001, host: '0.0.0.0' },
  assetsInclude: ["**/*.glb"],
  define: {
    'process.env.ANCHOR_BROWSER': true,
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    },
  },
  plugins: [
    react({ jsxRuntime: 'classic' }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Banabets - Casino Web3 en Solana',
        short_name: 'Banabets',
        description: 'Juega casino blockchain en Solana. Jackpot, dados, slots y más juegos con criptomonedas.',
        theme_color: '#ff3fdd',
        background_color: '#121724',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Jackpot',
            short_name: 'Jackpot',
            description: 'Juega al jackpot multiplayer',
            url: '/jackpot',
            icons: [{ src: 'games/jackpot.webp', sizes: '96x96' }]
          },
          {
            name: 'Slots',
            short_name: 'Slots',
            description: 'Juega a las máquinas tragamonedas',
            url: '/slots',
            icons: [{ src: 'games/slots.png', sizes: '96x96' }]
          }
        ],
        categories: ['games', 'entertainment', 'finance']
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'coingecko-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?timestamp=${Date.now()}`
              }
            }
          },
          {
            urlPattern: /^https:\/\/explorer\.gamba\.so\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gamba-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 6 // 6 horas
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
}))
