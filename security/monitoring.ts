/**
 * Spreadsheet Moment - Security Monitoring and Alerting
 * Round 17: OWASP Top 10 - Insufficient Logging & Monitoring
 *
 * Comprehensive security monitoring:
 * - Event logging and correlation
 * - Anomaly detection
 * - Real-time alerting
 * - Security metrics
 * - Audit trail
 * - Threat intelligence integration
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { EventEmitter } from 'events';

/**
 * Security event types
 */
export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  INJECTION_ATTACK = 'injection_attack',
  XSS_ATTACK = 'xss_attack',
  CSRF_ATTACK = 'csrf_attack',
  PATH_TRAVERSAL = 'path_traversal',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MALICIOUS_FILE = 'malicious_file',
  VULNERABILITY_DETECTED = 'vulnerability_detected',
  CONFIGURATION_ERROR = 'configuration_error',
  DATA_BREACH = 'data_breach',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SYSTEM_ERROR = 'system_error',
}

/**
 * Security event severity
 */
export enum SecuritySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

/**
 * Security event
 */
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  source: {
    ipAddress?: string;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
  };
  details: Record<string, any>;
  tags: string[];
  correlationId?: string;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  enabled: boolean;
  minSeverity: SecuritySeverity;
  channels: AlertChannel[];
  throttleMs?: number;
  cooldownMs?: number;
}

/**
 * Alert channels
 */
export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  config: Record<string, any>;
}

/**
 * Anomaly detection result
 */
export interface AnomalyResult {
  anomalous: boolean;
  score: number; // 0-100
  type: string;
  description: string;
  confidence: number; // 0-1
  metrics: Record<string, number>;
}

/**
 * Security metrics
 */
export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecuritySeverity, number>;
  eventsByHour: Record<number, number>;
  topSources: Array<{ ipAddress: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  blockedRequests: number;
  authenticationFailures: number;
  injectionAttempts: number;
  averageResponseTime: number;
}

/**
 * Monitoring statistics
 */
export interface MonitoringStats {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  eventQueueSize: number;
  alertQueueSize: number;
  lastEventTime?: Date;
  lastAlertTime?: Date;
}

/**
 * Security Monitor class
 */
export class SecurityMonitor extends EventEmitter {
  private events: SecurityEvent[] = [];
  private alerts: SecurityEvent[] = [];
  private alertConfig: AlertConfig;
  private eventThrottle: Map<string, { lastSent: number; count: number }> = new Map();
  private alertCooldown: Map<string, number> = new Map();
  private eventBuffer: SecurityEvent[] = [];
  private bufferSize: number = 1000;
  private flushInterval: number = 5000; // 5 seconds

  private metrics: SecurityMetrics = {
    totalEvents: 0,
    eventsByType: {} as Record<SecurityEventType, number>,
    eventsBySeverity: {} as Record<SecuritySeverity, number>,
    eventsByHour: {} as Record<number, number>,
    topSources: [],
    topUsers: [],
    blockedRequests: 0,
    authenticationFailures: 0,
    injectionAttempts: 0,
    averageResponseTime: 0,
  };

  private startTime: number = Date.now();
  private flushTimer?: NodeJS.Timeout;

  constructor(alertConfig: AlertConfig = { enabled: false, minSeverity: SecuritySeverity.HIGH, channels: [] }) {
    super();

    this.alertConfig = {
      throttleMs: 60000, // 1 minute
      cooldownMs: 300000, // 5 minutes
      ...alertConfig,
    };

    // Initialize metrics
    for (const type of Object.values(SecurityEventType)) {
      this.metrics.eventsByType[type as SecurityEventType] = 0;
    }
    for (const severity of Object.values(SecuritySeverity)) {
      this.metrics.eventsBySeverity[severity as SecuritySeverity] = 0;
    }

    // Start flush interval
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
  }

