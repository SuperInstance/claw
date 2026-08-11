import React from 'react';

function Examples() {
  const examples = [
    {
      title: 'Smart Thermostat',
      description: 'Monitor temperature, predict future values, and control HVAC systems.',
      cells: [
        { formula: '=SERIAL_READ("COM3", 9600)', label: 'Read Arduino temperature sensor' },
        { formula: '=PREDICTOR(A1, {"lookback": 100})', label: 'Predict next hour temperature' },
        { formula: '=CONTROLLER(72, A2, {"Kp": 2.0})', label: 'Calculate HVAC adjustment' },
        { formula: '=SERIAL_WRITE("COM3", A3)', label: 'Send control command' }
      ],
      icon: '🌡️'
    },
    {
      title: 'Crypto Trading Bot',
      description: 'Connect to exchanges, analyze trends, and execute trades automatically.',
      cells: [
        { formula: '=HTTP_GET("https://api.coinbase.com/BTC-USD/ticker")', label: 'Get current price' },
        { formula: '=AGENT(A1, "predict", "using LSTM model")', label: 'AI prediction' },
        { formula: '=IF(A2.confidence > 0.8, TRADE("BTC", "BUY", 0.1))', label: 'Execute trade' }
      ],
      icon: '💹'
    },
    {
      title: 'Home Security',
      description: 'Monitor sensors, detect anomalies, and send alerts.',
      cells: [
        { formula: '=MQTT_SUBSCRIBE("home/sensors/motion")', label: 'Motion sensor feed' },
        { formula: '=AGENT(A1, "detect", "unusual patterns")', label: 'AI anomaly detection' },
        { formula: '=IF(A2.alert == true, SEND_EMAIL("admin@example.com"))', label: 'Send alert' }
      ],
      icon: '🔒'
    },
    {
      title: 'Quality Control',
      description: 'Computer vision inspection for manufacturing defects.',
      cells: [
        { formula: '=CAMERA_CAPTURE("inspection_cam")', label: 'Capture image' },
        { formula: '=AGENT(A1, "vision", "detect defects")', label: 'AI vision analysis' },
        { formula: '=IF(A2.defects > 0, CONVEYOR("reject"))', label: 'Sort product' }
      ],
      icon: '🏭'
    }
  ];

  return (
    <div className="examples-page">
      <div className="container">
        <h1 className="page-title">Examples</h1>
        <p className="page-subtitle">
          Practical examples to get you started with Spreadsheet Moment.
        </p>

        <div className="examples-grid">
          {examples.map((example, index) => (
            <div key={index} className="example-card">
              <div className="example-header">
                <span className="example-icon">{example.icon}</span>
                <h2>{example.title}</h2>
              </div>
              <p className="example-description">{example.description}</p>
              <div className="example-cells">
                {example.cells.map((cell, i) => (
                  <div key={i} className="example-cell">
                    <code>{cell.formula}</code>
                    <span>{cell.label}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary">Try It Yourself</button>
            </div>
          ))}
        </div>

        <section className="tutorials-section">
          <h2>Video Tutorials</h2>
          <p>Step-by-step video guides for common tasks.</p>
          <div className="tutorial-list">
            <div className="tutorial">
              <h3>🎬 Getting Started in 5 Minutes</h3>
              <p>Your first intelligent spreadsheet</p>
            </div>
            <div className="tutorial">
              <h3>🎬 Connecting to Arduino</h3>
              <p>Hardware integration basics</p>
            </div>
            <div className="tutorial">
              <h3>🎬 Building a Trading Bot</h3>
              <p>From API to automation</p>
            </div>
            <div className="tutorial">
              <h3>🎬 Advanced Agent Configuration</h3>
              <p>Custom agent behaviors</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Examples;
