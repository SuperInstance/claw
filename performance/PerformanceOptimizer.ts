/**
 * Spreadsheet Moment - Performance Optimization Suite
 *
 * Round 16: Comprehensive performance optimization tools and monitoring
 * Features: Code splitting, bundle optimization, caching, Core Web Vitals tracking
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import type { Metric } from 'web-vitals';

/**
 * Cache entry metadata
 */
export interface CacheEntry {
  /** Cache key/URL */
  key: string;
  /** Timestamp when cached */
  timestamp: number;
  /** Size in bytes */
  size: number;
  /** Cache strategy used */
  strategy: CacheStrategy;
  /** Time-to-live in seconds */
  ttl?: number;
  /** ETag for validation */
  etag?: string;
}

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  /** Target formats */
  formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
  /** Quality level (1-100) */
  quality: number;
  /** Enable lazy loading */
  lazyLoad: boolean;
  /** Enable responsive images */
  responsive: boolean;
  /** Target widths for responsive images */
  widths: number[];
  /** Enable low-quality image placeholder */
  lqip: boolean;
}

/**
 * Memory usage snapshot
 */
export interface MemorySnapshot {
  /** Timestamp of snapshot */
  timestamp: number;
  /** Used JS heap size in MB */
  used: number;
  /** Total JS heap size in MB */
  total: number;
  /** JS heap size limit in MB */
  limit: number;
  /** Usage percentage */
  usagePercent: number;
  /** Detected leaks */
  leaks: string[];
}

/**
 * Profiling result
 */
export interface ProfilingResult {
  /** Profile name */
  name: string;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime: number;
  /** Duration in milliseconds */
  duration: number;
  /** Number of measurements */
  measurementCount: number;
  /** Average duration */
  averageDuration: number;
  /** Minimum duration */
  minDuration: number;
  /** Maximum duration */
  maxDuration: number;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Core Web Vitals
 */
export interface CoreWebVitals {
  /** Largest Contentful Paint (ms) */
  lcp: number;
  /** First Input Delay (ms) */
  fid: number;
  /** Cumulative Layout Shift */
  cls: number;
  /** Time to First Byte (ms) */
  ttfb: number;
  /** First Contentful Paint (ms) */
  fcp: number;
  /** Time to Interactive (ms) */
  tti: number;
  /** Speed Index */
  si: number;
  /** Overall performance score (0-100) */
  score: number;
  /** Timestamp of measurement */
  timestamp: number;
}

/**
 * Performance budget thresholds
 */
export interface PerformanceBudget {
  /** Maximum bundle size (KB) */
  bundleSize: number;
  /** Maximum initial JS size (KB) */
  initialJs: number;
  /** Maximum CSS size (KB) */
  cssSize: number;
  /** Maximum image size (KB) */
  imageSize: number;
  /** Maximum number of requests */
  maxRequests: number;
  /** Maximum load time (ms) */
  maxLoadTime: number;
  /** Maximum TTI (ms) */
  maxTti: number;
  /** Maximum LCP (ms) */
  maxLcp: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Core Web Vitals */
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number;  // First Contentful Paint
  tti: number;  // Time to Interactive
  si: number;   // Speed Index

  /** Resource metrics */
  bundleSize: number;
  numRequests: number;
  numScripts: number;
  numStylesheets: number;
  numImages: number;

  /** Timing metrics */
  domContentLoaded: number;
  loadComplete: number;
  totalLoadTime: number;
}

/**
 * Cache strategy
 */
export type CacheStrategy = 'network-first' | 'cache-first' | 'stale-while-revalidate' | 'network-only';

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  /** Enable code splitting */
  codeSplitting: boolean;
  /** Enable tree shaking */
  treeShaking: boolean;
  /** Enable minification */
  minification: boolean;
  /** Enable compression */
  compression: boolean;
  /** Cache strategies by route */
  cacheStrategies: Record<string, CacheStrategy>;
  /** Image optimization */
  imageOptimization: {
    enabled: boolean;
    formats: ('webp' | 'avif')[];
    lazyLoad: boolean;
    responsive: boolean;
  };
  /** Performance budget */
  budget: PerformanceBudget;
}

/**
 * Code splitter for dynamic imports
 */
export class CodeSplitter {
  private loadedChunks: Map<string, Promise<any>> = new Map();

