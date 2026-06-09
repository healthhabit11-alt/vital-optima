/* coi-serviceworker - enables SharedArrayBuffer on web by adding COOP/COEP headers */

// When loaded as a regular script in the HTML page, register the SW and reload if needed
if (typeof window !== "undefined") {
  if (!window.crossOriginIsolated && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(window.document.currentScript.src)
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          reg.installing.addEventListener("statechange", (e) => {
            if (e.target.state === "installed") {
              window.location.reload();
            }
          });
        });
        if (reg.active) {
          window.location.reload();
        }
      })
      .catch(console.error);
  }
} else {
  // When running as the actual service worker
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

  self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;

    event.respondWith(
      fetch(request)
        .then((r) => {
          if (!r || r.status === 0 || r.type === "opaque") return r;
          const headers = new Headers(r.headers);
          headers.set("Cross-Origin-Opener-Policy", "same-origin");
          headers.set("Cross-Origin-Embedder-Policy", "require-corp");
          return new Response(r.body, { status: r.status, statusText: r.statusText, headers });
        })
        .catch(() => fetch(request))
    );
  });
}
