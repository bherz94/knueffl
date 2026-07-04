import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Kniffel',
        short_name: 'Kniffel',
        description: 'Kniffel Scorekeeper für 2–6 Spieler',
        theme_color: '#6366f1',
        background_color: '#1e2130',
        display: 'standalone',
        orientation: 'landscape',
        start_url: command === 'build' ? '/knueffl/' : '/',
        scope: command === 'build' ? '/knueffl/' : '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base: command === 'build' ? '/knueffl/' : '/',
}))