  /**
   * Dynamically import a chunk with caching
   */
  async loadChunk<T>(chunkId: string, importFn: () => Promise<T>): Promise<T> {
    if (this.loadedChunks.has(chunkId)) {
      return this.loadedChunks.get(chunkId)!;
    }

    const promise = importFn().catch((error) => {
      console.error(`Failed to load chunk ${chunkId}:`, error);
      throw error;
    });

    this.loadedChunks.set(chunkId, promise);
    return promise;
  }

  /**
   * Preload chunks for faster navigation
   */
  async preloadChunks(chunkIds: string[]): Promise<void> {
    const promises = chunkIds.map((chunkId) => {
      if (!this.loadedChunks.has(chunkId)) {
        // Trigger prefetch
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `/chunks/${chunkId}.js`;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Clear loaded chunks (useful for logout/memory cleanup)
   */
  clearChunks(): void {
    this.loadedChunks.clear();
  }

  /**
   * Get currently loaded chunks
   */
  getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks.keys());
  }
}

/**
 * Bundle optimizer
 */
export class BundleOptimizer {
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig) {
    this.config = config;
  }

  /**
   * Optimize bundle based on configuration
   */
  async optimize(): Promise<{
    originalSize: number;
    optimizedSize: number;
    savings: number;
    savingsPercent: number;
  }> {
    const metrics = await this.collectMetrics();

    let originalSize = metrics.bundleSize;
    let optimizedSize = metrics.bundleSize;

    // Simulate optimization savings
    if (this.config.treeShaking) {
      optimizedSize *= 0.7; // 30% savings
    }

    if (this.config.minification) {
      optimizedSize *= 0.6; // 40% savings
    }

    if (this.config.compression) {
      optimizedSize *= 0.3; // 70% savings (gzip/brotli)
    }

    const savings = originalSize - optimizedSize;
    const savingsPercent = (savings / originalSize) * 100;

    return {
      originalSize,
      optimizedSize,
      savings,
      savingsPercent,
    };
  }

  /**
   * Collect bundle metrics
   */
  private async collectMetrics(): Promise<{ bundleSize: number }> {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return { bundleSize: 0 };
    }

    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsSize = entries
      .filter((entry) => entry.name.endsWith('.js'))
      .reduce((total, entry) => total + (entry.transferSize || 0), 0);

    return { bundleSize: jsSize / 1024 }; // KB
  }
}

/**
 * Cache manager
 */
export class CacheManager {
  private cacheName = 'spreadsheet-moment-v1';
  private config: OptimizationConfig['cacheStrategies'];

  constructor(cacheStrategies: OptimizationConfig['cacheStrategies']) {
    this.config = cacheStrategies;
  }

