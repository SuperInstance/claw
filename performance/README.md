# Spreadsheet Moment - Performance Optimization Suite

**Round 16: Comprehensive performance optimization tools and monitoring**

MIT License - Copyright (c) 2026 SuperInstance Research Team

---

## Overview

The Performance Optimization Suite provides a complete set of tools for monitoring, analyzing, and optimizing web application performance. Built with TypeScript and designed for modern web applications, this suite helps you achieve optimal Core Web Vitals and maintain excellent user experience.

## Features

- **Code Splitting**: Dynamic imports and chunk preloading
- **Bundle Optimization**: Size analysis and optimization suggestions
- **Caching**: Service worker integration with multiple strategies
- **Image Optimization**: Automatic format selection and responsive images
- **Performance Monitoring**: Real-time Core Web Vitals tracking
- **Memory Leak Detection**: Proactive memory usage monitoring
- **Performance Profiling**: Custom marks and measures
- **Bundle Analysis**: Detailed module analysis and optimization recommendations

## Installation

```bash
npm install --save web-vitals
```

## Quick Start

```typescript
import { initPerformanceOptimization } from './performance/PerformanceOptimizer';

// Initialize with default configuration
const optimizers = initPerformanceOptimization({
  codeSplitting: true,
  treeShaking: true,
  minification: true,
  compression: true,
  cacheStrategies: {
    '/api/': 'network-first',
    '/images/': 'cache-first',
  },
  imageOptimization: {
    enabled: true,
    formats: ['webp', 'avif'],
    lazyLoad: true,
    responsive: true,
  },
  budget: {
    bundleSize: 250,
    initialJs: 150,
    maxLoadTime: 3000,
    maxLcp: 2500,
  },
});

// Performance monitoring starts automatically
```

## Core Components

### 1. CodeSplitter

Dynamic imports and chunk management.

```typescript
import { CodeSplitter } from './performance/PerformanceOptimizer';

const splitter = new CodeSplitter();

// Load a chunk dynamically
const module = await splitter.loadChunk('dashboard', () =>
  import('./pages/Dashboard')
);

// Preload chunks for faster navigation
await splitter.preloadChunks(['settings', 'profile']);

// Clear chunks when needed
splitter.clearChunks();
```

### 2. BundleOptimizer

Analyze and optimize bundle size.

```typescript
import { BundleOptimizer } from './performance/PerformanceOptimizer';

const optimizer = new BundleOptimizer(config);

// Optimize bundle
const result = await optimizer.optimize();
console.log(`Savings: ${result.savingsPercent.toFixed(1)}%`);
```

### 3. CacheManager

Service worker integration for caching.

```typescript
import { CacheManager } from './performance/PerformanceOptimizer';

const cacheManager = new CacheManager({
  '/api/': 'network-first',
  '/images/': 'cache-first',
});

// Register service worker
await cacheManager.registerServiceWorker();

// Cache specific resources
await cacheManager.cacheResource('/api/data', 'network-first');

// Update cache
await cacheManager.updateCache();
```

### 4. ImageOptimizer

Automatic image format selection and optimization.

```typescript
import { ImageOptimizer } from './performance/PerformanceOptimizer';

const optimizer = new ImageOptimizer({
  enabled: true,
  formats: ['webp', 'avif'],
  lazyLoad: true,
  responsive: true,
});

// Get optimal format
const format = optimizer.getOptimalFormat();

// Generate responsive srcset
const srcset = optimizer.generateResponsiveSrcSet('/image.jpg', [320, 640, 960]);
```

### 5. PerformanceMonitor

Real-time Core Web Vitals monitoring.

```typescript
import { PerformanceMonitor } from './performance/PerformanceOptimizer';

const monitor = new PerformanceMonitor();

// Start monitoring
monitor.startMonitoring();

// Get current metrics
const metrics = monitor.getCurrentMetrics();
console.log('LCP:', metrics.lcp);
console.log('FID:', metrics.fid);
console.log('CLS:', metrics.cls);

// Check performance budget
const budgetCheck = monitor.checkBudget(budget);
if (!budgetCheck.passed) {
  console.warn('Budget violations:', budgetCheck.violations);
}
```

### 6. MemoryLeakDetector

Monitor memory usage and detect leaks.

```typescript
import { MemoryLeakDetector } from './performance/PerformanceOptimizer';

const detector = new MemoryLeakDetector();

// Start monitoring
detector.startMonitoring(5000);

// Get current usage
const usage = detector.getCurrentUsage();
console.log('Memory:', usage.used, 'MB /', usage.limit, 'MB');
```

### 7. PerformanceProfiler

Custom performance profiling.

```typescript
import { PerformanceProfiler } from './performance/PerformanceOptimizer';

const profiler = new PerformanceProfiler();

// Mark timestamps
profiler.mark('operation-start');
// ... do work ...
profiler.mark('operation-end');

// Measure duration
const duration = profiler.measure('operation', 'operation-start', 'operation-end');

// Get statistics
const stats = profiler.getMeasureStats('operation');
```

## Advanced Features

### Bundle Analysis

