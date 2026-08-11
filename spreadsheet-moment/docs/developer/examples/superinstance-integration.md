# SuperInstance Integration Examples

Complete examples showing how to integrate SuperInstance distributed AI systems into your applications.

## Table of Contents

- [Quick Start](#quick-start)
- [Instance Management](#instance-management)
- [Rate-Based Operations](#rate-based-operations)
- [Message Passing](#message-passing)
- [Real-Time Updates](#real-time-updates)
- [Confidence Cascades](#confidence-cascades)
- [Advanced Patterns](#advanced-patterns)

## Quick Start

### Initialize SuperInstance Client

#### JavaScript/TypeScript

```typescript
import { SuperInstanceClient } from '@superinstance/sdk'

const client = new SuperInstanceClient({
  apiKey: process.env.SUPERINSTANCE_API_KEY,
  baseURL: 'https://api.superinstance.ai/v1'
})

// Create an instance
const instance = await client.instances.create({
  type: 'learning_agent',
  name: 'My First Agent',
  configuration: {
    resources: {
      cpu: 50,
      memory: 512,
      gpu: 10
    }
  }
})

console.log('Instance created:', instance.id)
```

#### Python

```python
from superinstance import SuperInstanceClient

client = SuperInstanceClient(
    api_key='your_api_key',
    base_url='https://api.superinstance.ai/v1'
)

# Create an instance
instance = client.instances.create(
    type='learning_agent',
    name='My First Agent',
    configuration={
        'resources': {
            'cpu': 50,
            'memory': 512,
            'gpu': 10
        }
    }
)

print(f'Instance created: {instance.id}')
```

#### Go

```go
package main

import (
    "context"
    "fmt"
    "os"

    "github.com/superinstance/superinstance-go"
)

func main() {
    client := superinstance.NewClient(
        os.Getenv("SUPERINSTANCE_API_KEY"),
        superinstance.WithBaseURL("https://api.superinstance.ai/v1"),
    )

    instance := &superinstance.CreateInstanceInput{
        Type: superinstance.InstanceTypeLearningAgent,
        Name: "My First Agent",
        Configuration: &superinstance.InstanceConfiguration{
            Resources: &superinstance.ResourceAllocation{
                CPU:    50,
                Memory: 512,
                GPU:    10,
            },
        },
    }

    result, err := client.Instances.Create(context.Background(), instance)
    if err != nil {
        panic(err)
    }

    fmt.Printf("Instance created: %s\n", result.ID)
}
```

## Instance Management

### Create Different Instance Types

```typescript
// Data Block Instance
const dataBlock = await client.instances.create({
  type: 'data_block',
  name: 'Sensor Data Store',
  configuration: {
    resources: { memory: 1024, storage: 5120 }
  }
})

// Process Instance
const process = await client.instances.create({
  type: 'process',
  name: 'Data Processing Pipeline',
  capabilities: ['transform', 'aggregate', 'validate']
})

// API Instance
const api = await client.instances.create({
  type: 'api',
  name: 'REST API Wrapper',
  configuration: {
    policies: {
      isolationLevel: 'full',
      auditLogging: true
    }
  }
})
```

### Lifecycle Management

```typescript
// Activate instance
await client.instances.activate(instanceId)

// Check status
const status = await client.instances.get(instanceId)
console.log('Instance state:', status.state)
// Output: 'running', 'idle', 'error', 'terminated'

// Deactivate (graceful shutdown)
await client.instances.deactivate(instanceId)

// Terminate (forceful shutdown)
await client.instances.terminate(instanceId)

// List all instances
const instances = await client.instances.list({
  type: 'learning_agent',
  state: 'running',
  limit: 50
})
```

### Resource Management

```typescript
// Update instance configuration
await client.instances.update(instanceId, {
  configuration: {
    resources: {
      cpu: 75,
      memory: 1024,
      gpu: 25
    },
    constraints: {
      maxRuntime: 3600000, // 1 hour in ms
      maxMemory: 2048
    }
  }
})

// Monitor resource usage
const metrics = await client.system.getMetrics({
  timeRange: '1h',
  metric: 'cpuUsage'
})

console.log('CPU Usage:', metrics.data)
```

## Rate-Based Operations

### Update Rate State

```typescript
// Update rate tracking
await client.instances.rate.update(instanceId, {
  value: 42.5,
  timestamp: Date.now(),
  metadata: {
    source: 'sensor_A1',
    unit: 'celsius'
  }
})

// Batch rate updates
await client.batch.rate.update([
  { instanceId: 'inst_1', value: 10.5, timestamp: Date.now() },
  { instanceId: 'inst_2', value: 20.3, timestamp: Date.now() },
  { instanceId: 'inst_3', value: 15.7, timestamp: Date.now() }
])
```

### Predict Future States

```typescript
// Predict future values based on current rate
const prediction = await client.instances.rate.predict(instanceId, {
  horizon: 3600000, // Predict 1 hour ahead
  confidence: 0.95
})

console.log('Predicted value:', prediction.value)
console.log('Confidence interval:', prediction.confidenceInterval)
// Output: { lower: 38.2, upper: 46.8 }

// Get prediction uncertainty
console.log('Uncertainty:', prediction.uncertainty)
// Output: 0.05 (5% uncertainty)
```

### Rate History

```typescript
// Get historical rate data
const history = await client.instances.rate.history(instanceId, {
  startTime: Date.now() - 86400000, // Last 24 hours
  endTime: Date.now(),
  resolution: 'hour', // raw, minute, hour, day
  limit: 1000
})

// Plot rate changes
history.data.forEach(point => {
  console.log(`${point.timestamp}: ${point.value}`)
})

// Analyze trends
const trend = calculateTrend(history.data)
console.log('Trend:', trend) // 'increasing', 'decreasing', 'stable'
```

## Message Passing

### Send Messages

```typescript
// Send data message
await client.instances.messages.send(instanceId, {
  type: 'data',
  payload: {
    temperature: 22.5,
    humidity: 65
  },
  targetInstanceId: 'target_instance_id'
})

// Send command message
await client.instances.messages.send(instanceId, {
  type: 'command',
  payload: {
    action: 'shutdown',
    reason: 'maintenance'
  }
})

// Send query message
await client.instances.messages.send(instanceId, {
  type: 'query',
  payload: {
    query: 'SELECT * FROM sensors WHERE active = true'
  }
})
```

### Handle Incoming Messages

```typescript
// Subscribe to messages
const messages = await client.instances.messages.list(instanceId, {
  type: 'data',
  status: 'delivered',
  limit: 50
})

// Process messages
for (const message of messages.items) {
  console.log('Received:', message.payload)

  // Handle different message types
  switch (message.type) {
    case 'data':
      processData(message.payload)
      break
    case 'command':
      executeCommand(message.payload)
      break
    case 'query':
      handleQuery(message.payload)
      break
  }
}
```

### Create Connections

```typescript
// Connect instances
await client.instances.connections.create(instanceId, {
  targetInstanceId: 'target_instance_id',
  configuration: {
    messageFilter: {
      types: ['data', 'event']
    },
    transform: {
      enabled: true,
      rules: ['normalize', 'aggregate']
    }
  }
})

// List connections
const connections = await client.instances.connections.list(instanceId)

// Disconnect
await client.instances.connections.delete(instanceId, connectionId)
```

## Real-Time Updates

### WebSocket Connection

```typescript
const ws = client.instances.realtime.connect(instanceId, {
  token: 'jwt_token'
})

// Subscribe to events
ws.on('message', (event) => {
  console.log('Received message:', event.data)
})

ws.on('stateChanged', (event) => {
  console.log('State changed:', event.newState)
})

ws.on('rateUpdated', (event) => {
  console.log('Rate updated:', event.rate)
})

ws.on('error', (error) => {
  console.error('WebSocket error:', error)
})

// Send real-time messages
ws.send({
  type: 'data',
  payload: { value: 123 }
})

// Close connection
ws.close()
```

### Real-Time Collaboration

```typescript
// Subscribe to instance changes
const subscription = await client.instances.subscribe(instanceId, {
  events: ['rate.changed', 'state.changed', 'message.received'],
  callback: (event) => {
    console.log('Event received:', event)

    // Update UI
    updateDashboard(event)
  }
})

// Unsubscribe later
subscription.unsubscribe()
```

## Confidence Cascades

### Get Confidence Metrics

```typescript
// Get confidence for an instance
const confidence = await client.instances.confidence.get(instanceId)

console.log('Confidence score:', confidence.score)
// Output: 0.87 (87% confidence)

console.log('Factors:', confidence.factors)
// Output: [
//   { name: 'data_quality', value: 0.92, weight: 0.3 },
//   { name: 'model_accuracy', value: 0.85, weight: 0.5 },
//   { name: 'rate_consistency', value: 0.78, weight: 0.2 }
// ]
```

### Adjust Confidence

```typescript
// Manually adjust confidence
await client.instances.confidence.adjust(instanceId, {
  adjustment: 0.1, // Increase by 10%
  reason: 'Additional validation data received'
})

// Set absolute confidence
await client.instances.confidence.adjust(instanceId, {
  absoluteValue: 0.95,
  reason: 'Manual override based on expert analysis'
})
```

### Cascade Confidence

```typescript
// Confidence automatically cascades to connected instances
// When instance A's confidence changes, connected instances
// receive updates based on connection weights

// Monitor cascade propagation
const cascadeEvents = await client.instances.confidence.history(instanceId, {
  startTime: Date.now() - 3600000,
  includeCascade: true
})

cascadeEvents.data.forEach(event => {
  if (event.cascaded) {
    console.log(`Cascaded to ${event.targetInstanceId}:`, event.newValue)
  }
})
```

## Advanced Patterns

### Deadband Triggers

```typescript
// Configure deadband for rate changes
const instance = await client.instances.create({
  type: 'process',
  name: 'Alert System',
  configuration: {
    deadband: {
      enabled: true,
      threshold: 5.0, // Trigger when rate changes by >5
      hysteresis: 2.0 // Reset when change drops to <3
    }
  }
})

// The instance will automatically activate when rate changes exceed threshold
```

### Instance Composition

```typescript
// Create composite instance
const composite = await client.instances.create({
  type: 'process',
  name: 'Data Pipeline',
  capabilities: ['compose'],
  initialData: {
    composition: [
      { instanceId: 'data_collector', role: 'source' },
      { instanceId: 'data_transformer', role: 'processor' },
      { instanceId: 'data_sink', role: 'destination' }
    ]
  }
})

// Messages flow through the composition automatically
```

### Error Handling and Retries

```typescript
// Implement retry logic with exponential backoff
async function executeWithRetry(instanceId, operation, maxRetries = 3) {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation(instanceId)
    } catch (error) {
      lastError = error

      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
        await sleep(delay)
      } else {
        throw error // Don't retry non-rate-limit errors
      }
    }
  }

  throw lastError
}

// Usage
const result = await executeWithRetry(instanceId, async (id) => {
  return await client.instances.rate.update(id, { value: 42 })
})
```

### Monitoring and Alerting

```typescript
// Set up monitoring for critical instances
async function monitorInstance(instanceId) {
  const confidence = await client.instances.confidence.get(instanceId)

  if (confidence.score < 0.5) {
    // Low confidence alert
    await sendAlert({
      severity: 'high',
      message: `Instance ${instanceId} has low confidence: ${confidence.score}`,
      instanceId
    })
  }

  const status = await client.instances.get(instanceId)
  if (status.state === 'error') {
    // Error state alert
    await sendAlert({
      severity: 'critical',
      message: `Instance ${instanceId} is in error state`,
      instanceId
    })
  }
}

// Run monitoring every minute
setInterval(() => {
  client.instances.list({ state: 'running' }).then(instances => {
    instances.items.forEach(instance => monitorInstance(instance.id))
  })
}, 60000)
```

## Complete Example: Building a Distributed Sensor Network

```typescript
import { SuperInstanceClient } from '@superinstance/sdk'

const client = new SuperInstanceClient({
  apiKey: process.env.SUPERINSTANCE_API_KEY
})

async function deploySensorNetwork() {
  // Create data collector instances for each sensor
  const sensors = await Promise.all([
    client.instances.create({
      type: 'data_block',
      name: 'Temperature Sensor A1',
      capabilities: ['temperature_reading']
    }),
    client.instances.create({
      type: 'data_block',
      name: 'Humidity Sensor B1',
      capabilities: ['humidity_reading']
    }),
    client.instances.create({
      type: 'data_block',
      name: 'Pressure Sensor C1',
      capabilities: ['pressure_reading']
    })
  ])

  // Create aggregator instance
  const aggregator = await client.instances.create({
    type: 'process',
    name: 'Sensor Data Aggregator',
    capabilities: ['aggregate', 'normalize', 'validate']
  })

  // Connect sensors to aggregator
  await Promise.all(
    sensors.map(sensor =>
      client.instances.connections.create(sensor.id, {
        targetInstanceId: aggregator.id,
        configuration: {
          messageFilter: { types: ['data'] }
        }
      })
    )
  )

  // Subscribe to aggregated data
  const ws = client.instances.realtime.connect(aggregator.id)
  ws.on('message', (event) => {
    console.log('Aggregated data:', event.data)

    // Send to dashboard or storage
    forwardToDashboard(event.data)
  })

  // Set up monitoring
  setInterval(async () => {
    const confidence = await client.instances.confidence.get(aggregator.id)
    console.log('Aggregator confidence:', confidence.score)
  }, 60000)

  return { sensors, aggregator }
}

deploySensorNetwork().then(network => {
  console.log('Sensor network deployed:', network)
})
```

## Best Practices

### 1. Use Appropriate Instance Types

Choose the right instance type for your use case:
- **data_block**: For data storage and retrieval
- **process**: For data processing and transformation
- **api**: For API wrappers and external integrations
- **learning_agent**: For AI/ML models and adaptive behavior
- **terminal**: For interactive sessions and debugging
- **smpbot**: For autonomous agents and bots

### 2. Monitor Confidence Scores

Regularly check confidence scores to ensure reliable outputs:
- Set alerts for low confidence
- Track confidence trends over time
- Adjust confidence based on validation data

### 3. Implement Proper Error Handling

Always handle errors gracefully:
- Check error codes and messages
- Implement retry logic for transient failures
- Log errors for debugging

### 4. Use Rate-Based Features

Leverage rate-based operations for predictive insights:
- Track rate changes over time
- Use predictions for proactive actions
- Configure deadbands for efficient updates

### 5. Secure Your Instances

Implement proper security measures:
- Use API keys and JWT tokens
- Set appropriate isolation levels
- Enable audit logging for compliance

## Troubleshooting

### Common Issues

**Instance not responding**
- Check instance state using `instances.get()`
- Review error logs
- Verify resource allocation

**Rate limit exceeded**
- Implement exponential backoff
- Consider upgrading your plan
- Use batch operations

**WebSocket connection fails**
- Verify JWT token is valid
- Check network connectivity
- Ensure instance is in running state

**Low confidence scores**
- Review confidence factors
- Check data quality
- Validate model accuracy

## Next Steps

- **[API Reference](/api/overview)**: Complete API documentation
- **[SDK Documentation](/developer/sdk/)**: SDK-specific guides
- **[API Explorer](/developer/explorer/)**: Interactive API testing
- **[Tutorials](/developer/tutorials/)**: Step-by-step tutorials