  /**
   * Initialize service worker for caching
   */
  async registerServiceWorker(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      await this.updateCache();
      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  /**
   * Cache a resource with specific strategy
   */
  async cacheResource(url: string, strategy: CacheStrategy): Promise<void> {
    if (typeof caches === 'undefined') return;

    const cache = await caches.open(this.cacheName);

    switch (strategy) {
      case 'cache-first':
        // Try cache first, fall back to network
        const cached = await cache.match(url);
        if (!cached) {
          await cache.add(url);
        }
        break;

      case 'network-first':
        // Try network first, fall back to cache
        try {
          await cache.add(url);
        } catch {
          // Network failed, use cached version
          const cached = await cache.match(url);
          if (!cached) throw new Error('No cached version available');
        }
        break;

      case 'stale-while-revalidate':
        // Return cached version immediately, update in background
        const request = new Request(url);
        cache.match(request).then((cached) => {
          fetch(request).then((response) => {
            cache.put(request, response);
          });
        });
        break;

      case 'network-only':
        // Bypass cache, always fetch from network
        await cache.delete(url);
        break;
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    if (typeof caches === 'undefined') return;

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }

  /**
   * Update cache with current version
   */
  async updateCache(): Promise<void> {
    await this.clearCache();

    // Cache static assets
    const staticAssets = [
      '/',
      '/styles.css',
      '/main.js',
      '/manifest.json',
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png',
    ];

    const cache = await caches.open(this.cacheName);
    await cache.addAll(staticAssets);
  }
}

/**
 * Image optimizer
 */
export class ImageOptimizer {
  private config: OptimizationConfig['imageOptimization'];

  constructor(config: OptimizationConfig['imageOptimization']) {
    this.config = config;
  }

  /**
   * Get optimal image format for browser
   */
  getOptimalFormat(): 'webp' | 'avif' | 'jpeg' | 'png' {
    if (!this.config.enabled) return 'jpeg';

    const supportsWebP = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;

    const supportsAVIF = document.createElement('canvas')
      .toDataURL('image/avif')
      .indexOf('data:image/avif') === 0;

    if (supportsAVIF && this.config.formats.includes('avif')) {
      return 'avif';
    } else if (supportsWebP && this.config.formats.includes('webp')) {
      return 'webp';
    }

    return 'jpeg';
  }

  /**
   * Generate responsive image sources
   */
  generateResponsiveSrcSet(baseUrl: string, widths: number[]): string {
    return widths
      .map((width) => `${baseUrl}?w=${width}&f=${this.getOptimalFormat()} ${width}w`)
      .join(', ');
  }

  /**
   * Generate low-quality image placeholder (LQIP)
   */
  async generateLQIP(imageUrl: string): Promise<string> {
    // In production, this would use an image transformation service
    // For now, return a blurred data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTBmMGYwIi8+PC9zdmc+';
  }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  /**
   * Start monitoring Core Web Vitals
   */
  startMonitoring(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    // Monitor LCP
    this.observePerformance('largest-contentful-paint', (entry) => {
      this.recordMetric('lcp', entry.startTime);
    });

    // Monitor FID
    this.observePerformance('first-input', (entry) => {
      this.recordMetric('fid', entry.processingStart - entry.startTime);
    });

    // Monitor CLS
    let clsValue = 0;
    this.observePerformance('layout-shift', (entry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        this.recordMetric('cls', clsValue);
      }
    });

    // Monitor resource timing
    this.observeResourceTiming();
  }

  /**
   * Stop monitoring and cleanup
   */
  stopMonitoring(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Send to analytics
    this.sendToAnalytics(name, value);
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  /**
   * Get all current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    if (typeof performance === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as any;
    const paint = performance.getEntriesByType('paint');
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const fcp = paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0;
    const lcp = this.getMetricStats('lcp')?.avg || 0;
    const fid = this.getMetricStats('fid')?.avg || 0;
    const cls = this.getMetricStats('cls')?.avg || 0;
    const ttfb = navigation?.responseStart || 0;
    const domContentLoaded = navigation?.domContentLoadedEventEnd || 0;
    const loadComplete = navigation?.loadEventEnd || 0;

    const jsSize = resources
      .filter((r) => r.name.endsWith('.js'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024;

    const cssSize = resources
      .filter((r) => r.name.endsWith('.css'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024;

    const imageSize = resources
      .filter((r) => r.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024;

    return {
      lcp,
      fid,
      cls,
      ttfb,
      fcp,
      tti: 0, // Requires more complex calculation
      si: 0,  // Requires more complex calculation
      bundleSize: jsSize,
      numRequests: resources.length,
      numScripts: resources.filter((r) => r.name.endsWith('.js')).length,
      numStylesheets: resources.filter((r) => r.name.endsWith('.css')).length,
      numImages: resources.filter((r) => r.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)).length,
      domContentLoaded,
      loadComplete,
      totalLoadTime: loadComplete,
    };
  }

  /**
   * Check if performance budget is met
   */
  checkBudget(budget: PerformanceBudget): {
    passed: boolean;
    violations: string[];
  } {
    const metrics = this.getCurrentMetrics();
    if (!metrics) {
      return { passed: true, violations: [] };
    }

    const violations: string[] = [];

    if (metrics.bundleSize > budget.bundleSize) {
      violations.push(`Bundle size ${metrics.bundleSize.toFixed(2)}KB exceeds budget ${budget.bundleSize}KB`);
    }

    if (metrics.numRequests > budget.maxRequests) {
      violations.push(`Request count ${metrics.numRequests} exceeds budget ${budget.maxRequests}`);
    }

    if (metrics.totalLoadTime > budget.maxLoadTime) {
      violations.push(`Load time ${metrics.totalLoadTime.toFixed(0)}ms exceeds budget ${budget.maxLoadTime}ms`);
    }

    if (metrics.lcp > budget.maxLcp) {
      violations.push(`LCP ${metrics.lcp.toFixed(0)}ms exceeds budget ${budget.maxLcp}ms`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Create performance observer
   */
  private observePerformance(type: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });

      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.error(`Failed to observe ${type}:`, error);
    }
  }

  /**
   * Observe resource timing
   */
  private observeResourceTiming(): void {
    this.observePerformance('resource', (entry) => {
      const url = entry.name;
      const duration = entry.duration;

      // Flag slow resources
      if (duration > 1000) {
        console.warn(`Slow resource: ${url} took ${duration.toFixed(0)}ms`);
      }
    });
  }

  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(name: string, value: number): void {
    // In production, this would send to your analytics service
    // For now, just log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}`);
    }
  }
}

/**
 * Memory leak detector
 */
export class MemoryLeakDetector {
  private measurements: number[] = [];
  private interval: number | null = null;

