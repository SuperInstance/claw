/**
 * Spreadsheet Moment - Performance Optimization Examples
 *
 * Round 16: Usage examples for the performance optimization suite
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import {
  CodeSplitter,
  BundleOptimizer,
  CacheManager,
  ImageOptimizer,
  PerformanceMonitor,
  MemoryLeakDetector,
  PerformanceProfiler,
  initPerformanceOptimization,
  type OptimizationConfig,
  type PerformanceBudget,
} from './PerformanceOptimizer';
import { bundleAnalyzer } from './bundle-analyzer';
import { performanceMonitoring, initMonitoring, type MonitoringConfig } from './monitoring';

/**
 * Example 1: Basic Performance Optimization Setup
 */
export async function example1_BasicSetup() {
  console.log('=== Example 1: Basic Performance Optimization Setup ===');

  // Define optimization configuration
  const config: OptimizationConfig = {
    codeSplitting: true,
    treeShaking: true,
    minification: true,
    compression: true,
    cacheStrategies: {
      '/api/': 'network-first',
      '/images/': 'cache-first',
      '/static/': 'cache-first',
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
      cssSize: 50,
      imageSize: 200,
      maxRequests: 20,
      maxLoadTime: 3000,
      maxTti: 3500,
      maxLcp: 2500,
    },
  };

  // Initialize performance optimization
  const optimizers = initPerformanceOptimization(config);

  console.log('Performance optimization initialized:', Object.keys(optimizers));

  return optimizers;
}

/**
 * Example 2: Code Splitting with Dynamic Imports
 */
export async function example2_CodeSplitting() {
  console.log('=== Example 2: Code Splitting with Dynamic Imports ===');

  const codeSplitter = new CodeSplitter();

  // Dynamically import a module
  const heavyModule = await codeSplitter.loadChunk('heavy-module', () =>
    import('./heavy-module').then((m) => m.default)
  );

  console.log('Loaded module:', heavyModule);

  // Preload chunks for faster navigation
  await codeSplitter.preloadChunks(['dashboard', 'settings', 'profile']);

  console.log('Preloaded chunks:', codeSplitter.getLoadedChunks());

  // Clear chunks when needed (e.g., logout)
  codeSplitter.clearChunks();

  return codeSplitter;
}

/**
 * Example 3: Cache Management
 */
export async function example3_CacheManagement() {
  console.log('=== Example 3: Cache Management ===');

  const cacheManager = new CacheManager({
    '/api/': 'network-first',
    '/images/': 'cache-first',
    '/static/': 'cache-first',
  });

  // Register service worker
  const registered = await cacheManager.registerServiceWorker();
  console.log('Service worker registered:', registered);

  // Cache specific resources
  await cacheManager.cacheResource('https://example.com/api/data', 'network-first');
  await cacheManager.cacheResource('https://example.com/images/logo.png', 'cache-first');

  console.log('Resources cached successfully');

  // Update cache with new version
  await cacheManager.updateCache();

  console.log('Cache updated');

  return cacheManager;
}

/**
 * Example 4: Image Optimization
 */
export async function example4_ImageOptimization() {
  console.log('=== Example 4: Image Optimization ===');

  const imageOptimizer = new ImageOptimizer({
    enabled: true,
    formats: ['webp', 'avif'],
    lazyLoad: true,
    responsive: true,
  });

  // Get optimal format for current browser
  const optimalFormat = imageOptimizer.getOptimalFormat();
  console.log('Optimal format:', optimalFormat);

  // Generate responsive srcset
  const baseUrl = 'https://example.com/images/hero.jpg';
  const srcset = imageOptimizer.generateResponsiveSrcSet(baseUrl, [320, 640, 960, 1280]);
  console.log('Responsive srcset:', srcset);

  // Generate LQIP
  const lqip = await imageOptimizer.generateLQIP(baseUrl);
  console.log('LQIP generated:', lqip.substring(0, 50) + '...');

  return imageOptimizer;
}

/**
 * Example 5: Performance Monitoring
 */
export async function example5_PerformanceMonitoring() {
  console.log('=== Example 5: Performance Monitoring ===');

  const monitor = new PerformanceMonitor();

  // Start monitoring Core Web Vitals
  monitor.startMonitoring();

  console.log('Monitoring started');

  // Record custom metric
  monitor.recordMetric('custom-operation', 123);

  // Get metric statistics
  const stats = monitor.getMetricStats('custom-operation');
  console.log('Metric stats:', stats);

  // Get current metrics
  const metrics = monitor.getCurrentMetrics();
  console.log('Current metrics:', metrics);

  // Check performance budget
  const budget: PerformanceBudget = {
    bundleSize: 250,
    initialJs: 150,
    cssSize: 50,
    imageSize: 200,
    maxRequests: 20,
    maxLoadTime: 3000,
    maxTti: 3500,
    maxLcp: 2500,
  };

  const budgetCheck = monitor.checkBudget(budget);
  console.log('Budget check:', budgetCheck);

  // Stop monitoring when done
  monitor.stopMonitoring();

  return monitor;
}

