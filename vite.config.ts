import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["**/*"],

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,otf}",
        ],
        
        // skipWaiting: true,
        // clientsClaim: true,
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
        launch_handler: {
          client_mode:"auto"
        },
        name: "محرّر دوّن - محرّر نصوص ماركداون",
        short_name: "محرّر دوّن",
        description:
          "محرّر نصوص ماركداون بسيط وسريع مع واجهة عربية وتجربة كتابة سلسة.",
        lang: "ar",
        dir: "rtl",
        start_url: "/?fresh=1",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#2368A1",
        categories: ["productivity", "utilities", "writing"],
        file_handlers: [
          {
            action: "/openFile",
            accept: {
              // Markdown common MIME/type + extensions
              "text/markdown": [".md", ".markdown"],
              "text/x-markdown": [".md", ".markdown"],
              "text/plain": [".txt"],
            }
          },
        ],
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "maskable_icon_x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "maskable_icon_x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "screenshot.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
          },
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
