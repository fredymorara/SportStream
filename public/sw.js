const SHELL_CACHE = "sportstream-shell-v1";
const RUNTIME_CACHE = "sportstream-runtime-v1";
const DATA_CACHE = "sportstream-data-v1";
const STREAMS_CACHE_KEY = "https://api.ppv.st/api/streams";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/app-icon.svg",
  "/app-icon-192.png",
  "/app-icon-512.png",
  "/sports_placeholder.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("sportstream-") &&
                ![SHELL_CACHE, RUNTIME_CACHE, DATA_CACHE].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (
    event.data?.type !== "CACHE_APP_ASSETS" ||
    !Array.isArray(event.data.assets)
  ) {
    return;
  }
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(
        event.data.assets.filter((asset) => {
          try {
            return (
              new URL(asset, self.location.origin).origin ===
              self.location.origin
            );
          } catch {
            return false;
          }
        }),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isProviderStreamsRequest =
    url.pathname === "/api/streams" &&
    /^(api\.ppv\.st|ppv\.(st|tj|pk|rw|ms|bi|ug))$/.test(url.hostname);
  if (isProviderStreamsRequest) {
    const refresh = caches.open(DATA_CACHE).then((cache) =>
      fetch(request).then((response) => {
        if (response.ok) cache.put(STREAMS_CACHE_KEY, response.clone());
        return response;
      }),
    );
    event.waitUntil(refresh.then(() => undefined).catch(() => undefined));
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        const cached = await cache.match(STREAMS_CACHE_KEY);
        if (cached) return cached;
        return refresh;
      })(),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches
              .open(SHELL_CACHE)
              .then((cache) => cache.put("/index.html", copy));
          }
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ||
            (await caches.match("/index.html")) ||
            (await caches.match("/")),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
