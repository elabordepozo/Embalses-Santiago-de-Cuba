import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: mode === 'production' ? '/Embalses-Santiago-de-Cuba/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',          // Se actualiza automáticamente cuando hay nueva versión
          injectRegister: 'auto',
          workbox: {
            // Archivos que se guardan en caché para uso offline
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            // Los CSV de datos también se guardan en caché
            runtimeCaching: [
              {
                // Caché para los archivos CSV de datos de embalses
                urlPattern: /\/data\/.*\.csv$/,
                handler: 'NetworkFirst',         // Intenta red primero, si falla usa caché
                options: {
                  cacheName: 'embalses-data-cache',
                  expiration: {
                    maxAgeSeconds: 60 * 60 * 24, // Los datos duran 24 horas en caché
                  },
                  networkTimeoutSeconds: 10,      // Si la red tarda más de 10s, usa caché
                },
              },
            ],
          },
          manifest: {
            name: 'Embalses Santiago de Cuba',
            short_name: 'Embalses SCU',
            description: 'Cuadro de Mando Hidrológico - Santiago de Cuba',
            theme_color: '#0f172a',
            background_color: '#0f172a',
            display: 'standalone',
            orientation: 'portrait-primary',
            start_url: '/Embalses-Santiago-de-Cuba/',
            scope: '/Embalses-Santiago-de-Cuba/',
            lang: 'es',
            icons: [
              {
                src: 'icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
              },
              {
                src: 'icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
