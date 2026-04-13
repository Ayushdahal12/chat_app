const CACHE_NAME = "guff-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
];

// ✅ Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ✅ Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch — skip ALL non-GET and API routes
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ✅ Skip these completely — go straight to network
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/socket.io/") ||
    url.pathname.startsWith("/call/") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/chat/") ||
    url.hostname.includes("onrender.com") ||
    url.hostname.includes("metered.ca") ||
    url.hostname.includes("cloudinary.com") ||
    url.hostname.includes("dicebear.com")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // ✅ Cache first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(() => {
      return caches.match("/index.html");
    })
  );
});