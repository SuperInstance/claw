# I/O Connections Guide

Spreadsheet Moment supports universal I/O - connect any cell to anything!

## Supported I/O Types

### Hardware Connections

#### Arduino (Serial/USB)
```
=SERIAL_OPEN("COM3", 9600)
=SERIAL_READ(cell, "format")
=SERIAL_WRITE(cell, "command")
=SERIAL_CLOSE(cell)
```

#### ESP32 (WiFi)
```
=ESP32_CONNECT("192.168.1.100", "password")
=ESP32_READ_PIN(cell, pin, mode)
=ESP32_WRITE_PIN(cell, pin, value)
=ESP32_PWM(cell, pin, duty_cycle)
```

#### Raspberry Pi (GPIO)
```
=GPIO_SETUP(pin, mode)
=GPIO_READ(pin)
=GPIO_WRITE(pin, value)
=I2C_WRITE(address, data)
=SPI_TRANSFER(device, data)
```

### Network Connections

#### HTTP/HTTPS
```
=HTTP_GET(url, headers)
=HTTP_POST(url, body, headers)
=HTTP_STREAM(url, handler)
```

#### WebSocket
```
=WS_CONNECT(url)
=WS_SEND(cell, message)
=WS_SUBSCRIBE(cell, topic)
=WS_ON_MESSAGE(cell, handler)
```

#### MQTT
```
=MQTT_CONNECT(broker, port)
=MQTT_SUBSCRIBE(topic)
=MQTT_PUBLISH(topic, message)
=MQTT_UNSUBSCRIBE(topic)
```

### File Connections

#### CSV Files
```
=CSV_OPEN(path)
=CSV_READ_CELL(cell, row, col)
=CSV_WRITE_CELL(cell, row, col, value)
=CSV_CLOSE(cell)
```

#### JSON Files
```
=JSON_READ(path, query)
=JSON_WRITE(path, data)
=JSON_STREAM(path, handler)
```

### Service Connections

#### Databases
```
=DB_CONNECT(type, connection_string)
=DB_QUERY(cell, sql)
=DB_EXECUTE(cell, statement)
=DB_CLOSE(cell)
```

#### APIs
```
=API_CALL(service, endpoint, params)
=API_STREAM(service, endpoint, handler)
=API_WEBHOOK(cell, trigger_url)
```

## Configuration

### I/O Cell Setup

```excel
Cell A1: =IO_CONFIG({
  "type": "serial",
  "port": "COM3",
  "baudrate": 9600,
  "on_data": "PARSE_AND_UPDATE"
})

Cell A2: =IO_READ(A1, "temperature")
Cell A3: =AGENT(A2, "monitor", "alert if > 100")
Cell A4: =IF(A3.alert, IO_WRITE(A1, "SHUTDOWN"), "OK")
```

### Streaming I/O

```excel
Cell A1: =HTTP_STREAM("https://api.example.com/data", 
  lambda(data): UPDATE_CELL(data))

Cell A2: =AGENT(A1, "process", "moving_average")
Cell A3: =CHART(A2.history, "line")
```

### Bidirectional I/O

```excel
Cell A1: =WS_CONNECT("wss://example.com/stream")
Cell A2: =WS_SEND(A1, JSON_STRING({"action": "subscribe"}))
Cell A3: =WS_ON_MESSAGE(A1, 
  lambda(msg): PARSE_JSON(msg).extract("price"))
```

## Error Handling

```excel
Cell A1: =TRY(IO_READ("COM3"), 
  ON_ERROR: "Retry in 5s", 
  MAX_RETRIES: 3)

Cell A2: =IF(IS_ERROR(A1), 
  LOG_ERROR(A1), 
  PROCESS(A1))
```

## Health Monitoring

```excel
Cell A1: =IO_HEALTH("COM3")
Cell A2: =IF(A1.status == "disconnected", 
  ALERT_ADMIN(), 
  "OK")
```

## Best Practices

1. Always check I/O health before operations
2. Use appropriate error handling
3. Close connections when done
4. Monitor resource usage
5. Use streaming for continuous data
