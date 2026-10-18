// Fonctionnement hors connexion : l'appli est mise en cache à la première visite,
// puis chaque photo consultée est gardée pour être revue sans réseau.
// Changer VERSION à chaque mise à jour pour rafraîchir le cache.
const VERSION = "regions-v17";
const FICHIERS = ["./", "manifest.webmanifest", "img/frise.jpg", "img/icone/icone-192.png", "img/icone/apple-touch-icon.png", "img/ara.jpg", "img/bfc.jpg", "img/bretagne.jpg", "img/corse.jpg", "img/cvl.jpg", "img/grandest.jpg", "img/hdf.jpg", "img/idf.jpg", "img/na.jpg", "img/normandie.jpg", "img/occitanie.jpg", "img/paca.jpg", "img/pdl.jpg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Réseau d'abord (contenu toujours à jour), cache en secours (hors connexion).
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.headers.has("range")) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g"))) {
        const copie = r.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copie));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./")))
  );
});
