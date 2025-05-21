import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa'

import { defineConfig } from 'vite'

const ENV_PREFIX = ['VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 4001, host: false },
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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Banabets',
        short_name: 'Banabets',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#512da8',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    react({ jsxRuntime: 'classic' }),
  ],
}))
