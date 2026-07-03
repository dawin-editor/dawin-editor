import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ⚠️  COUPLING NOTE: The DB name "DawinDB" and object store name "sharedFiles"
// below MUST stay in sync with the constants in src/lib/openFiles.ts
// (SHARED_DB_NAME / SHARED_STORE). If you rename one, rename the other.

// Google Fonts CSS - serve cached, update in background
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts-css-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

// Google Fonts webfont files - cache first, they never change
registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-webfont-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

// Share target: intercept POST from system share sheet
// Must use native fetch listener, not Workbox registerRoute (doesn't handle POST)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === "POST" && url.pathname === "/") {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("shared-files");

    // File share: store in IDB for the app to pick up
    if (files.length > 0) {
      const idb = await openDB("DawinDB", 1);
      const tx = idb.transaction("sharedFiles", "readwrite");
      const store = tx.objectStore("sharedFiles");

      for (const file of files) {
        if (file.size === 0) continue;
        const text = await file.text();
        store.put({
          name: file.name,
          text,
          type: file.type || "text/plain",
          receivedAt: new Date().toISOString(),
        });
      }

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      idb.close();

      return Response.redirect("/?shared=1", 303);
    }

    // URL share: extract url from params, redirect with clipUrl/clipTitle
    const sharedUrl =
      formData.get("url") ||
      (() => {
        const text = formData.get("text") || "";
        return text.match(/^https?:\/\//) ? text : "";
      })();
    const sharedTitle = formData.get("title") || "";

    if (sharedUrl) {
      const params = new URLSearchParams({
        shared: "1",
        clipUrl: sharedUrl,
        clipTitle: sharedTitle,
      });
      return Response.redirect("/?" + params.toString(), 303);
    }

    return Response.redirect("/?shared=1", 303);
  } catch (err) {
    console.error("[SW] Share target error:", err);
    return Response.redirect("/?shared=1", 303);
  }
}

self.skipWaiting();
clientsClaim();

function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("sharedFiles")) {
        db.createObjectStore("sharedFiles", { keyPath: "name" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
