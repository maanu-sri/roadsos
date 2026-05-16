const CACHE_NAME = "roadsos-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/src/App.jsx",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).catch(() => caches.match("/index.html"));
    })
  );
});