const CACHE_NAME = "guff-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.map((key) => caches.delete(key)))
  ));
});

self.addEventListener("fetch", (event) => {
  // ✅ Don't intercept ANY API or external calls
  if (
    event.request.url.includes("onrender.com") ||
    event.request.url.includes("/api/") ||
    event.request.url.includes("cloudinary.com") ||
    event.request.url.includes("socket.io") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => fetch(event.request))
  );
});