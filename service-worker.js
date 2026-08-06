const CACHE_NAME = "golf-round-tracker-v5";
const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.webmanifest",
    "./icons/icon-180.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_FILES);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function (cacheName) {
                        return cacheName !== CACHE_NAME;
                    })
                    .map(function (cacheName) {
                        return caches.delete(cacheName);
                    })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function (response) {
                if (response.ok && response.type === "basic") {
                    const responseCopy = response.clone();

                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, responseCopy);
                    });
                }

                return response;
            })
            .catch(function () {
                return caches.match(event.request).then(function (cachedResponse) {
                    if (cachedResponse !== undefined) {
                        return cachedResponse;
                    }

                    if (event.request.mode === "navigate") {
                        return caches.match("./index.html");
                    }

                    return Response.error();
                });
            })
    );
});
