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
      srcDir: "public",
      filename: "sw.js",
      strategies: "injectManifest",
      includeAssets: ["**/*"],

      injectManifest: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,otf}",
        ],
      },
      manifest: {
        id: "/",
        scope: "/",
        launch_handler: {
          client_mode: "auto",
        },
        name: "محرّر دوّن - محرّر نصوص ماركداون",
        short_name: "محرّر دوّن",
        description:
          "محرّر نصوص ماركداون بسيط وسريع مع واجهة عربية وتجربة كتابة سلسة.",
        lang: "ar",
        dir: "rtl",
        start_url: "/",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#2368A1",
        categories: ["productivity", "utilities", "writing"],
        shortcuts: [
          {
            name: "مستند جديد",
            short_name: "جديد",
            url: "/?fresh=1",
            icons: [
              {
                src: "/pwa-192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
        ],
        share_target: {
          action: "/",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            title: "title",
            text: "text",
            url: "url",
            files: [
              {
                name: "shared-files",
                accept: [
                  "text/markdown",
                  "text/x-markdown",
                  "text/plain",
                  "text/html",
                  ".md",
                  ".markdown",
                  ".txt",
                  ".html",
                ],
              },
            ],
          },
        },
        file_handlers: [
          {
            action: "/openFile",
            accept: {
              "text/markdown": [".md", ".markdown"],
              "text/x-markdown": [".md", ".markdown"],
              "text/plain": [".txt"],
              "text/html": [".html"],
              "application/json": [".json"],
            },
          },
        ],
        icons: [
          {
            src: "/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable_icon_x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable_icon_x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot.png",
            sizes: "1200x584",
            type: "image/png",
            form_factor: "wide",
            label: "محرّر دوّن على سطح المكتب",
          },
          {
            src: "/screenshot-narrow.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "محرّر دوّن على الهاتف",
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
