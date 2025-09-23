const APP_SHELL_CACHE = "appShell_v1.0";
const DYNAMIC_CACHE = "dynamic_v1.0";

const APP_SHELL = [
  "/",
  "/index.html",
  "/src/index.css",
  "/src/App.jsx",
  "/src/App.css",
];

// Guardar App Shell
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando...");
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting(); 
});

// Eliminar caches viejas
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim(); 
});

// Responder con cache primero, luego red
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cacheResp) => {
      if (cacheResp) {
        return cacheResp;
      }

      return fetch(event.request)
        .then((networkResp) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResp.clone());
            return networkResp;
          });
        })
        .catch(() => {

          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html"); 
          }
        });
    })
  );
});
