# Getting Started with Spreadsheet Moment

Welcome to Spreadsheet Moment! This guide will help you get up and running quickly.

---

## Quick Start (5 Minutes)

### 1. Choose Your Deployment Method

#### Option A: Cloudflare Workers (Recommended - No Infrastructure)
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy
```

#### Option B: Docker (Self-Hosted)
```bash
docker pull superinstance/spreadsheet-moment:latest
docker run -p 8080:8080 superinstance/spreadsheet-moment
```

#### Option C: Local Python
```bash
pip install spreadsheet-moment
spreadsheet-moment serve --port 8080
```

### 2. Open Your Browser

Navigate to `http://localhost:8080` (or your Cloudflare Workers URL)

### 3. Create Your First Agent Cell

1. Click "New Spreadsheet"
2. Click any cell
3. Type: `=AGENT("Hello, I'm a SuperInstance cell!")`
4. Press Enter
5. Watch your cell come alive!

---

## First Steps

### Create a Temperature Monitor

```excel
Cell A1: =SERIAL_READ("COM3", 9600)    # Arduino temperature
Cell A2: =AGENT(A1, "monitor", "alert if > 100")  # Monitor
Cell A3: =IF(A2.value > 100, EMAIL_ALERT("admin@example.com"), "OK")
```

### Create a Trading Bot

```excel
Cell A1: =HTTP_GET("https://api.coinbase.com/BTC-USD/ticker")
Cell A2: =AGENT(A1.price, "predict", "using model GPT-4")
Cell A3: =IF(A2.confidence > 0.8, TRADE("BTC", "BUY", 0.1), "HOLD")
```

### Create a Home Automation System

```excel
Cell A1: =MQTT_SUBSCRIBE("home/livingroom/temp")
Cell A2: =AGENT(A1, "thermostat", "maintain 72°F")
Cell A3: =I2C_WRITE("ESP32_Thermostat", A2.adjustment)
```

---

## Next Steps

1. 📖 Read [Architecture Overview](ARCHITECTURE.md)
2. 🔌 Learn about [I/O Connections](IO_CONNECTIONS.md)
3. 🤖 Explore [Cell Agent API](CELL_AGENT_API.md)
4. 🚀 Check [Deployment Guide](DEPLOYMENT.md)
5. 💡 Browse [Examples](../examples/)

---

## Need Help?

- 📚 [Documentation](https://docs.superinstance.ai)
- 💬 [Community Discord](https://discord.gg/superinstance)
- 📧 Email: support@superinstance.ai
- 🐛 [Report Issues](https://github.com/SuperInstance/spreadsheet-moment/issues)

---

Happy spreadsheeting! 🚀
