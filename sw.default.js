'use strict';

let VERSION      = '{%VERSION%}';
let cacheName    = '{%APP_NAME%}v'+VERSION;

self.addEventListener('install', e=>{
	console.log('[ServiceWorker] installed');
	{%PATH_MANIFEST%}
	{%CACHE_MANIFEST%}
	e.waitUntil(
		caches
	    .open(cacheName)
	    .then(newCache => {
	        const toCache = [
	        	...pathManifest,
	          	...cacheManifest,
	          	'/sw.js',
	          	'/manifest.json'
	        ];
	        return toCache.map(url => {
	        	const urlParts = url.split('|');
	        	const srcUrl = urlParts[0];
	        	const destUrl = urlParts.length === 2 ? urlParts[1] : urlParts[0];
	        	console.log('url : ',url, srcUrl, destUrl);
	            // For each URL in the cacheManifest do a check in the caches,
	            // and copy across any existing asset (we're using hashing so we
	            // shouldn't get mistaken hits).
	            return caches.match(destUrl).then(cachedResponse => {
			        if (!cachedResponse || pathManifest.indexOf(url) !== -1) {
			            // Anything not already cached should be pulled from the network.
			            // Same is true for the home page.
			            console.log('Getting ' + srcUrl + ' from network.');
			            return fetch(srcUrl)
			            .then(response => {
			            	newCache.put(destUrl, response);
			            });
			        }
			        return newCache.put(destUrl, cachedResponse);
			    });
	        });
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', function(e){
	console.log('[ServiceWorker] Activated');
	caches.keys().then(keys => {
		return Promise.all(
		  keys.map(key => {
			if (key.indexOf('{%APP_NAME%}') === -1) {
			  return null;
			}
			if (key !== cacheName) {
				console.log(`[ServiceWorker] Removing ${key} from the cache`);
				return caches.delete(key);
			}
			return null;
		  })
		);
    });
	self.clients.claim();
});


self.addEventListener('fetch', function(e){
	if(e.request.method !== 'GET') return;
	console.log('[ServiceWorker] Fetching ',e.request.url);
	// Parse the request URL so we can separate domain, path and query.
	e.parsedUrl = new URL(e.request.url);
	if (e.parsedUrl.pathname.startsWith('/static/')) {
		e.respondWith(
			caches.match(e.request)
			.then(function(response){
				if(response){
					console.log('[ServiceWorker] Found In The Cache ',e.request.url);
					return response;
				}
				var req = e.request.clone();
				fetch(req)
				.then(function(resp){
					if(!resp){
						console.log('[ServiceWorker] No Response Found From Fetch');
						return resp;
					}
					var res = resp.clone();
					caches.open(cacheName).then(function(cache){
						cache.put(e.request,res);
						console.log('[ServiceWorker] Adding In Cache ',e.request.url);
						return resp;
					});
				}).catch(function(err){
					console.log('[ServiceWorker] Error Fetching & Catching New Item ',err);
				});
			})
		);
		return;
		// If it’s a request for /lib/, just go to cache
	}
	// Otherwise, use our dynamic caching strategy
	staleWhileRevalidate(e);
});

// This function builds a temporary pseudo-event object so we can
// grab the response as the value of the returned promise.
function staleWhileRevalidateWrapper(request, waitUntil) {
  return new Promise(resolve => {
    staleWhileRevalidate({
      request,
      respondWith: resolve,
      waitUntil
    })
  });
}

// staleWhileRevalidate is a caching strategy. It responds with
// whatever it got cached (if anything), while updating the cache in the background.
function staleWhileRevalidate(event) {
	console.log('[ServiceWorker] Loading Dynamic Content From '+event.request.url);
	const fetchedVersion = fetch(event.request);
	// Since we _might_ be responding with the fetched response
	// and also using it to populate the cache, we need to make a copy.
	const fetchedCopy = fetchedVersion.then(response => response.clone());
	const cachedVersion = caches.match(event.request);

	event.respondWith(async function () {
		try {
			// Respond with whatever is ready first, fetched or cached version.
			// Since fetch() will reject when offline, resolve to cachedVersion
			// on reject so we always resolve to something.
			const response = await Promise.race([
				fetchedVersion.catch(_ => cachedVersion),
				cachedVersion
			]);
			// However, caches.match() will resolve to `undefined` if there’s
			// nothing in cache. If that’s the case, wait for the network response.
			if (!response) {
				return await fetchedVersion;
			}
			return response;
		} catch(_) {
			// If nothing returns a valid response (rejects or is undefined),
			// we just return 404.
			return new Response(null, {status: 404});
		}
	}());

	event.waitUntil(async function () {
		try {
			const response = await fetchedCopy;
			const cache = await caches.open(cacheCache);
			return cache.put(event.request, response);
		} catch(_) {/* eat errors */}
	}());
}

self.addEventListener('push', e => {
	console.log('Push notification');
});