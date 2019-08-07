var serviceVersion = 'cache-v3'

// 监听 service worker 的 install 事件
this.addEventListener('install', function (event) {
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    event.waitUntil(
        // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
        caches.open(serviceVersion).then(function (cache) {
            // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存
            return cache.addAll([
                '/ServiceWorkerTest/',
                '/ServiceWorkerTest/index.html',
                '/ServiceWorkerTest/error.html',
                '/ServiceWorkerTest/css/main.css',
            ]);
        })
    );
});
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (resp) {
            return resp || fetch(event.request).then(function (response) {
                return caches.open(serviceVersion).then(function (cache) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(function () {
            return caches.match('/ServiceWorkerTest/error.html');
        })
    );
});

self.addEventListener('activate', function (event) {
    var cacheWhitelist = [serviceVersion];

    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});