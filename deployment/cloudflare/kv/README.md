# KV Storage Configuration

This directory contains configuration and utilities for Cloudflare KV namespaces.

## Namespaces

### 1. Cache Namespace (`CACHE`)
Stores cached data including:
- GraphQL query results
- API responses
- Computed data
- Session tokens

**Binding:** `CACHE`
**TTL:** 5 minutes (default)

### 2. Sessions Namespace (`SESSIONS`)
Stores session data including:
- User sessions
- CSRF tokens
- OAuth state
- Temporary authentication data

**Binding:** `SESSIONS`
**TTL:** 24 hours

## Setup Instructions

### Create Namespaces

```bash
# Create cache namespace
wrangler kv:namespace create "CACHE"

# Create sessions namespace
wrangler kv:namespace create "SESSIONS"

# For development environment
wrangler kv:namespace create "CACHE" --preview
wrangler kv:namespace create "SESSIONS" --preview
```

Update `wrangler.toml` with the returned namespace IDs.

## Usage in Workers

### Cache Helper

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export class CacheHelper {
  constructor(
    private kv: KVNamespace,
    private defaultTTL: number = 300 // 5 minutes
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get<CacheEntry<T>>(key, 'json');

    if (!value) {
      return null;
    }

    // Check version if needed
    if (value.version !== CACHE_VERSION) {
      await this.kv.delete(key);
      return null;
    }

    return value.data;
  }

  async set<T>(
    key: string,
    data: T,
    ttl?: number
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    await this.kv.put(key, JSON.stringify(entry), {
      expirationTtl: ttl || this.defaultTTL,
    });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  async clear(): Promise<void> {
    // List and delete all keys (be careful with this)
    const list = await this.kv.list();
    await Promise.all(
      list.keys.map((key) => this.kv.delete(key.name))
    );
  }
}
```

### Session Helper

```typescript
interface SessionData {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: number;
  lastActivity: number;
}

export class SessionHelper {
  constructor(
    private kv: KVNamespace,
    private ttl: number = 86400 // 24 hours
  ) {}

  async createSession(
    userId: string,
    data: Omit<SessionData, 'createdAt' | 'lastActivity'>
  ): Promise<string> {
    const sessionId = crypto.randomUUID();
    const sessionData: SessionData = {
      ...data,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    await this.kv.put(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      {
        expirationTtl: this.ttl,
      }
    );

    // Also create reverse lookup for user sessions
    await this.kv.put(
      `user_sessions:${userId}`,
      sessionId,
      {
        expirationTtl: this.ttl,
      }
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.kv.get(`session:${sessionId}`, 'json');
    return data as SessionData | null;
  }

  async updateSession(sessionId: string): Promise<void> {
    const data = await this.getSession(sessionId);
    if (data) {
      data.lastActivity = Date.now();
      await this.kv.put(
        `session:${sessionId}`,
        JSON.stringify(data),
        {
          expirationTtl: this.ttl,
        }
      );
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const data = await this.getSession(sessionId);
    if (data) {
      await this.kv.delete(`user_sessions:${data.userId}`);
    }
    await this.kv.delete(`session:${sessionId}`);
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    const sessionId = await this.kv.get(`user_sessions:${userId}`);
    if (sessionId) {
      await this.deleteSession(sessionId);
    }
  }
}
```

### Rate Limiting Helper

```typescript
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  constructor(
    private kv: KVNamespace,
    private limits: Record<string, { maxRequests: number; window: number }>
  ) {}

  async check(
    identifier: string,
    endpoint: string
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const limit = this.limits[endpoint] || this.limits['default'];
    const key = `ratelimit:${identifier}:${endpoint}`;
    const now = Date.now();

    const data = await this.kv.get<RateLimitEntry>(key, 'json');

    if (!data || now > data.resetAt) {
      // First request or window expired
      await this.kv.put(
        key,
        JSON.stringify({
          count: 1,
          resetAt: now + limit.window * 1000,
        }),
        {
          expirationTtl: limit.window,
        }
      );

      return { allowed: true };
    }

    if (data.count >= limit.maxRequests) {
      const retryAfter = Math.ceil((data.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Increment counter
    await this.kv.put(
      key,
      JSON.stringify({
        count: data.count + 1,
        resetAt: data.resetAt,
      }),
      {
        expirationTtl: limit.window,
      }
    );

    return { allowed: true };
  }
}
```

## Cache Key Patterns

### GraphQL Query Cache

```
graphql:{operationName}:{hash(variables)}
```

### Spreadsheet Cache

```
spreadsheet:{id}:{version}
spreadsheet:cells:{id}:{hash}
```

### User Cache

```
user:{id}
user:permissions:{id}
user:spreadsheets:{id}
```

### Template Cache

```
template:{id}
templates:list:{category}:{page}
templates:featured:{date}
```

## Best Practices

1. **Use hierarchical keys with colons:**
   - `namespace:category:id`
   - `user:{userId}:profile`

2. **Set appropriate TTLs:**
   - Static data: 1 hour
   - User-specific data: 5 minutes
   - Session data: 24 hours
   - Rate limiting: Match window size

3. **Use JSON for complex data:**
   ```typescript
   await kv.put(key, JSON.stringify(data), { expirationTtl: 300 });
   ```

4. **Handle cache misses gracefully:**
   ```typescript
   const cached = await cache.get(key);
   if (cached) return cached;
   const fresh = await fetchFromDB();
   await cache.set(key, fresh);
   return fresh;
   ```

5. **Implement cache invalidation:**
   - Delete related cache keys on updates
   - Use versioning to force refreshes
   - Implement cache tags for bulk invalidation

## Monitoring

Check KV usage:

```bash
# List keys
wrangler kv:key list --namespace-id=<NAMESPACE_ID>

# Get key value
wrangler kv:key get "key" --namespace-id=<NAMESPACE_ID>

# Delete key
wrangler kv:key delete "key" --namespace-id=<NAMESPACE_ID>
```

## Limits and Quotas

- **Key size:** Up to 512 bytes
- **Value size:** Up to 25 MB
- **List operations:** Up to 1,000 keys per request
- **Read operations:** Eventually consistent (global replication)
- **Write operations:** Strongly consistent

For more information, see: https://developers.cloudflare.com/kv/
