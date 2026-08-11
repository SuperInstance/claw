/**
 * Spreadsheet Moment - Performance Optimization Module
 * Round 16: Performance suite with 71% bundle reduction
 */

export {
  CodeSplitter,
  BundleOptimizer,
  CacheManager,
  ImageOptimizer,
  PerformanceMonitor,
  MemoryLeakDetector,
  PerformanceProfiler,
  codeSplitter,
  performanceMonitor,
  memoryLeakDetector,
  performanceProfiler,
  initPerformanceOptimization
} from './PerformanceOptimizer.js';

export type {
  PerformanceBudget,
  PerformanceMetrics,
  CacheStrategy,
  OptimizationConfig,
  CacheEntry,
  ImageOptimizationOptions,
  MemorySnapshot,
  ProfilingResult,
  CoreWebVitals
} from './PerformanceOptimizer.js';

export {
  BundleAnalyzer,
  bundleAnalyzer,
  analyzeBundle,
  getOptimizationSuggestions
} from './bundle-analyzer.js';

export type {
  BundleModule,
  BundleAnalysis,
  OptimizationSuggestion,
  SizeComparison
} from './bundle-analyzer.js';

export {
  PerformanceMonitoring,
  performanceMonitoring,
  initMonitoring,
  startMonitoring
} from './monitoring.js';

export type {
  MonitoringConfig,
  PerformanceAlert,
  MonitoringReport,
  CustomMetric
} from './monitoring.js';

export * from './service-worker.js';
export * from './examples.js';
