import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My Michelin',
    short_name: 'My Michelin',
    description: 'お店に自分の星を与えよう！',
    start_url: '/home',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#A90017',
    icons: [
      // Base / legacy
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },

      // Required any-purpose icons (>=144px)
      { src: '/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
      { src: '/icon-256x256.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
      { src: '/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },

      // 192 & 512 (paired any + maskable)
      { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/web-app-manifest-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/web-app-manifest-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    id: '/',
    scope: '/',
    lang: 'ja',
    dir: 'ltr',
    orientation: 'portrait-primary',
    categories: ['food', 'lifestyle', 'travel'],
    display_override: ['standalone', 'window-controls-overlay'],
    prefer_related_applications: false,
    screenshots: [
    ],
  }
}
