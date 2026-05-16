import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/*.svg'],
      manifest: {
        name: 'Partybooster HPE',
        short_name: 'Partybooster',
        description: 'Real-time multiplayer card game',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        start_url: './',
        scope: './',
        lang: 'es',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: './icons/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: './icons/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['@game/shared'],
  },
  server: {
    port: 5173,
  },
});