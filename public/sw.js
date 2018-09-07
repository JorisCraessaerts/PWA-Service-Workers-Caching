
self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open('static-v2')
      .then((cache) => {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/help',
          '/help/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          // Browsers that need these polyfills don't support service workers in the first place so these polyfills won't be added. They would only be installed for browsers
          // That support service workers and these browsers usually don't need these polyfills anyway.
          // Caching still makes sence for performance because even on browsers that don't need the polyfills, they are requested in the index.html.
          // Best is to have a build workflow where these files aren't referenced in the index.html on browsers that don't need these files.
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
        ]);
      })
  );
});
// 

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== 'static-v2' && key !== 'dynamic') {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
          // When not the if-case, the map function will return null.
        }));
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        else {
          return fetch(event.request)
            .then((res) => {
              return caches.open('dynamic')
                .then((cache) => {
                  cache.put(event.request, res.clone()); // A response can only be used once. Once it's used, it's empty. Storing the response uses it so we have to clone it when we add it to the cache. This way we can return the original response to the user.
                  return res;
                });
            })
            .catch((error) => {

            });
        }
      })
  )
});