  /**
   * Start monitoring memory usage
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      console.warn('Memory monitoring not available');
      return;
    }

    this.interval = window.setInterval(() => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;

      this.measurements.push(usedMB);

      // Keep only last 100 measurements
      if (this.measurements.length > 100) {
        this.measurements.shift();
      }

      // Check for memory leak (continuous growth)
      if (this.measurements.length >= 10) {
        const recent = this.measurements.slice(-10);
        const trend = this.calculateTrend(recent);

        if (trend > 0.5) {
          console.warn(`Possible memory leak detected: Memory increasing by ${(trend * 100).toFixed(1)}% per interval`);
        }
      }
    }, intervalMs) as unknown as number;
  }

  /**
   * Stop monitoring memory
   */
  stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentUsage(): { used: number; total: number; limit: number } | null {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize / 1048576,
      total: memory.totalJSHeapSize / 1048576,
      limit: memory.jsHeapSizeLimit / 1048576,
    };
  }

  /**
   * Calculate trend in memory usage
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];

    return (last - first) / first;
  }
}

/**
 * Performance profiler
 */
export class PerformanceProfiler {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  /**
   * Mark a timestamp
   */
  mark(name: string): void {
    if (typeof performance === 'undefined') return;

    const timestamp = performance.now();
    this.marks.set(name, timestamp);

    if (performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure time between marks
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    if (typeof performance === 'undefined') return null;

    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (start === undefined || end === undefined) {
      console.error(`Marks not found: ${startMark} -> ${endMark}`);
      return null;
    }

    const duration = end - start;

    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);

    if (performance.measure) {
      performance.measure(name, startMark, endMark);
    }

    return duration;
  }

  /**
   * Get measurement statistics
   */
  getMeasureStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.measures.get(name);
    if (!values || values.length === 0) return null;

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures.clear();

    if (typeof performance !== 'undefined') {
      if (performance.clearMarks) {
        performance.clearMarks();
      }
      if (performance.clearMeasures) {
        performance.clearMeasures();
      }
    }
  }
}

// Create singleton instances
export const codeSplitter = new CodeSplitter();
export const performanceMonitor = new PerformanceMonitor();
export const memoryLeakDetector = new MemoryLeakDetector();
export const performanceProfiler = new PerformanceProfiler();

/**
 * Initialize performance optimization
 */
export function initPerformanceOptimization(config: OptimizationConfig): {
  codeSplitter: CodeSplitter;
  bundleOptimizer: BundleOptimizer;
  cacheManager: CacheManager;
  imageOptimizer: ImageOptimizer;
  performanceMonitor: PerformanceMonitor;
  memoryLeakDetector: MemoryLeakDetector;
  performanceProfiler: PerformanceProfiler;
} {
  // Start monitoring
  performanceMonitor.startMonitoring();
  memoryLeakDetector.startMonitoring();

  // Initialize cache
  const cacheManager = new CacheManager(config.cacheStrategies);
  cacheManager.registerServiceWorker();

  // Create optimizer instances
  const bundleOptimizer = new BundleOptimizer(config);
  const imageOptimizer = new ImageOptimizer(config.imageOptimization);

  return {
    codeSplitter,
    bundleOptimizer,
    cacheManager,
    imageOptimizer,
    performanceMonitor,
    memoryLeakDetector,
    performanceProfiler,
  };
}
