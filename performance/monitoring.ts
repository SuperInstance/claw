/**
 * Spreadsheet Moment - Performance Monitoring
 *
 * Round 16: Real-time performance monitoring and Core Web Vitals tracking
 * Features: CWV monitoring, performance scoring, alerting, analytics integration
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import type { Metric } from 'web-vitals';

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  /** Enable monitoring */
  enabled: boolean;
  /** Sample rate (0-1) */
  sampleRate: number;
  /** Report to analytics */
  reportToAnalytics: boolean;
  /** Analytics endpoint */
  analyticsEndpoint?: string;
  /** Alert thresholds */
  thresholds: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  /** Report interval in ms */
  reportInterval: number;
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  /** Alert type */
  type: 'lcp' | 'fid' | 'cls' | 'ttfb' | 'fcp' | 'custom';
  /** Severity level */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Alert message */
  message: string;
  /** Current value */
  value: number;
  /** Threshold value */
  threshold: number;
  /** Timestamp */
  timestamp: number;
  /** URL where alert occurred */
  url: string;
}

/**
 * Monitoring report
 */
export interface MonitoringReport {
  /** Report ID */
  id: string;
  /** Timestamp */
  timestamp: number;
  /** URL */
  url: string;
  /** Core Web Vitals */
  vitals: CoreWebVitals;
  /** Custom metrics */
  customMetrics: Map<string, number>;
  /** Alerts */
  alerts: PerformanceAlert[];
  /** Performance score */
  score: number;
}

/**
 * Core Web Vitals with additional metadata
 */
export interface CoreWebVitals {
  /** Largest Contentful Paint */
  lcp: number;
  /** First Input Delay */
  fid: number;
  /** Cumulative Layout Shift */
  cls: number;
  /** Time to First Byte */
  ttfb: number;
  /** First Contentful Paint */
  fcp: number;
  /** Time to Interactive */
  tti: number;
  /** Speed Index */
  si: number;
  /** Overall performance score (0-100) */
  score: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * Custom metric definition
 */
export interface CustomMetric {
  /** Metric name */
  name: string;
  /** Metric value */
  value: number;
  /** Metric unit */
  unit: string;
  /** Metric category */
  category: 'timing' | 'size' | 'count' | 'custom';
  /** Timestamp */
  timestamp: number;
}

/**
 * Performance Monitoring class
 */
export class PerformanceMonitoring {
  private config: MonitoringConfig;
  private vitals: Map<keyof CoreWebVitals, number> = new Map();
  private customMetrics: Map<string, number[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private reportInterval: number | null = null;
  private onAlertCallback?: (alert: PerformanceAlert) => void;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      reportToAnalytics: false,
      thresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 600,
      },
      reportInterval: 30000, // 30 seconds
      ...config,
    };
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (!this.config.enabled || typeof window === 'undefined') {
      return;
    }

    this.setupVitalsMonitoring();
    this.startReporting();

