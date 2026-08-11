# Database Integrations Guide

## Overview

Spreadsheet Moment supports direct integration with popular database systems, enabling you to query, update, and sync data between spreadsheets and your databases in real-time.

## Supported Databases

### Relational Databases
- **PostgreSQL** - Full feature support
- **MySQL** - Full feature support
- **SQLite** - Full feature support
- **SQL Server** - Full feature support
- **Oracle** - Full feature support

### NoSQL Databases
- **MongoDB** - Document database support
- **Redis** - Key-value and caching
- **Cassandra** - Wide-column storage
- **DynamoDB** - Document database

### Data Warehouses
- **Snowflake** - Cloud data warehouse
- **BigQuery** - Google's data warehouse
- **Redshift** - AWS data warehouse
- **Databricks** - Lakehouse platform

### Real-time Databases
- **Firebase Realtime Database**
- **Firebase Firestore**
- **Supabase** - PostgreSQL with real-time
- **PlanetScale** - MySQL-compatible

## Setup

### PostgreSQL Integration

```typescript
import { createDatabaseConnector } from '@polln/integrations';

const postgres = createDatabaseConnector({
  id: 'postgres-production',
  name: 'Production PostgreSQL',
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  poolSize: 20,
  ssl: true,
  connectionTimeout: 10000
});

await manager.registerIntegration(postgres);
await manager.connectIntegration('postgres-production');
```

### MySQL Integration

```typescript
const mysql = createDatabaseConnector({
  id: 'mysql-production',
  name: 'Production MySQL',
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'mydb',
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  poolSize: 20
});

await manager.registerIntegration(mysql);
```

### MongoDB Integration

```typescript
import { createMongoConnector } from '@polln/integrations';

const mongo = createMongoConnector({
  id: 'mongo-production',
  name: 'Production MongoDB',
  connectionString: process.env.MONGO_URI,
  database: 'mydb',
  options: {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }
});

await manager.registerIntegration(mongo);
```

### Redis Integration

```typescript
import { createRedisConnector } from '@polln/integrations';

const redis = createRedisConnector({
  id: 'redis-cache',
  name: 'Redis Cache',
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  options: {
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3
  }
});

await manager.registerIntegration(redis);
```

## Query Operations

### Raw SQL Queries

```typescript
// PostgreSQL
const result = await manager.send('postgres-production', 'query', {
  text: 'SELECT * FROM users WHERE active = $1',
  parameters: [true],
  timeout: 5000
});

console.log('Rows:', result.rows);
console.log('Fields:', result.fields);
```

### Query Builder

```typescript
import { QueryBuilder } from '@polln/integrations';

// Build SELECT query
const query = QueryBuilder.select('users')
  .where('active = $1', true)
  .where('created_at > $2', '2024-01-01')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .offset(0);

const result = await manager.send('postgres-production', 'select', {
  ...query.build()
});

// Build INSERT query
const insertQuery = QueryBuilder.insert('users')
  .values({
    name: 'John Doe',
    email: 'john@example.com',
    active: true
  })
  .returning('*');

const inserted = await manager.send('postgres-production', 'insert', {
  ...insertQuery.build()
});

// Build UPDATE query
const updateQuery = QueryBuilder.update('users')
  .set({ active: false })
  .where('id = $1', userId)
  .returning('*');

const updated = await manager.send('postgres-production', 'update', {
  ...updateQuery.build()
});
```

### MongoDB Queries

```typescript
// Find documents
const users = await manager.send('mongo-production', 'find', {
  collection: 'users',
  query: { active: true },
  projection: { name: 1, email: 1 },
  limit: 10,
  sort: { createdAt: -1 }
});

// Aggregate
const stats = await manager.send('mongo-production', 'aggregate', {
  collection: 'users',
  pipeline: [
    { $match: { active: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]
});
```

### Redis Operations

```typescript
// Set key-value
await manager.send('redis-cache', 'set', {
  key: 'user:123',
  value: JSON.stringify({ name: 'John' }),
  ttl: 3600
});

// Get value
const user = await manager.send('redis-cache', 'get', {
  key: 'user:123'
});

// Hash operations
await manager.send('redis-cache', 'hset', {
  key: 'user:123:details',
  field: 'email',
  value: 'john@example.com'
});

// Lists
await manager.send('redis-cache', 'lpush', {
  key: 'user:123:activity',
  values: ['login', 'view_profile', 'update']
});

// Sets
await manager.send('redis-cache', 'sadd', {
  key: 'user:123:roles',
  members: ['admin', 'user']
});
```

## Transactions

### PostgreSQL Transactions

```typescript
// Start transaction
const tx = await manager.send('postgres-production', 'transaction', {});

try {
  // Execute queries
  await tx.query('INSERT INTO users (name, email) VALUES ($1, $2)', ['John', 'john@example.com']);
  await tx.query('INSERT INTO user_logs (user_id, action) VALUES ($1, $2)', [userId, 'created']);

  // Commit transaction
  await tx.commit();
} catch (error) {
  // Rollback on error
  await tx.rollback();
  throw error;
}
```

