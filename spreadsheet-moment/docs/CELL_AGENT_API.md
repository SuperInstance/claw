# Cell Agent API

Complete reference for programming cell agents in Spreadsheet Moment.

## Agent Creation

### Basic Agent

```
=AGENT(input, "task", "instructions")
```

### Advanced Agent Configuration

```
=AGENT_CONFIG({
  "input": cell_reference,
  "type": "consensus|predictor|controller|monitor",
  "model": "gpt-4|claude|custom",
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 1000
  },
  "constraints": {
    "max_latency": "1s",
    "memory_limit": "1MB"
  },
  "callbacks": {
    "on_update": "function_name",
    "on_error": "error_handler"
  }
})
```

## Agent Types

### Predictor Agent

```
=PREDICTOR(input, {
  "model": "neural_network",
  "lookback": 100,
  "horizon": 10,
  "confidence_threshold": 0.8
})
```

### Controller Agent

```
=CONTROLLER(setpoint, measured_value, {
  "type": "PID",
  "Kp": 1.0,
  "Ki": 0.1,
  "Kd": 0.01,
  "output_range": [0, 100]
})
```

### Monitor Agent

```
=MONITOR(value, {
  "conditions": [
    {"operator": ">", "threshold": 100, "action": "alert"},
    {"operator": "<", "threshold": 0, "action": "shutdown"}
  ],
  "hysteresis": 5
})
```

### Consensus Agent

```
=CONSENSUS(neighbors, {
  "algorithm": "se3_equivariant",
  "tolerance": 0.01,
  "max_iterations": 100,
  "weights": "distance_based"
})
```

## Agent Communication

### Send Message

```
=SEND_MESSAGE(target_cell, message_type, data)
```

### Receive Message

```
=ON_MESSAGE(cell, 
  lambda(msg): PROCESS(msg))
```

### Broadcast

```
=BROADCAST(range, message)
```

### Subscribe to Topic

```
=SUBSCRIBE(topic, handler)
```

## Agent State Management

### Get State

```
=GET_STATE(agent_cell)
```

### Set State

```
=SET_STATE(agent_cell, new_state)
```

### Persist State

```
=PERSIST(agent_cell, storage_location)
```

### Load State

```
=LOAD(agent_cell, storage_location)
```

## Advanced Features

### Multi-Modal Agents

```
=AGENT({
  "text": text_input,
  "image": image_url,
  "audio": audio_url
}, "multimodal", "analyze all inputs")
```

### Ensemble Agents

```
=ENSEMBLE([
  AGENT(input, "model_a"),
  AGENT(input, "model_b"),
  AGENT(input, "model_c")
], "voting")
```

### Hierarchical Agents

```
=HIERARCHY({
  "supervisor": AGENT(all_data, "coordinate"),
  "workers": [
    AGENT(data_a, "process_a"),
    AGENT(data_b, "process_b"),
    AGENT(data_c, "process_c")
  ]
})
```

## Agent Debugging

### View Agent Thoughts

```
=SHOW_THINKING(agent_cell)
```

### Trace Execution

```
=TRACE(agent_cell, "detailed")
```

### Profile Performance

```
=PROFILE(agent_cell)
```

## Examples

### Temperature Control

```
Cell A1: =SERIAL_READ("COM3")
Cell A2: =PREDICTOR(A1, {"lookback": 50})
Cell A3: =CONTROLLER(72, A2, {"Kp": 2, "Ki": 0.5})
Cell A4: =SERIAL_WRITE("COM3", A3.output)
```

### Trading Bot

```
Cell A1: =HTTP_GET("https://api.price.com/BTC")
Cell A2: =PREDICTOR(A1, {"model": "lstm", "horizon": 5})
Cell A3: =IF(A2.confidence > 0.8, 
  TRADE("BTC", A2.direction, 0.1), 
  HOLD)
```

### Quality Control

```
Cell A1: =CAMERA_CAPTURE("inspection_cam")
Cell A2: =AGENT(A1, "vision", "detect defects")
Cell A3: =MONITOR(A2.defect_count, {
  "threshold": 3,
  "action": "REJECT"
})
```

For more examples, see the examples directory.