  /**
   * Log security event
   */
  logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    source: SecurityEvent['source'],
    details: Record<string, any>,
    tags: string[] = [],
    correlationId?: string
  ): string {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      timestamp: new Date(),
      source,
      details,
      tags,
      correlationId,
    };

    this.events.push(event);
    this.metrics.totalEvents++;
    this.metrics.eventsByType[type]++;
    this.metrics.eventsBySeverity[severity]++;

    // Track by hour
    const hour = new Date().getHours();
    this.metrics.eventsByHour[hour] = (this.metrics.eventsByHour[hour] || 0) + 1;

    // Update top sources
    if (source.ipAddress) {
      const existing = this.metrics.topSources.find(s => s.ipAddress === source.ipAddress);
      if (existing) {
        existing.count++;
      } else {
        this.metrics.topSources.push({ ipAddress: source.ipAddress, count: 1 });
      }
      this.metrics.topSources.sort((a, b) => b.count - a.count);
      this.metrics.topSources = this.metrics.topSources.slice(0, 10);
    }

    // Update top users
    if (source.userId) {
      const existing = this.metrics.topUsers.find(u => u.userId === source.userId);
      if (existing) {
        existing.count++;
      } else {
        this.metrics.topUsers.push({ userId: source.userId, count: 1 });
      }
      this.metrics.topUsers.sort((a, b) => b.count - a.count);
      this.metrics.topUsers = this.metrics.topUsers.slice(0, 10);
    }

    // Check for anomalies
    this.checkAnomalies(event);

    // Emit event
    this.emit('event', event);

    // Send alert if configured
    if (this.alertConfig.enabled && this.shouldAlert(event)) {
      this.sendAlert(event);
    }

    // Add to buffer
    this.eventBuffer.push(event);

    return event.id;
  }

  /**
   * Check for anomalies
   */
  private checkAnomalies(event: SecurityEvent): void {
    const anomalies = this.detectAnomalies(event);

    for (const anomaly of anomalies) {
      if (anomaly.anomalous) {
        this.emit('anomaly', anomaly);

        // Log anomaly as security event
        this.logEvent(
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          SecuritySeverity.HIGH,
          event.source,
          {
            anomalyType: anomaly.type,
            anomalyScore: anomaly.score,
            anomalyDescription: anomaly.description,
            relatedEventId: event.id,
          },
          ['anomaly', 'detection']
        );
      }
    }
  }

  /**
   * Detect anomalies
   */
  private detectAnomalies(event: SecurityEvent): AnomalyResult[] {
    const results: AnomalyResult[] = [];

    // Check for rapid events from same source
    if (event.source.ipAddress) {
      const recentEvents = this.events.filter(
        e =>
          e.source.ipAddress === event.source.ipAddress &&
          Date.now() - e.timestamp.getTime() < 60000 // Last minute
      );

      if (recentEvents.length > 100) {
        results.push({
          anomalous: true,
          score: Math.min(100, recentEvents.length),
          type: 'rapid_events',
          description: `Rapid events from single IP: ${recentEvents.length} in last minute`,
          confidence: 0.9,
          metrics: { eventCount: recentEvents.length, timeframe: 60000 },
        });
      }
    }

    // Check for multiple failed authentications
    if (event.type === SecurityEventType.AUTHENTICATION && event.details.success === false) {
      const recentFailures = this.events.filter(
        e =>
          e.type === SecurityEventType.AUTHENTICATION &&
          e.details.success === false &&
          e.source.ipAddress === event.source.ipAddress &&
          Date.now() - e.timestamp.getTime() < 300000 // Last 5 minutes
      );

      if (recentFailures.length >= 5) {
        results.push({
          anomalous: true,
          score: Math.min(100, recentFailures.length * 10),
          type: 'brute_force',
          description: `Multiple authentication failures: ${recentFailures.length} in last 5 minutes`,
          confidence: 0.95,
          metrics: { failureCount: recentFailures.length, timeframe: 300000 },
        });
      }
    }

    // Check for injection attack patterns
    if (event.type === SecurityEventType.INJECTION_ATTACK) {
      const recentInjections = this.events.filter(
        e =>
          e.type === SecurityEventType.INJECTION_ATTACK &&
          e.source.ipAddress === event.source.ipAddress &&
          Date.now() - e.timestamp.getTime() < 3600000 // Last hour
      );

      if (recentInjections.length >= 3) {
        results.push({
          anomalous: true,
          score: Math.min(100, recentInjections.length * 20),
          type: 'persistent_injection_attacks',
          description: `Persistent injection attempts: ${recentInjections.length} in last hour`,
          confidence: 0.98,
          metrics: { injectionCount: recentInjections.length, timeframe: 3600000 },
        });
      }
    }

    // Check for unusual user agent
    if (event.source.userAgent) {
      const userAgent = event.source.userAgent.toLowerCase();

      // Check for known bot/user agent patterns
      const suspiciousPatterns = [
        /bot/,
        /crawler/,
        /spider/,
        /scanner/,
        /nikto/,
        /sqlmap/,
        /nmap/,
        /masscan/,
        /zap/,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(userAgent)) {
          results.push({
            anomalous: true,
            score: 70,
            type: 'suspicious_user_agent',
            description: `Suspicious user agent detected: ${event.source.userAgent}`,
            confidence: 0.7,
            metrics: { userAgent: event.source.userAgent },
          });
          break;
        }
      }
    }

    return results;
  }

  /**
   * Check if should send alert
   */
  private shouldAlert(event: SecurityEvent): boolean {
    // Check severity threshold
    const severities = [SecuritySeverity.CRITICAL, SecuritySeverity.HIGH, SecuritySeverity.MEDIUM, SecuritySeverity.LOW, SecuritySeverity.INFO];
    const minIndex = severities.indexOf(this.alertConfig.minSeverity);
    const eventIndex = severities.indexOf(event.severity);

    if (eventIndex < minIndex) {
      return false;
    }

    // Check throttle
    const throttleKey = `${event.type}:${event.source.ipAddress || 'global'}`;
    const throttle = this.eventThrottle.get(throttleKey);

    if (throttle && Date.now() - throttle.lastSent < this.alertConfig.throttleMs!) {
      throttle.count++;
      return false;
    }

    // Check cooldown
    const cooldownKey = `${event.type}:${event.source.ipAddress || 'global'}`;
    const lastAlert = this.alertCooldown.get(cooldownKey);

    if (lastAlert && Date.now() - lastAlert < this.alertConfig.cooldownMs!) {
      return false;
    }

    return true;
  }

  /**
   * Send alert
   */
  private async sendAlert(event: SecurityEvent): Promise<void> {
    // Update throttle and cooldown
    const throttleKey = `${event.type}:${event.source.ipAddress || 'global'}`;
    const cooldownKey = `${event.type}:${event.source.ipAddress || 'global'}`;

    this.eventThrottle.set(throttleKey, { lastSent: Date.now(), count: 1 });
    this.alertCooldown.set(cooldownKey, Date.now());

    this.alerts.push(event);
    this.emit('alert', event);

    // Send to configured channels
    for (const channel of this.alertConfig.channels) {
      try {
        await this.sendToChannel(event, channel);
      } catch (error) {
        console.error(`Failed to send alert to ${channel.type}:`, error);
      }
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendToChannel(event: SecurityEvent, channel: AlertChannel): Promise<void> {
    const message = this.formatAlertMessage(event);

    switch (channel.type) {
      case 'email':
        // Send email (implement with your email service)
        console.log('Email alert:', message);
        break;

      case 'slack':
        // Send to Slack webhook
        if (channel.config.webhookUrl) {
          await fetch(channel.config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: message,
              attachments: [{
                color: this.getSeverityColor(event.severity),
                fields: [
                  { title: 'Type', value: event.type, short: true },
                  { title: 'Severity', value: event.severity, short: true },
                  { title: 'IP Address', value: event.source.ipAddress || 'N/A', short: true },
                  { title: 'User ID', value: event.source.userId || 'N/A', short: true },
                ],
              }],
            }),
          });
        }
        break;

      case 'webhook':
        // Send to generic webhook
        if (channel.config.url) {
          await fetch(channel.config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, message }),
          });
        }
        break;

      case 'sms':
        // Send SMS (implement with your SMS service)
        console.log('SMS alert:', message);
        break;

      case 'pagerduty':
        // Send to PagerDuty (implement with PagerDuty API)
        console.log('PagerDuty alert:', message);
        break;
    }
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(event: SecurityEvent): string {
    return [
      `🚨 Security Alert: ${event.type.toUpperCase()}`,
      `Severity: ${event.severity.toUpperCase()}`,
      `IP Address: ${event.source.ipAddress || 'N/A'}`,
      `User ID: ${event.source.userId || 'N/A'}`,
      `Timestamp: ${event.timestamp.toISOString()}`,
      `Details: ${JSON.stringify(event.details)}`,
    ].join('\n');
  }

  /**
   * Get severity color for Slack
   */
  private getSeverityColor(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
        return 'danger';
      case SecuritySeverity.HIGH:
        return 'danger';
      case SecuritySeverity.MEDIUM:
        return 'warning';
      case SecuritySeverity.LOW:
        return 'good';
      case SecuritySeverity.INFO:
        return 'good';
      default:
        return 'good';
    }
  }

  /**
   * Get security metrics
   */
  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  /**
   * Get monitoring stats
   */
  getStats(): MonitoringStats {
    return {
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      eventQueueSize: this.events.length,
      alertQueueSize: this.alerts.length,
      lastEventTime: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : undefined,
      lastAlertTime: this.alerts.length > 0 ? this.alerts[this.alerts.length - 1].timestamp : undefined,
    };
  }

  /**
   * Query events
   */
  queryEvents(filter: {
    type?: SecurityEventType;
    severity?: SecuritySeverity;
    startDate?: Date;
    endDate?: Date;
    ipAddress?: string;
    userId?: string;
    tags?: string[];
    limit?: number;
  }): SecurityEvent[] {
    let filtered = [...this.events];

    if (filter.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter.severity) {
      filtered = filtered.filter(e => e.severity === filter.severity);
    }

    if (filter.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
    }

    if (filter.ipAddress) {
      filtered = filtered.filter(e => e.source.ipAddress === filter.ipAddress);
    }

    if (filter.userId) {
      filtered = filtered.filter(e => e.source.userId === filter.userId);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(e =>
        filter.tags!.some(tag => e.tags.includes(tag))
      );
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  /**
   * Get events by correlation ID
   */
  getEventsByCorrelationId(correlationId: string): SecurityEvent[] {
    return this.events.filter(e => e.correlationId === correlationId);
  }

  /**
   * Flush event buffer
   */
  private flush(): void {
    if (this.eventBuffer.length > 0) {
      this.emit('flush', this.eventBuffer);
      this.eventBuffer = [];
    }
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear old events
   */
  clearOldEvents(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - olderThanMs;
    const initialCount = this.events.length;

    this.events = this.events.filter(e => e.timestamp.getTime() > cutoff);

    return initialCount - this.events.length;
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalEvents: 0,
      eventsByType: {} as Record<SecurityEventType, number>,
      eventsBySeverity: {} as Record<SecuritySeverity, number>,
      eventsByHour: {} as Record<number, number>,
      topSources: [],
      topUsers: [],
      blockedRequests: 0,
      authenticationFailures: 0,
      injectionAttempts: 0,
      averageResponseTime: 0,
    };

    for (const type of Object.values(SecurityEventType)) {
      this.metrics.eventsByType[type as SecurityEventType] = 0;
    }
    for (const severity of Object.values(SecuritySeverity)) {
      this.metrics.eventsBySeverity[severity as SecuritySeverity] = 0;
    }
  }

  /**
   * Shutdown
   */
  shutdown(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flush();
    this.emit('shutdown');
  }
}

/**
 * Convenience functions for common security events
 */
export function logAuthenticationEvent(
  monitor: SecurityMonitor,
  success: boolean,
  source: SecurityEvent['source'],
  details: Record<string, any> = {}
): string {
  return monitor.logEvent(
    SecurityEventType.AUTHENTICATION,
    success ? SecuritySeverity.INFO : SecuritySeverity.HIGH,
    source,
    { ...details, success },
    success ? [] : ['authentication', 'failure'],
    details.correlationId
  );
}

export function logInjectionAttack(
  monitor: SecurityMonitor,
  attackType: string,
  source: SecurityEvent['source'],
  details: Record<string, any> = {}
): string {
  return monitor.logEvent(
    SecurityEventType.INJECTION_ATTACK,
    SecuritySeverity.CRITICAL,
    source,
    { ...details, attackType },
    ['injection', 'attack', 'critical']
  );
}

export function logRateLimitExceeded(
  monitor: SecurityMonitor,
  source: SecurityEvent['source'],
  details: Record<string, any> = {}
): string {
  return monitor.logEvent(
    SecurityEventType.RATE_LIMIT_EXCEEDED,
    SecuritySeverity.MEDIUM,
    source,
    details,
    ['rate-limit', 'throttle']
  );
}