### MongoDB Transactions

```typescript
const session = await manager.send('mongo-production', 'startSession', {});

try {
  await session.withTransaction(async () => {
    await manager.send('mongo-production', 'insertOne', {
      collection: 'users',
      document: { name: 'John' },
      session
    });

    await manager.send('mongo-production', 'insertOne', {
      collection: 'logs',
      document: { action: 'created' },
      session
    });
  });
} catch (error) {
  console.error('Transaction failed:', error);
}
```

## Streaming Results

### PostgreSQL Streaming

```typescript
await manager.send('postgres-production', 'stream', {
  text: 'SELECT * FROM large_table',
  onRow: (row) => {
    console.log('Received row:', row);
    // Process row immediately
  },
  onComplete: () => {
    console.log('Stream complete');
  },
  onError: (error) => {
    console.error('Stream error:', error);
  },
  batchSize: 1000,
  highWaterMark: 10000
});
```

### MongoDB Cursor

```typescript
const cursor = await manager.send('mongo-production', 'cursor', {
  collection: 'users',
  query: { active: true },
  batchSize: 1000
});

for await (const doc of cursor) {
  console.log('Document:', doc);
  // Process document
}

await cursor.close();
```

## Schema Operations

### Get Database Schema

```typescript
// PostgreSQL
const schema = await manager.send('postgres-production', 'schema', {
  schema: 'public'
});

console.log('Tables:', schema.tables);
console.log('Views:', schema.views);
console.log('Functions:', schema.functions);

// Get table schema
const tableSchema = await manager.send('postgres-production', 'table', {
  table: 'users'
});

console.log('Columns:', tableSchema.columns);
console.log('Indexes:', tableSchema.indexes);
console.log('Foreign Keys:', tableSchema.foreignKeys);
```

### MongoDB Collection Info

```typescript
const info = await manager.send('mongo-production', 'collectionInfo', {
  collection: 'users'
});

console.log('Count:', info.count);
console.log('Indexes:', info.indexes);
console.log('Stats:', info.stats);
```

## Data Synchronization

### Sync to Spreadsheet

```typescript
// Sync query results to spreadsheet
const result = await manager.send('postgres-production', 'query', {
  text: 'SELECT * FROM products'
});

// Import to spreadsheet
await spreadsheet.importData({
  data: result.rows,
  range: 'Sheet1!A1',
  headers: true
});

// Set up auto-sync
await manager.createSyncJob({
  id: 'sync-products',
  source: 'postgres-production',
  target: 'spreadsheet',
  query: 'SELECT * FROM products',
  range: 'Sheet1!A1',
  interval: 300000, // 5 minutes
  transform: (row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    stock: row.quantity
  })
});
```

### Sync from Spreadsheet

```typescript
// Export spreadsheet data to database
const data = await spreadsheet.exportData({
  range: 'Sheet1!A1:Z1000'
});

// Batch insert
await manager.send('postgres-production', 'batchInsert', {
  table: 'users',
  data: data,
  batchSize: 1000,
  onConflict: 'DO UPDATE SET email = EXCLUDED.email'
});
```

## Performance Optimization

### Connection Pooling

```typescript
const db = createDatabaseConnector({
  // ... config
  poolSize: 20, // Number of connections
  poolTimeout: 30000, // Wait time for connection
  idleTimeout: 10000, // Idle connection timeout
  maxUses: 7500 // Max uses per connection
});
```

### Query Optimization

```typescript
// Use prepared statements
const preparedQuery = await manager.send('postgres-production', 'prepare', {
  name: 'get_user_by_email',
  text: 'SELECT * FROM users WHERE email = $1'
});

const result = await manager.send('postgres-production', 'execute', {
  name: 'get_user_by_email',
  parameters: ['john@example.com']
});

// Use indexes
await manager.send('postgres-production', 'query', {
  text: 'SELECT * FROM users WHERE email = $1',
  parameters: ['john@example.com'],
  // Ensure email column is indexed
});
```

### Caching with Redis

```typescript
// Cache query results
const cacheKey = `users:${userId}`;

// Try cache first
let user = await manager.send('redis-cache', 'get', {
  key: cacheKey
});

if (!user) {
  // Cache miss - query database
  user = await manager.send('postgres-production', 'query', {
    text: 'SELECT * FROM users WHERE id = $1',
    parameters: [userId]
  });

  // Store in cache
  await manager.send('redis-cache', 'set', {
    key: cacheKey,
    value: JSON.stringify(user.rows[0]),
    ttl: 3600 // 1 hour
  });
}

// Invalidate cache on update
await manager.send('postgres-production', 'update', {
  table: 'users',
  data: { name: 'Updated Name' },
  where: 'id = $1',
  parameters: [userId]
});

// Delete cache
await manager.send('redis-cache', 'del', {
  key: cacheKey
});
```

## Security Best Practices

### Use Parameterized Queries

