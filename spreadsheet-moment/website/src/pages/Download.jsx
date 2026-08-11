import React from 'react';

function Download() {
  const options = [
    {
      title: 'Cloudflare Workers',
      description: 'Instant deployment, global edge network, pay-per-use pricing.',
      icon: '☁️',
      command: 'npm install -g wrangler && wrangler deploy',
      link: '#cloudflare'
    },
    {
      title: 'Docker',
      description: 'Self-hosted container deployment. Full control over your environment.',
      icon: '🐳',
      command: 'docker pull superinstance/spreadsheet-moment && docker run -p 8080:8080 superinstance/spreadsheet-moment',
      link: '#docker'
    },
    {
      title: 'Local Installation',
      description: 'Run on your own machine. Great for development and offline use.',
      icon: '💻',
      command: 'pip install spreadsheet-moment && spreadsheet-moment serve',
      link: '#local'
    },
    {
      title: 'Spreadsheet Plugins',
      description: 'Integrate directly with Excel, Google Sheets, or LibreOffice.',
      icon: '📊',
      command: 'Coming soon!',
      link: '#plugins'
    }
  ];

  return (
    <div className="download-page">
      <div className="container">
        <h1 className="page-title">Get Spreadsheet Moment</h1>
        <p className="page-subtitle">
          Choose your deployment option and start building intelligent spreadsheets.
        </p>

        <div className="download-options">
          {options.map((option, index) => (
            <div key={index} className="download-option">
              <div className="option-header">
                <span className="option-icon">{option.icon}</span>
                <h2>{option.title}</h2>
              </div>
              <p className="option-description">{option.description}</p>
              <div className="option-command">
                <code>{option.command}</code>
              </div>
              <button className="btn btn-primary">Deploy Now</button>
            </div>
          ))}
        </div>

        <section className="requirements-section">
          <h2>System Requirements</h2>
          <div className="requirements-grid">
            <div className="requirement">
              <h3>Cloudflare Workers</h3>
              <ul>
                <li>Cloudflare account (free tier available)</li>
                <li>Node.js 18+ and npm</li>
                <li>Wrangler CLI</li>
              </ul>
            </div>
            <div className="requirement">
              <h3>Docker</h3>
              <ul>
                <li>Docker Engine 20.10+</li>
                <li>2GB RAM minimum</li>
                <li>10GB disk space</li>
              </ul>
            </div>
            <div className="requirement">
              <h3>Local Installation</h3>
              <ul>
                <li>Python 3.10+</li>
                <li>2GB RAM minimum</li>
                <li>Windows, macOS, or Linux</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="support-section">
          <h2>Need Help?</h2>
          <p>Our community is here to assist you.</p>
          <div className="support-links">
            <a href="https://discord.gg/superinstance" className="support-link">
              <span>💬</span> Join Discord
            </a>
            <a href="https://github.com/SuperInstance/spreadsheet-moment/issues" className="support-link">
              <span>🐛</span> Report Issues
            </a>
            <a href="mailto:support@superinstance.ai" className="support-link">
              <span>📧</span> Email Support
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Download;
