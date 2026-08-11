import React from 'react';

function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'Agent-Based Cells',
      description: 'Every cell contains an AI agent powered by SuperInstance technology. Agents can reason, learn, and make autonomous decisions.',
      details: ['Natural language understanding', 'Multi-modal reasoning', 'Evolutionary optimization', 'Distributed consensus']
    },
    {
      icon: '🔌',
      title: 'Universal I/O',
      description: 'Connect cells to any data source or destination. Hardware sensors, web APIs, databases, files - anything with an interface.',
      details: ['Arduino/ESP32 support', 'HTTP/WebSocket connections', 'Serial/USB communication', 'MQTT messaging']
    },
    {
      icon: '⚡',
      title: 'Real-Time Performance',
      description: 'Microsecond latency responses for time-critical applications. Built on cutting-edge research for maximum efficiency.',
      details: ['SE(3)-equivariant consensus', 'Tensor-train compression', 'O(log n) convergence', '1000x data efficiency']
    },
    {
      icon: '🧠',
      title: 'Advanced AI',
      description: 'Powered by breakthrough research from the SuperInstance project. Fractional differential equations, quantum-inspired search, and more.',
      details: ['Neural fractional DEs', 'Evolutionary meta-learning', 'Quantum-informed algorithms', 'Multi-agent coordination']
    },
    {
      icon: '🎨',
      title: 'Multiple Frontends',
      description: 'Choose your interface. Cocapn.ai for playful pirate-themed interaction, or Capitaine.ai for professional maritime styling.',
      details: ['Cocapn.ai - playful theme', 'Capitaine.ai - professional', 'API for custom integrations', 'Plugin system']
    },
    {
      icon: '☁️',
      title: 'Flexible Deployment',
      description: 'Deploy anywhere. Cloudflare Workers for instant global deployment, Docker for self-hosting, or run locally on your machine.',
      details: ['Cloudflare Workers', 'Docker containers', 'Local server', 'Zero cold starts']
    }
  ];

  return (
    <div className="features-page">
      <div className="container">
        <h1 className="page-title">Features</h1>
        <p className="page-subtitle">
          Everything you need to build intelligent, connected spreadsheets.
        </p>

        <div className="features-list">
          {features.map((feature, index) => (
            <div key={index} className="feature-detail">
              <div className="feature-header">
                <span className="feature-icon-large">{feature.icon}</span>
                <h2>{feature.title}</h2>
              </div>
              <p className="feature-description">{feature.description}</p>
              <ul className="feature-details-list">
                {feature.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="performance-section">
          <h2>Performance Benchmarks</h2>
          <div className="benchmark-grid">
            <div className="benchmark">
              <div className="benchmark-value">1000x</div>
              <div className="benchmark-label">Data Efficiency</div>
            </div>
            <div className="benchmark">
              <div className="benchmark-value">O(log n)</div>
              <div className="benchmark-label">Consensus Speed</div>
            </div>
            <div className="benchmark">
              <div className="benchmark-value">100x</div>
              <div className="benchmark-label">Bandwidth Reduction</div>
            </div>
            <div className="benchmark">
              <div className="benchmark-value">&lt;1ms</div>
              <div className="benchmark-label">Cell Update Latency</div>
            </div>
          </div>
        </section>

        <section className="tech-section">
          <h2>Powered by SuperInstance Research</h2>
          <p>
            Built on cutting-edge research from the SuperInstance project, incorporating
            breakthrough insights from protein folding, quantum computing, fractional calculus,
            and evolutionary optimization.
          </p>
          <a href="https://github.com/SuperInstance/spreadsheet-moment/tree/main/papers" className="btn btn-secondary">
            Read the Papers
          </a>
        </section>
      </div>
    </div>
  );
}

export default Features;