```typescript
import { bundleAnalyzer } from './performance/bundle-analyzer';

const analysis = await bundleAnalyzer.analyzeBundle();

console.log('Bundle size:', analysis.totalSizeKB, 'KB');
console.log('Largest modules:', analysis.largestModules);
console.log('Suggestions:', analysis.suggestions);

// Calculate potential savings
const savings = bundleAnalyzer.calculatePotentialSavings(analysis);
console.log('Total savings:', savings.total / 1024, 'KB');
```

### Advanced Monitoring

```typescript
import { initMonitoring } from './performance/monitoring';

const monitoring = initMonitoring({
  enabled: true,
  sampleRate: 1.0,
  reportToAnalytics: true,
  analyticsEndpoint: 'https://analytics.example.com/performance',
  thresholds: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 600,
  },
});

// Set up alerts
monitoring.onAlert((alert) => {
  console.warn(`[ALERT] ${alert.message}`);
});

// Record custom metrics
monitoring.recordCustomMetric('page-load', 1200, 'ms');

// Get current vitals
const vitals = monitoring.getVitals();
console.log('Performance score:', vitals.score);
```

## Configuration

### OptimizationConfig

```typescript
interface OptimizationConfig {
  codeSplitting: boolean;          // Enable code splitting
  treeShaking: boolean;            // Enable tree shaking
  minification: boolean;           // Enable minification
  compression: boolean;            // Enable compression
  cacheStrategies: Record<string, CacheStrategy>;
  imageOptimization: {
    enabled: boolean;
    formats: ('webp' | 'avif')[];
    lazyLoad: boolean;
    responsive: boolean;
  };
  budget: PerformanceBudget;
}
```

### PerformanceBudget

```typescript
interface PerformanceBudget {
  bundleSize: number;    // Maximum bundle size (KB)
  initialJs: number;     // Maximum initial JS size (KB)
  cssSize: number;       // Maximum CSS size (KB)
  imageSize: number;     // Maximum image size (KB)
  maxRequests: number;   // Maximum number of requests
  maxLoadTime: number;   // Maximum load time (ms)
  maxTti: number;        // Maximum TTI (ms)
  maxLcp: number;        // Maximum LCP (ms)
}
```

### CacheStrategy

```typescript
type CacheStrategy =
  | 'network-first'      // Try network, fall back to cache
  | 'cache-first'        // Try cache, fall back to network
  | 'stale-while-revalidate'  // Return cache, update in background
  | 'network-only';      // Always fetch from network
```

## Examples

See `examples.ts` for comprehensive usage examples:

```typescript
import { examples } from './performance/examples';

// Run all examples
await examples.runAllExamples();

// Run specific example
await examples.basicSetup();
await examples.codeSplitting();
await examples.cacheManagement();
```

## Service Worker Setup

1. Build the service worker:

```bash
tsc performance/service-worker.ts --outDir public
```

2. Register in your application:

```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

## Performance Budgets

Define performance budgets to ensure your application stays within acceptable limits:

```typescript
const budget: PerformanceBudget = {
  bundleSize: 250,      // 250 KB max
  initialJs: 150,       // 150 KB initial JS
  maxLoadTime: 3000,    // 3 seconds max load time
  maxLcp: 2500,         // 2.5 seconds max LCP
};

const check = monitor.checkBudget(budget);
if (!check.passed) {
  console.error('Budget exceeded:', check.violations);
}
```

## Core Web Vitals

The suite automatically monitors Core Web Vitals:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## Best Practices

1. **Start monitoring early**: Initialize monitoring at application startup
2. **Set appropriate budgets**: Define budgets based on your target devices
3. **Use code splitting**: Split large bundles into smaller chunks
4. **Optimize images**: Use modern formats and responsive images
5. **Monitor memory**: Detect leaks early with regular monitoring
6. **Profile critical paths**: Use profiler for optimization hotspots

## API Reference

### Types

- `PerformanceBudget` - Budget thresholds
- `PerformanceMetrics` - Collected metrics
- `CacheStrategy` - Caching strategies
- `OptimizationConfig` - Configuration options
- `CacheEntry` - Cache metadata
- `ImageOptimizationOptions` - Image optimization config
- `MemorySnapshot` - Memory usage snapshot
- `ProfilingResult` - Profiling result
- `CoreWebVitals` - Core Web Vitals data

### Classes

- `CodeSplitter` - Dynamic imports and chunk management
- `BundleOptimizer` - Bundle size optimization
- `CacheManager` - Service worker caching
- `ImageOptimizer` - Image optimization
- `PerformanceMonitor` - Core Web Vitals monitoring
- `MemoryLeakDetector` - Memory leak detection
- `PerformanceProfiler` - Custom profiling

### Singletons

- `codeSplitter` - Default code splitter instance
- `performanceMonitor` - Default monitor instance
- `memoryLeakDetector` - Default detector instance
- `performanceProfiler` - Default profiler instance
- `bundleAnalyzer` - Default analyzer instance
- `performanceMonitoring` - Default monitoring instance

## License

MIT License - Copyright (c) 2026 SuperInstance Research Team

## Contributing

Contributions are welcome! Please ensure:

- All TypeScript types are properly exported
- No compilation errors
- Service worker is functional
- Bundle analysis is working
- Core Web Vitals are monitored
- Documentation is complete

## Support

For issues and questions, please refer to the main Spreadsheet Moment documentation.
