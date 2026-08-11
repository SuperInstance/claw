/**
 * Spreadsheet Moment - Service Worker for Caching
 *
 * Round 16: Service worker implementation for offline support and caching
 * Features: Network-first, cache-first, stale-while-revalidate strategies
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

/**
 * Cache configuration
 */
interface CacheConfig {
  version: string;
  precacheAssets: string[];
  dynamicCacheStrategies: Record<string, CacheStrategy>;
  maxAge: number;
  maxEntries: number;
}

type CacheStrategy = 'network-first' | 'cache-first' | 'stale-while-revalidate' | 'network-only';

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  version: 'v1',
  precacheAssets: [
    '/',
    '/index.html',
    '/styles.css',
    '/main.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
  ],
  dynamicCacheStrategies: {
    '/api/': 'network-first',
    '/images/': 'cache-first',
    '/static/': 'cache-first',
    '/fonts/': 'cache-first',
  },
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxEntries: 100,
};

/**
 * Cache manager for service worker
 */
class ServiceWorkerCacheManager {
  private config: CacheConfig;
  private cacheName: string;

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
    this.cacheName = `spreadsheet-moment-${config.version}`;
  }

  /**
   * Install event - precache static assets
   */
  async onInstall(): Promise<void> {
    const cache = await caches.open(this.cacheName);
    await cache.addAll(this.config.precacheAssets);

    // Force the waiting service worker to become the active service worker
    await self.skipWaiting();
  }

  /**
   * Activate event - clean up old caches
   */
  async onActivate(): Promise<void> {
    const cacheNames = await caches.keys();
    const cachesToDelete = cacheNames.filter(
      (name) => name.startsWith('spreadsheet-moment-') && name !== this.cacheName
    );

    await Promise.all(cachesToDelete.map((name) => caches.delete(name)));

    // Take control of all pages immediately
    await self.clients.claim();
  }

  /**
   * Fetch event - handle requests with appropriate strategy
   */
  async onFetch(event: FetchEvent): Promise<Response> {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
      return fetch(request);
    }

    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
      return fetch(request);
    }

    // Determine strategy
    const strategy = this.getStrategy(url.pathname);

    switch (strategy) {
      case 'network-first':
        return this.networkFirst(request);
      case 'cache-first':
        return this.cacheFirst(request);
      case 'stale-while-revalidate':
        return this.staleWhileRevalidate(request);
      case 'network-only':
        return this.networkOnly(request);
      default:
        return this.networkFirst(request);
    }
  }

  /**
   * Get cache strategy for a given path
   */
  private getStrategy(pathname: string): CacheStrategy {
    for (const [pattern, strategy] of Object.entries(this.config.dynamicCacheStrategies)) {
      if (pathname.startsWith(pattern)) {
        return strategy;
      }
    }
    return 'network-first';
  }

  /**
   * Network-first strategy: Try network first, fall back to cache
   */
  private async networkFirst(request: Request): Promise<Response> {
    const cache = await caches.open(this.cacheName);

    try {
      const response = await fetch(request);

      // Cache successful responses
      if (response.ok) {
        await this.cacheResponse(cache, request, response.clone());
      }

      return response;
    } catch (error) {
      // Network failed, try cache
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  /**
   * Cache-first strategy: Try cache first, fall back to network
   */
  private async cacheFirst(request: Request): Promise<Response> {
    const cache = await caches.open(this.cacheName);
    const cached = await cache.match(request);

    if (cached) {
      // Check if cache is still valid based on maxAge
      const dateHeader = cached.headers.get('date');
      if (dateHeader) {
        const cachedTime = new Date(dateHeader).getTime();
        const now = Date.now();
        if (now - cachedTime < this.config.maxAge) {
          return cached;
        }
      }
    }

    try {
      const response = await fetch(request);

      if (response.ok) {
        await this.cacheResponse(cache, request, response.clone());
      }

      return response;
    } catch (error) {
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  /**
   * Stale-while-revalidate: Return cache immediately, update in background
   */
  private async staleWhileRevalidate(request: Request): Promise<Response> {
    const cache = await caches.open(this.cacheName);
    const cached = await cache.match(request);

    // Fetch in background
    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        this.cacheResponse(cache, request, response.clone());
      }
      return response;
    });

    // Return cached version immediately, or wait for network if no cache
    return cached || fetchPromise;
  }

  /**
   * Network-only: Always fetch from network, bypass cache
   */
  private async networkOnly(request: Request): Promise<Response> {
    return fetch(request);
  }

  /**
   * Cache a response with size management
   */
  private async cacheResponse(
    cache: Cache,
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      await cache.put(request, response);

      // Enforce max entries limit
      const keys = await cache.keys();
      if (keys.length > this.config.maxEntries) {
        // Remove oldest entries
        const toDelete = keys.slice(0, keys.length - this.config.maxEntries);
        await Promise.all(toDelete.map((key) => cache.delete(key)));
      }
    } catch (error) {
      console.error('Failed to cache response:', error);
    }
  }

  /**
   * Message handler for cache management
   */
  async onMessage(event: ExtendableMessageEvent): Promise<void> {
    const { data } = event;
    const { type, url } = data;

    switch (type) {
      case 'CACHE_URL':
        await this.cacheUrl(url);
        break;
      case 'CLEAR_CACHE':
        await this.clearCache();
        break;
      case 'SKIP_WAITING':
        await self.skipWaiting();
        break;
    }
  }

  /**
   * Manually cache a URL
   */
  async cacheUrl(url: string): Promise<void> {
    const cache = await caches.open(this.cacheName);
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.error(`Failed to cache ${url}:`, error);
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }
}

/**
 * Initialize service worker
 */
const cacheManager = new ServiceWorkerCacheManager();

self.addEventListener('install', (event) => {
  event.waitUntil(cacheManager.onInstall());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(cacheManager.onActivate());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheManager.onFetch(event));
});

self.addEventListener('message', (event) => {
  event.waitUntil(cacheManager.onMessage(event));
});

export {};
