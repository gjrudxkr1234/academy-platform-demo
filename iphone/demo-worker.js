"use strict";
const VERSION = "1c7d4adc60cb5570";
const FILES = ["icons/owner-180.png", "icons/owner-192.png", "icons/owner-512.png", "icons/parent-180.png", "icons/parent-192.png", "icons/parent-512.png", "icons/student-180.png", "icons/student-192.png", "icons/student-512.png", "icons/teacher-180.png", "icons/teacher-192.png", "icons/teacher-512.png", "index.html", "owner/index.html", "owner/manifest.webmanifest", "owner/role.js", "parent/index.html", "parent/manifest.webmanifest", "parent/role.js", "pwa.css", "pwa.js", "shared/appearance.css", "shared/appearance.js", "shared/assets/brand/gradient-logo-white.svg", "shared/assets/brand/gradient-logo.svg", "shared/assets/brand/gradient-symbol-white.svg", "shared/assets/brand/portrait-0.svg", "shared/assets/brand/portrait-1.svg", "shared/assets/brand/portrait-2.svg", "shared/assets/demo-icon-192.png", "shared/assets/demo-icon-512.png", "shared/assets/demo-roster-errors.xlsx", "shared/assets/demo-roster-valid.xlsx", "shared/assets/fonts/inter-400-latin.woff2", "shared/assets/fonts/inter-700-latin.woff2", "shared/assets/fonts/inter-OFL.txt", "shared/assets/licenses.txt", "shared/assets/neis-demo.js", "shared/assets/qr-vendor.js", "shared/assets/roster-samples.js", "shared/assets/school-assessments.js", "shared/block-details.css", "shared/block-details.js", "shared/block-tabs.css", "shared/block-tabs.js", "shared/demo.js", "shared/home-v3-banners.js", "shared/home-v3-calendar.css", "shared/home-v3-calendar.js", "shared/home-v3.css", "shared/home-v3.js", "shared/operations.css", "shared/operations.js", "shared/photo-ui.css", "shared/role-ui.css", "shared/role-ui.js", "shared/site-editor.js", "shared/style.css", "shared/tuition.css", "shared/tuition.js", "shared/workforce-payroll.js", "student/index.html", "student/manifest.webmanifest", "student/role.js", "teacher/index.html", "teacher/manifest.webmanifest", "teacher/role.js", "asset-manifest.json", "./", "owner/", "teacher/", "student/", "parent/"];
const ROOT = new URL(".", self.location.href);
const PREFIX = `academy-iphone-demo:${ROOT.pathname}:`;
const CACHE = PREFIX + VERSION;
const urls = FILES.map((path) => new URL(path, ROOT).href);
const manifestUrl = new URL("asset-manifest.json", ROOT).href;

async function verifyRelease(cache) {
  const response = await cache.match(manifestUrl);
  const manifest = await response?.json();
  if (manifest?.version !== VERSION || !Array.isArray(manifest.assets)) throw new Error("Incomplete demo release");
  const assets = new Map(manifest.assets.map((asset) => [new URL(asset.path, ROOT).href, asset]));
  for (const url of urls) {
    if (url === manifestUrl) continue;
    const asset = assets.get(url.endsWith("/") ? url + "index.html" : url);
    const bytes = await (await cache.match(url))?.arrayBuffer();
    if (!bytes || !asset || bytes.byteLength !== asset.bytes) throw new Error("Incomplete demo asset");
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    const actual = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
    if (actual !== asset.sha256) throw new Error("Mixed demo release");
  }
}

self.addEventListener("install", (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  try {
    // cache.addAll is atomic: no 'ready' state for a partially downloaded fixture.
    await cache.addAll(urls.map((url) => new Request(url, { cache: "reload", credentials: "same-origin" })));
    await verifyRelease(cache);
    await self.skipWaiting();
  } catch (error) { await caches.delete(CACHE); throw error; }
})()));
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  url.search = ""; url.hash = "";
  if (!urls.includes(url.href)) return;
  event.respondWith((async () => {
    const cached = await (await caches.open(CACHE)).match(url.href);
    return cached ?? fetch(event.request);
  })());
});
self.addEventListener("message", (event) => {
  if (event.data?.type !== "iphone-demo-cache-status" || !event.ports[0]) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const ready = (await Promise.all(urls.map((url) => cache.match(url)))).every(Boolean);
    event.ports[0].postMessage({ ready, version: VERSION, refreshProtocol: 1 });
  })());
});
