/**
 * SWITCHING MASTER — Service Worker
 *
 * 브라우저가 PWA 로 인식하려면 fetch 핸들러가 있는 service worker 가
 * 필요합니다. 이 앱은 대부분의 리소스가 Firebase/CDN 에 의존하므로
 * "network-first, cache on success" 전략으로 구성:
 *  - 네트워크 우선 시도 → 성공 시 백그라운드로 캐시 갱신
 *  - 네트워크 실패 시 캐시에서 제공 (오프라인 폴백)
 *  - POST/외부도메인/Firebase API 등은 절대 캐시하지 않음
 */

const CACHE_NAME = 'switching-master-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css?v=9',
  '/device-gate.css?v=2',
  '/device-auth.js?v=10',
  '/js/client.js?v=1',
  '/js/dashboard.js?v=1',
  '/js/app.js?v=8',
  '/assets/logo-symbol.png',
  '/assets/logo-horizontal.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add what we can; don't fail the whole install if one URL 404s
      return Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch(() => {})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // GET 만 캐시 대상
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 외부 도메인 (Firebase, Google CDN 등) 은 캐시 우회 — 항상 네트워크
  if (url.origin !== self.location.origin) return;

  // Firebase/인증 관련 경로는 캐시 금지 (여기서는 same-origin 이지만 혹시 모를 API)
  if (url.pathname.startsWith('/__/') || url.pathname.includes('/api/')) return;

  event.respondWith(
    fetch(req)
      .then((resp) => {
        // 2xx 응답만 캐시 갱신
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return resp;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match('/index.html'))
      )
  );
});
