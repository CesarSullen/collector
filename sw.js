const CACHE_NAME = "collector-cache-v1.2";
const STATIC_ASSETS = [
	//  Page
	"./",
	"./index.html",
	"./css/style.css",
	"./js/main.js",
	"./manifest.json",

	//  Assets
	"./assets/icons/paper-plane-tilt-fill.svg",
	"./assets/icons/plus-bold.svg",
	"./assets/icons/trash.svg",

	//	Screenshots
	"./assets/screenshots/mobile-1.png",
	"./assets/screenshots/mobile-2.png",
	"./assets/screenshots/desktop-1.png",

	//  Typography
	"./typography/Poppins-Bold.ttf",
	"./typography/Poppins-Regular.ttf",
];

//  Install
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
});

//  Activate
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys
					.filter((key) => key !== CACHE_NAME)
					.map((key) => caches.delete(key))
			);
		})
	);
});

//  Fetch
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});