/**
 * Example 6: Memory Leak Detection
 */
export async function example6_MemoryLeakDetection() {
  console.log('=== Example 6: Memory Leak Detection ===');

  const detector = new MemoryLeakDetector();

  // Start monitoring memory usage
  detector.startMonitoring(5000);

  console.log('Memory monitoring started');

  // Get current memory usage
  const usage = detector.getCurrentUsage();
  console.log('Memory usage:', usage);

  // Wait for some measurements
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Check current usage again
  const usage2 = detector.getCurrentUsage();
  console.log('Memory usage after 10s:', usage2);

  // Stop monitoring
  detector.stopMonitoring();

  return detector;
}

/**
 * Example 7: Performance Profiling
 */
export async function example7_PerformanceProfiling() {
  console.log('=== Example 7: Performance Profiling ===');

  const profiler = new PerformanceProfiler();

  // Mark start of operation
  profiler.mark('operation-start');

  // Simulate some work
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mark end of operation
  profiler.mark('operation-end');

  // Measure duration
  const duration = profiler.measure('operation', 'operation-start', 'operation-end');
  console.log('Operation duration:', duration, 'ms');

  // Get measurement statistics
  const stats = profiler.getMeasureStats('operation');
  console.log('Measurement stats:', stats);

  // Clear marks and measures
  profiler.clear();

  return profiler;
}

/**
 * Example 8: Bundle Analysis
 */
export async function example8_BundleAnalysis() {
  console.log('=== Example 8: Bundle Analysis ===');

  // Analyze bundle
  const analysis = await bundleAnalyzer.analyzeBundle();

  console.log('Bundle size:', analysis.totalSizeKB.toFixed(2), 'KB');
  console.log('Module count:', analysis.moduleCount);
  console.log('Chunk count:', analysis.chunkCount);

  console.log('\nLargest modules:');
  analysis.largestModules.slice(0, 5).forEach((module) => {
    console.log(`  ${module.name}: ${module.size} bytes (${module.percentage.toFixed(1)}%)`);
  });

  console.log('\nOptimization suggestions:');
  analysis.suggestions.slice(0, 3).forEach((suggestion) => {
    console.log(`  [${suggestion.priority}] ${suggestion.title}`);
    console.log(`    Estimated savings: ${(suggestion.estimatedSavings / 1024).toFixed(2)} KB`);
  });

  // Calculate potential savings
  const savings = bundleAnalyzer.calculatePotentialSavings(analysis);
  console.log('\nPotential savings:', {
    codeSplitting: (savings.codeSplitting / 1024).toFixed(2) + ' KB',
    treeShaking: (savings.treeShaking / 1024).toFixed(2) + ' KB',
    compression: (savings.compression / 1024).toFixed(2) + ' KB',
    total: (savings.total / 1024).toFixed(2) + ' KB',
  });

  return analysis;
}

/**
 * Example 9: Advanced Monitoring with Alerts
 */
