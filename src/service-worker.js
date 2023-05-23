/* eslint-disable no-restricted-globals */
const offlinePage = 'offline.html';
const selfManifest = self.__WB_MANIFEST;
let pushdata;
const cacheName = "broadwayCache";
//Just take into account that the "files" below are request-url's and not filenames perse. So for your root of your website yous should include "./" and if you use my site (or another plain HTML-site) also "index.html". If you use a server-side language and have friendly url's that could be something like "news/this-is-a-newsarticle/".
const appFiles = [
  "manifest.json",
  "index.html",
  "./",
  "logo192.png",
  "logo512.png",
  "favicon.ico",
  "logo2.png",
  "offline.html"
];


self.addEventListener("install", (installing) => {
  console.log("Service Worker: I am being installed, hello world!");
  //Put important offline files in cache on installation of the service worker
  installing.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("Service Worker: Caching important offline files");
      return cache.addAll(appFiles).catch(error => {
        console.error('Failed to cache files:', error);
      });
    })
  );
});

self.addEventListener("activate", (activating) => {
  console.log("Service Worker: All systems online, ready to go!");
});

self.addEventListener("fetch", (fetching) => {
  console.log("Service Worker: User threw a ball, I need to fetch it!");
  fetching.respondWith(
      caches.match(fetching.request).then((response) => {
        return response || fetch(fetching.request).catch(() => {
          return caches.match(offlinePage);
        });
      })
  );
});

// self.addEventListener("push", (pushing) => {
//   console.log("Service Worker: I received some push data, but because I am still very simple I don't know what to do with it :(");
//   if (pushing.data) {
//     pushdata = JSON.parse(pushing.data.text());
//     console.log("Service Worker: I received this:", pushdata);
//     if ((pushdata["title"] != "") && (pushdata["message"] != "")) {
//       const options = { body: pushdata["message"] }
//       self.registration.showNotification(pushdata["title"], options);
//       console.log("Service Worker: I made a notification for the user");
//     } else {
//       console.log("Service Worker: I didn't make a notification for the user, not all the info was there :(");
//     }
//   }
// })