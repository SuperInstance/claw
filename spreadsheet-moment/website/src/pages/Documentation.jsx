import React from 'react';

function Documentation() {
  const docs = [
    {
      title: 'Getting Started',
      description: 'Get up and running with Spreadsheet Moment in 5 minutes.',
      link: '/docs/getting-started'
    },
    {
      title: 'Architecture',
      description: 'Understand how Spreadsheet Moment works under the hood.',
      link: '/docs/architecture'
    },
    {
      title: 'Cell Agent API',
      description: 'Complete reference for programming cell agents.',
      link: '/docs/cell-agent-api'
    },
    {
      title: 'I/O Connections',
      description: 'Connect cells to hardware, networks, and services.',
      link: '/docs/io-connections'
    },
    {
      title: 'Deployment Guide',
      description: 'Deploy to Cloudflare Workers, Docker, or run locally.',
      link: '/docs/deployment'
    },
    {
      title: 'Examples',
      description: 'Practical examples for common use cases.',
      link: '/docs/examples'
    }
  ];

  return (
    <div className="documentation-page">
      <div className="container">
        <h1 className="page-title">Documentation</h1>
        <p className="page-subtitle">
          Everything you need to master Spreadsheet Moment.
        </p>

        <div className="docs-grid">
          {docs.map((doc, index) => (
            <a key={index} href={doc.link} className="doc-card">
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
              <span className="doc-link">Read More →</span>
            </a>
          ))}
        </div>

        <section className="additional-resources">
          <h2>Additional Resources</h2>
          <div className="resources-list">
            <a href="https://github.com/SuperInstance/spreadsheet-moment" className="resource-link">
              <span className="resource-icon">📦</span>
              <div>
                <h3>GitHub Repository</h3>
                <p>Source code, issues, and contributions</p>
              </div>
            </a>
            <a href="https://discord.gg/superinstance" className="resource-link">
              <span className="resource-icon">💬</span>
              <div>
                <h3>Community Discord</h3>
                <p>Chat with other users and developers</p>
              </div>
            </a>
            <a href="https://youtube.com/@superinstance" className="resource-link">
              <span className="resource-icon">🎥</span>
              <div>
                <h3>Video Tutorials</h3>
                <p>Step-by-step guides and examples</p>
              </div>
            </a>
            <a href="https://superinstance.ai/blog" className="resource-link">
              <span className="resource-icon">📝</span>
              <div>
                <h3>Blog</h3>
                <p>Latest updates and deep dives</p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Documentation;