export async function example9_AdvancedMonitoring() {
  console.log('=== Example 9: Advanced Monitoring with Alerts ===');

  const config: MonitoringConfig = {
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
    reportInterval: 30000,
  };

  const monitoring = initMonitoring(config);

  // Set up alert callback
  monitoring.onAlert((alert) => {
    console.log(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`);
    console.log(`  Value: ${alert.value.toFixed(2)}ms, Threshold: ${alert.threshold}ms`);
  });

  // Record custom metrics
  monitoring.recordCustomMetric('page-load', 1200, 'ms');
  monitoring.recordCustomMetric('api-response', 350, 'ms');

  // Get current vitals
  const vitals = monitoring.getVitals();
  console.log('Current vitals:', vitals);

  // Get metric statistics
  const lcpStats = monitoring.getMetricStats('lcp');
  console.log('LCP statistics:', lcpStats);

  // Get alerts
  const alerts = monitoring.getAlerts();
  console.log('Alerts:', alerts);

  // Generate report
  const report = monitoring.generateReport();
  console.log('Monitoring report:', report);

  return monitoring;
}

/**
 * Example 10: Complete Performance Optimization Workflow
 */
export async function example10_CompleteWorkflow() {
  console.log('=== Example 10: Complete Performance Optimization Workflow ===');

  // 1. Initialize monitoring
  const monitoring = initMonitoring({
    enabled: true,
    reportToAnalytics: false,
    thresholds: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      ttfb: 600,
    },
  });

  console.log('Step 1: Monitoring initialized');

  // 2. Analyze current bundle
  const analysis = await bundleAnalyzer.analyzeBundle();
  console.log(`Step 2: Bundle analyzed - ${analysis.totalSizeKB.toFixed(2)} KB`);

  // 3. Initialize optimization
  const config: OptimizationConfig = {
    codeSplitting: true,
    treeShaking: true,
    minification: true,
    compression: true,
    cacheStrategies: {
      '/api/': 'network-first',
      '/images/': 'cache-first',
      '/static/': 'cache-first',
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
      cssSize: 50,
      imageSize: 200,
      maxRequests: 20,
      maxLoadTime: 3000,
      maxTti: 3500,
      maxLcp: 2500,
    },
  };

  const optimizers = initPerformanceOptimization(config);
  console.log('Step 3: Optimization initialized');

  // 4. Profile critical operations
  const profiler = optimizers.performanceProfiler;
  profiler.mark('workflow-start');

  // 5. Preload critical chunks
  await optimizers.codeSplitter.preloadChunks(['home', 'main']);
  console.log('Step 5: Critical chunks preloaded');

  // 6. Set up caching
  await optimizers.cacheManager.registerServiceWorker();
  console.log('Step 6: Service worker registered');

  profiler.mark('workflow-end');
  const duration = profiler.measure('complete-workflow', 'workflow-start', 'workflow-end');
  console.log(`Step 7: Workflow completed in ${duration?.toFixed(2)}ms`);

  // 8. Get final metrics
  const vitals = monitoring.getVitals();
  console.log('Step 8: Final performance score:', vitals.score);

  return {
    monitoring,
    analysis,
    optimizers,
    vitals,
  };
}

/**
 * Example 11: Testing Performance Budgets
 */
export async function example11_PerformanceBudgets() {
  console.log('=== Example 11: Testing Performance Budgets ===');

  const monitor = new PerformanceMonitor();
  monitor.startMonitoring();

  // Define different budget scenarios
  const budgets: Record<string, PerformanceBudget> = {
    strict: {
      bundleSize: 150,
      initialJs: 100,
      cssSize: 30,
      imageSize: 100,
      maxRequests: 15,
      maxLoadTime: 2000,
      maxTti: 2500,
      maxLcp: 2000,
    },
    moderate: {
      bundleSize: 250,
      initialJs: 150,
      cssSize: 50,
      imageSize: 200,
      maxRequests: 20,
      maxLoadTime: 3000,
      maxTti: 3500,
      maxLcp: 2500,
    },
    lenient: {
      bundleSize: 500,
      initialJs: 300,
      cssSize: 100,
      imageSize: 400,
      maxRequests: 30,
      maxLoadTime: 5000,
      maxTti: 6000,
      maxLcp: 4000,
    },
  };

  // Test each budget
  for (const [name, budget] of Object.entries(budgets)) {
    const result = monitor.checkBudget(budget);
    console.log(`${name} budget:`, result.passed ? 'PASSED' : 'FAILED');
    if (!result.passed) {
      result.violations.forEach((violation) => {
        console.log(`  - ${violation}`);
      });
    }
  }

  monitor.stopMonitoring();

  return budgets;
}

/**
 * Example 12: Memory Leak Detection in Action
 */
export async function example12_MemoryLeakDetection() {
  console.log('=== Example 12: Memory Leak Detection in Action ===');

  const detector = new MemoryLeakDetector();
  detector.startMonitoring(2000);

  // Simulate memory leak
  const leakyData: any[] = [];
  const interval = setInterval(() => {
    // Add data that won't be cleaned up
    for (let i = 0; i < 1000; i++) {
      leakyData.push({ data: 'leak ' + i });
    }
    console.log('Memory usage:', detector.getCurrentUsage());
  }, 3000);

  // Let it run for 15 seconds
  await new Promise((resolve) => setTimeout(resolve, 15000));

  // Clean up
  clearInterval(interval);
  detector.stopMonitoring();
  leakyData.length = 0;

  console.log('Memory leak detection completed');

  return detector;
}

/**
 * Export all examples
 */
export const examples = {
  basicSetup: example1_BasicSetup,
  codeSplitting: example2_CodeSplitting,
  cacheManagement: example3_CacheManagement,
  imageOptimization: example4_ImageOptimization,
  performanceMonitoring: example5_PerformanceMonitoring,
  memoryLeakDetection: example6_MemoryLeakDetection,
  performanceProfiling: example7_PerformanceProfiling,
  bundleAnalysis: example8_BundleAnalysis,
  advancedMonitoring: example9_AdvancedMonitoring,
  completeWorkflow: example10_CompleteWorkflow,
  performanceBudgets: example11_PerformanceBudgets,
  memoryLeakInAction: example12_MemoryLeakDetection,
};

/**
 * Run all examples sequentially
 */
export async function runAllExamples() {
  console.log('Running all performance optimization examples...\n');

  for (const [name, example] of Object.entries(examples)) {
    try {
      await example();
      console.log(`\n✓ ${name} completed\n`);
    } catch (error) {
      console.error(`\n✗ ${name} failed:`, error);
    }
  }

  console.log('All examples completed!');
}
