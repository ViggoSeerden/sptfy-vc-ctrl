!function(){[{'revision':'aa5ed645347cb6069ad43cb5416fc402','url':'/sptfy-vc-ctrl/index.html'},{'revision':null,'url':'/sptfy-vc-ctrl/static/css/main.0a262e6c.css'},{'revision':null,'url':'/sptfy-vc-ctrl/static/js/787.11a92364.chunk.js'},{'revision':null,'url':'/sptfy-vc-ctrl/static/js/main.9dcdf7f6.js'},{'revision':null,'url':'/sptfy-vc-ctrl/static/media/Roboto-Light.333da16a3f3cc391d087.ttf'},{'revision':null,'url':'/sptfy-vc-ctrl/static/media/Roboto-Regular.fc2b5060f7accec5cf74.ttf'},{'revision':null,'url':'/sptfy-vc-ctrl/static/media/Roboto-Thin.a732a12eb07742232407.ttf'},{'revision':null,'url':'/sptfy-vc-ctrl/static/media/logo2.4b99ca8d5c6dd05a28e4.png'}];var e=["manifest.json","index.html","./","logo192.png","logo512.png","favicon.ico","logo2.png","offline.html"];self.addEventListener("install",(function(n){console.log("Service Worker: I am being installed, hello world!"),n.waitUntil(caches.open("broadwayCache").then((function(n){return console.log("Service Worker: Caching important offline files"),n.addAll(e).catch((function(e){console.error("Failed to cache files:",e)}))})))})),self.addEventListener("activate",(function(e){console.log("Service Worker: All systems online, ready to go!")})),self.addEventListener("fetch",(function(e){console.log("Service Worker: User threw a ball, I need to fetch it!"),e.respondWith(caches.match(e.request).then((function(n){return n||fetch(e.request).catch((function(){return caches.match("offline.html")}))})))}))}();
//# sourceMappingURL=service-worker.js.map