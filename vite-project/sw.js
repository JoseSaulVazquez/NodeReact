const APP_SHELL_CACHE = "appShell_v1.0";
const DYNAMIC_CACHE = "dynamic_v1.0";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
];

// ------------------ INSTALACIÓN ------------------
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando...");
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting(); 
});

// ------------------ ACTIVACIÓN ------------------
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

// ------------------ FETCH ------------------
self.addEventListener("fetch", (event) => {
  // Solo GET y solo http/https (evita chrome-extension:// o ws://)
  if (
    event.request.method !== "GET" ||
    !(event.request.url.startsWith("http://") || event.request.url.startsWith("https://"))
  ) {
    return;
  }

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
          // fallback para HTML offline
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/index.html"); 
          }
        });
    })
  );
});

// ------------------ BACKGROUND SYNC ------------------
// Nuevo listener para reintentos
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-posts") {
    console.log("[SW] Evento sync recibido");
    event.waitUntil(sendSavedPosts());
  }
});

// ------------------ IndexedDB helpers ------------------
// Abrir base y tabla
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("database", 1);
    request.onupgradeneeded = (event) => {
      let db = event.target.result;
      if (!db.objectStoreNames.contains("table")) {
        db.createObjectStore("table", { autoIncrement: true });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Enviar registros guardados
async function sendSavedPosts() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("table", "readonly");
    const store = tx.objectStore("table");
    const getReq = store.getAll();

    getReq.onsuccess = async () => {
      const allData = getReq.result;

      if (!allData.length) {
        console.log("[SW] No hay registros pendientes");
        resolve();
        return;
      }

      try {
        for (let item of allData) {
          await fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        }

        // si todo fue bien, limpiar
        const clearTx = db.transaction("table", "readwrite");
        clearTx.objectStore("table").clear();
        console.log("[SW] Todos los registros fueron reenviados");

        resolve();
      } catch (err) {
        console.error("[SW] Error reenviando:", err);
        reject(err);
      }
    };

    getReq.onerror = (e) => reject(e.target.error);
  });
}
