const CACHE_NAME = "guff-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // ✅ Don't intercept ANYTHING except static assets
  const url = new URL(event.request.url);
  
  // Skip all non-GET requests
  if (event.request.method !== "GET") return;
  
  // Skip API calls
  if (url.pathname.startsWith("/api/")) return;
  
  // Skip external URLs
  if (url.origin !== location.origin) return;
  
  // Skip navigation requests (page loads)
  if (event.request.mode === "navigate") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => fetch(event.request))
  );
});