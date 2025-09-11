import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-icon-180.png",
        "manifest-icon-192.maskable.png",
        "manifest-icon-512.maskable.png",
        "logo.png",
        "screenshot.png",
        "apple-splash-1125-2436.jpg",
        "apple-splash-1136-640.jpg",
        "apple-splash-1170-2532.jpg",
        "apple-splash-1179-2556.jpg",
        "apple-splash-1206-2622.jpg",
        "apple-splash-1242-2208.jpg",
        "apple-splash-1242-2688.jpg",
        "apple-splash-1284-2778.jpg",
        "apple-splash-1290-2796.jpg",
        "apple-splash-1320-2868.jpg",
        "apple-splash-1334-750.jpg",
        "apple-splash-1488-2266.jpg",
        "apple-splash-1536-2048.jpg",
        "apple-splash-1620-2160.jpg",
        "apple-splash-1640-2360.jpg",
        "apple-splash-1668-2224.jpg",
        "apple-splash-1668-2388.jpg",
        "apple-splash-1792-828.jpg",
        "apple-splash-2048-1536.jpg",
        "apple-splash-2048-2732.jpg",
        "apple-splash-2160-1620.jpg",
        "apple-splash-2208-1242.jpg",
        "apple-splash-2224-1668.jpg",
        "apple-splash-2266-1488.jpg",
        "apple-splash-2360-1640.jpg",
        "apple-splash-2388-1668.jpg",
        "apple-splash-2436-1125.jpg",
        "apple-splash-2532-1170.jpg",
        "apple-splash-2556-1179.jpg",
        "apple-splash-2622-1206.jpg",
        "apple-splash-2688-1242.jpg",
        "apple-splash-2732-2048.jpg",
        "apple-splash-2778-1284.jpg",
        "apple-splash-2796-1290.jpg",
        "apple-splash-2868-1320.jpg",
        "apple-splash-640-1136.jpg",
        "apple-splash-750-1334.jpg",
        "apple-splash-828-1792.jpg",
      ],
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,otf}",
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
              },
            },
          },
        ],
      },
      manifest: {
        name: "محرّر دوّن - محرّر نصوص ماركداون",
        short_name: "محرّر دوّن",
        description:
          "محرّر نصوص ماركداون بسيط وسريع مع واجهة عربية وتجربة كتابة سلسة.",
        categories: ["productivity", "utilities", "writing"],
        icons: [
          {
            src: "manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        screenshots: [
          {
            src: "screenshot.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          }
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
