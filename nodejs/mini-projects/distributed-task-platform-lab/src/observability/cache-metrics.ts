import { cacheHitCounter, cacheInvalidationCounter, cacheMissCounter } from "./metrics.js";

export function recordCacheHit(cacheName: string): void {
  cacheHitCounter.inc({ cache_name: cacheName });
}

export function recordCacheMiss(cacheName: string): void {
  cacheMissCounter.inc({ cache_name: cacheName });
}

export function recordCacheInvalidation(cacheName: string): void {
  cacheInvalidationCounter.inc({ cache_name: cacheName });
}
