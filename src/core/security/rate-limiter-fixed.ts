/**
 * Fixed Rate Limiter Implementation
 *
 * FEATURES:
 * - Sliding window rate limiting
 * - Per-user/IP rate limiting
 * - Configurable limits
 * - Automatic cleanup
 * - Redis support for distributed systems
 */

import * as crypto from 'crypto';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request is allowed
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or init request history
    let timestamps = this.requests.get(identifier) || [];

    // Filter out old requests outside window
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Calculate remaining requests
    const remaining = Math.max(0, this.config.maxRequests - timestamps.length);
    const reset = new Date(timestamps[0] || now + this.config.windowMs);
    reset.setTime(reset.getTime() + this.config.windowMs);

    // Check if limit exceeded
    if (timestamps.length >= this.config.maxRequests) {
      // Find oldest request in window
      const oldest = timestamps[0];
      const retryAfter = Math.ceil((oldest + this.config.windowMs - now) / 1000);

      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset,
        retryAfter
      };
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: remaining - 1,
      reset
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get current usage
   */
  getUsage(identifier: string): {
    count: number;
    limit: number;
    remaining: number;
  } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let timestamps = this.requests.get(identifier) || [];
    timestamps = timestamps.filter((ts) => ts > windowStart);

    const count = timestamps.length;
    const remaining = Math.max(0, this.config.maxRequests - count);

    return {
      count,
      limit: this.config.maxRequests,
      remaining
    };
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((ts) => ts > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Express middleware for rate limiting
 */
export function rateLimiterMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return (req: any, res: any, next: any) => {
    // Use IP address or user ID as identifier
    const identifier = req.user?.id || req.ip || req.connection.remoteAddress || 'unknown';

    const result = limiter.check(identifier);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.reset.getTime() / 1000));

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds`,
        retryAfter: result.retryAfter
      });
    }

    next();
  };
}

/**
 * Distributed rate limiter using Redis
 */
export class RedisRateLimiter {
  private redis: any;
  private config: RateLimitConfig;
  private prefix: string = 'rate_limit:';

  constructor(redisClient: any, config: RateLimitConfig) {
    this.redis = redisClient;
    this.config = config;
  }

  /**
   * Check if request is allowed (Redis-based)
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.prefix}${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Use Redis sorted set for sliding window
      const multi = this.redis.multi();

      // Remove old entries
      multi.zremrangebyscore(key, 0, windowStart);

      // Count current requests
      multi.zcard(key);

      // Add current request
      multi.zadd(key, now, `${now}:${crypto.randomBytes(16).toString('hex')}`);

      // Set expiry
      multi.expire(key, Math.ceil(this.config.windowMs / 1000) + 1);

      const results = await multi.exec();
      const count = results[1][1] as number;

      const remaining = Math.max(0, this.config.maxRequests - count);
      const reset = new Date(now + this.config.windowMs);

      if (count >= this.config.maxRequests) {
        // Get oldest timestamp
        const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const oldestTimestamp = oldest ? parseFloat(oldest[1]) : now;
        const retryAfter = Math.ceil((oldestTimestamp + this.config.windowMs - now) / 1000);

        return {
          allowed: false,
          limit: this.config.maxRequests,
          remaining: 0,
          reset,
          retryAfter
        };
      }

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: remaining - 1,
        reset
      };
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: new Date(now + this.config.windowMs)
      };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = `${this.prefix}${identifier}`;
    await this.redis.del(key);
  }

  /**
   * Get current usage
   */
  async getUsage(identifier: string): Promise<{
    count: number;
    limit: number;
    remaining: number;
  }> {
    const key = `${this.prefix}${identifier}`;
    const count = await this.redis.zcard(key);
    const remaining = Math.max(0, this.config.maxRequests - count);

    return {
      count,
      limit: this.config.maxRequests,
      remaining
    };
  }
}

/**
 * Express middleware for Redis rate limiting
 */
export function redisRateLimiterMiddleware(redisClient: any, config: RateLimitConfig) {
  const limiter = new RedisRateLimiter(redisClient, config);

  return async (req: any, res: any, next: any) => {
    const identifier = req.user?.id || req.ip || req.connection.remoteAddress || 'unknown';

    const result = await limiter.check(identifier);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.reset.getTime() / 1000));

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds`,
        retryAfter: result.retryAfter
      });
    }

    next();
  };
}

// Export default function for backward compatibility
export function rateLimiter(config: RateLimitConfig) {
  return rateLimiterMiddleware(config);
}