```typescript
// Good - Parameterized
await manager.send('postgres-production', 'query', {
  text: 'SELECT * FROM users WHERE email = $1',
  parameters: [userEmail]
});

// Bad - String concatenation (SQL injection risk)
await manager.send('postgres-production', 'query', {
  text: `SELECT * FROM users WHERE email = '${userEmail}'`
});
```

### Encrypt Sensitive Data

```typescript
import { encrypt, decrypt } from '@polln/integrations/crypto';

// Before storing
const encrypted = await encrypt(ssn);

await manager.send('postgres-production', 'insert', {
  table: 'users',
  data: { ssn: encrypted }
});

// After retrieving
const result = await manager.send('postgres-production', 'query', {
  text: 'SELECT ssn FROM users WHERE id = $1',
  parameters: [userId]
});

const decrypted = await decrypt(result.rows[0].ssn);
```

### Row-Level Security

```typescript
// PostgreSQL RLS
await manager.send('postgres-production', 'query', {
  text: `
    SET ROLE app_user;
    SELECT * FROM users WHERE id = current_user_id();
  `
});
```

## Error Handling

### Connection Errors

```typescript
try {
  await manager.send('postgres-production', 'query', {
    text: 'SELECT * FROM users'
  });
} catch (error) {
  switch (error.code) {
    case 'ECONNREFUSED':
      console.error('Database not reachable');
      break;
    case '3D000': // Invalid catalog name
      console.error('Database does not exist');
      break;
    case '28P01': // Invalid password
      console.error('Invalid credentials');
      break;
  }
}
```

### Query Errors

```typescript
try {
  await manager.send('postgres-production', 'query', {
    text: 'SELECT * FROM non_existent_table'
  });
} catch (error) {
  if (error.code === '42P01') { // Undefined table
    console.error('Table does not exist');
  }
}
```

## Monitoring

### Connection Health

```typescript
// Check connection
const health = await manager.send('postgres-production', 'healthCheck');

console.log('Status:', health.status);
console.log('Connected:', health.connected);
console.log('Pool size:', health.poolSize);
console.log('Active connections:', health.activeConnections);
```

### Query Performance

```typescript
// Enable query logging
const db = createDatabaseConnector({
  // ... config
  logQueries: true,
  logSlowQueries: true,
  slowQueryThreshold: 1000 // ms
});

// Get query metrics
const metrics = await manager.send('postgres-production', 'metrics');

console.log('Total queries:', metrics.totalQueries);
console.log('Slow queries:', metrics.slowQueries);
console.log('Average time:', metrics.averageTime);
```

## Best Practices

### 1. Use Transactions for Multiple Operations

```typescript
const tx = await manager.send('postgres-production', 'transaction', {});
try {
  // Multiple related operations
  await tx.query('INSERT INTO ...');
  await tx.query('UPDATE ...');
  await tx.query('DELETE ...');
  await tx.commit();
} catch (error) {
  await tx.rollback();
}
```

### 2. Use Connection Pooling

```typescript
const db = createDatabaseConnector({
  poolSize: 20, // Adjust based on workload
  maxOverflow: 10 // Allow temporary overflow
});
```

### 3. Optimize Queries

```typescript
// Use indexes
await manager.send('postgres-production', 'query', {
  text: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
});

// Use EXPLAIN ANALYZE
const plan = await manager.send('postgres-production', 'query', {
  text: 'EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1',
  parameters: ['john@example.com']
});
```

### 4. Handle Large Results

```typescript
// Use streaming for large results
await manager.send('postgres-production', 'stream', {
  text: 'SELECT * FROM large_table',
  onRow: (row) => {
    // Process in batches
  },
  batchSize: 1000
});
```

### 5. Use Caching

```typescript
// Cache frequently accessed data
const cached = await manager.send('redis-cache', 'get', {
  key: 'users:active'
});

if (!cached) {
  const result = await manager.send('postgres-production', 'query', {
    text: 'SELECT * FROM users WHERE active = true'
  });

  await manager.send('redis-cache', 'set', {
    key: 'users:active',
    value: JSON.stringify(result.rows),
    ttl: 300 // 5 minutes
  });
}
```

## Troubleshooting

### Connection Issues

**Problem: Can't connect to database**

**Solutions:**
1. Check host and port
2. Verify firewall rules
3. Test network connectivity
4. Check credentials
5. Verify SSL configuration

### Performance Issues

**Problem: Queries are slow**

**Solutions:**
1. Add indexes to columns
2. Use EXPLAIN ANALYZE
3. Optimize query structure
4. Increase connection pool
5. Enable query caching

### Memory Issues

**Problem: Out of memory errors**

**Solutions:**
1. Use streaming for large results
2. Reduce batch size
3. Limit result set
4. Increase available memory
5. Close unused connections

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Reference Manual](https://dev.mysql.com/doc/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Snowflake Documentation](https://docs.snowflake.com/)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)

---

**Need Help?** Contact integrations@spreadsheetmoment.com or join our [Discord community](https://discord.gg/spreadsheetmoment).