    if (this.config.reportToAnalytics && this.config.analyticsEndpoint) {
      this.scheduleReports();
    }
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
  }

  /**
   * Setup Core Web Vitals monitoring
   */
  private setupVitalsMonitoring(): void {
    if (!window.PerformanceObserver) {
      console.warn('PerformanceObserver not available');
      return;
    }

    // Monitor LCP
    this.observeMetric('largest-contentful-paint', (entry: any) => {
      this.recordVital('lcp', entry.startTime);
      this.checkThreshold('lcp', entry.startTime, this.config.thresholds.lcp);
    });

    // Monitor FID
    this.observeMetric('first-input', (entry: any) => {
      const fid = entry.processingStart - entry.startTime;
      this.recordVital('fid', fid);
      this.checkThreshold('fid', fid, this.config.thresholds.fid);
    });

    // Monitor CLS
    let clsValue = 0;
    this.observeMetric('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        this.recordVital('cls', clsValue);
        this.checkThreshold('cls', clsValue, this.config.thresholds.cls);
      }
    });

    // Monitor paint timing for FCP
    this.observeMetric('paint', (entry: any) => {
      if (entry.name === 'first-contentful-paint') {
        this.recordVital('fcp', entry.startTime);
      }
    });

    // Monitor resource timing for TTFB
    this.observeMetric('navigation', (entry: any) => {
      this.recordVital('ttfb', entry.responseStart);
    });
  }

  /**
   * Observe a performance metric
   */
  private observeMetric(type: string, callback: (entry: any) => void): void {
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
   * Record a vital
   */
  private recordVital(name: keyof CoreWebVitals, value: number): void {
    this.vitals.set(name, value);

    // Store in custom metrics for aggregation
    if (!this.customMetrics.has(name)) {
      this.customMetrics.set(name, []);
    }
    this.customMetrics.get(name)!.push(value);
  }

  /**
   * Record a custom metric
   */
  recordCustomMetric(name: string, value: number, unit: string = 'ms'): void {
    if (!this.customMetrics.has(name)) {
      this.customMetrics.set(name, []);
    }
    this.customMetrics.get(name)!.push(value);

    // Send to analytics if enabled
    if (this.config.reportToAnalytics && this.config.analyticsEndpoint) {
      this.sendMetricToAnalytics(name, value, unit);
    }
  }

  /**
   * Check threshold and create alert if needed
   */
  private checkThreshold(
    type: keyof CoreWebVitals,
    value: number,
    threshold: number
  ): void {
    if (value > threshold) {
      const severity = this.getSeverity(value, threshold);
      const alert: PerformanceAlert = {
        type,
        severity,
        message: `${type.toUpperCase()} exceeded threshold: ${value.toFixed(0)}ms > ${threshold}ms`,
        value,
        threshold,
        timestamp: Date.now(),
        url: window.location.href,
      };

      this.alerts.push(alert);
      this.triggerAlert(alert);
    }
  }

  /**
   * Get severity based on value and threshold
   */
  private getSeverity(value: number, threshold: number): PerformanceAlert['severity'] {
    const ratio = value / threshold;
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'error';
    if (ratio > 1.5) return 'warning';
    return 'info';
  }

  /**
   * Trigger alert callback
   */
  private triggerAlert(alert: PerformanceAlert): void {
    if (this.onAlertCallback) {
      this.onAlertCallback(alert);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Performance Alert] ${alert.message}`);
    }
  }

  /**
   * Set alert callback
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.onAlertCallback = callback;
  }

  /**
   * Get current Core Web Vitals
   */
  getVitals(): CoreWebVitals {
    const lcp = this.vitals.get('lcp') || 0;
    const fid = this.vitals.get('fid') || 0;
    const cls = this.vitals.get('cls') || 0;
    const ttfb = this.vitals.get('ttfb') || 0;
    const fcp = this.vitals.get('fcp') || 0;
    const tti = this.calculateTTI();
    const si = this.calculateSpeedIndex();

    return {
      lcp,
      fid,
      cls,
      ttfb,
      fcp,
      tti,
      si,
      score: this.calculateScore({ lcp, fid, cls, ttfb, fcp, tti, si, score: 0, timestamp: 0 }),
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate TTI (Time to Interactive)
   */
  private calculateTTI(): number {
    if (typeof performance === 'undefined') return 0;

    const nav = performance.getEntriesByType('navigation')[0] as any;
    if (!nav) return 0;

    // Simple TTI calculation: domContentLoadedEventEnd
    return nav.domContentLoadedEventEnd || 0;
  }

  /**
   * Calculate Speed Index (simplified)
   */
  private calculateSpeedIndex(): number {
    if (typeof performance === 'undefined') return 0;

    const fcp = this.vitals.get('fcp') || 0;
    const lcp = this.vitals.get('lcp') || 0;

    // Simplified speed index: average of FCP and LCP
    return (fcp + lcp) / 2;
  }

  /**
   * Calculate overall performance score
   */
  private calculateScore(vitals: CoreWebVitals): number {
    let score = 100;

    // LCP scoring (good < 2.5s, needs improvement < 4s, poor > 4s)
    if (vitals.lcp > 4000) score -= 30;
    else if (vitals.lcp > 2500) score -= 15;

    // FID scoring (good < 100ms, needs improvement < 300ms, poor > 300ms)
    if (vitals.fid > 300) score -= 25;
    else if (vitals.fid > 100) score -= 10;

    // CLS scoring (good < 0.1, needs improvement < 0.25, poor > 0.25)
    if (vitals.cls > 0.25) score -= 30;
    else if (vitals.cls > 0.1) score -= 15;

    // TTFB scoring (good < 600ms, needs improvement < 1000ms, poor > 1000ms)
    if (vitals.ttfb > 1000) score -= 15;
    else if (vitals.ttfb > 600) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.customMetrics.get(name);
    if (!values || values.length === 0) return null;

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  /**
   * Get all alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Generate monitoring report
   */
  generateReport(): MonitoringReport {
    const vitals = this.getVitals();
    const customMetrics = new Map<string, number>();

    this.customMetrics.forEach((values, name) => {
      if (values.length > 0) {
        customMetrics.set(name, values[values.length - 1]);
      }
    });

    return {
      id: `report-${Date.now()}`,
      timestamp: Date.now(),
      url: window.location.href,
      vitals,
      customMetrics,
      alerts: [...this.alerts],
      score: vitals.score,
    };
  }

  /**
   * Send metric to analytics
   */
  private sendMetricToAnalytics(name: string, value: number, unit: string): void {
    if (!this.config.analyticsEndpoint) return;

    // In production, this would send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${name}: ${value}${unit}`);
    }
  }

  /**
   * Schedule periodic reports
   */
  private scheduleReports(): void {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
    }

    this.reportInterval = window.setInterval(() => {
      const report = this.generateReport();
      this.sendReport(report);
    }, this.config.reportInterval);
  }

  /**
   * Send report to analytics
   */
  private sendReport(report: MonitoringReport): void {
    if (!this.config.analyticsEndpoint) return;

    // In production, this would send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance Report]', report);
    }
  }

  /**
   * Start reporting
   */
  private startReporting(): void {
    // Report vitals when they change
    const reportVitals = () => {
      const vitals = this.getVitals();
      if (vitals.score > 0) {
        this.sendMetricToAnalytics('performance-score', vitals.score, '');
      }
    };

    // Report immediately if vitals are available
    if (this.vitals.size > 0) {
      reportVitals();
    }
  }
}

/**
 * Create singleton instance
 */
export const performanceMonitoring = new PerformanceMonitoring();

/**
 * Initialize monitoring with config
 */
export function initMonitoring(config?: Partial<MonitoringConfig>): PerformanceMonitoring {
  const monitoring = new PerformanceMonitoring(config);
  monitoring.start();
  return monitoring;
}

/**
 * Quick start with default config
 */
export function startMonitoring(): void {
  performanceMonitoring.start();
}
