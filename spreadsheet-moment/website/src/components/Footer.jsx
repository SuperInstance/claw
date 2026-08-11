import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Spreadsheet Moment</h3>
            <p>Revolutionary spreadsheet technology where every cell is an intelligent agent.</p>
          </div>
          
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="/features">Features</a></li>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/examples">Examples</a></li>
              <li><a href="/download">Download</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Community</h4>
            <ul>
              <li><a href="https://github.com/SuperInstance/spreadsheet-moment">GitHub</a></li>
              <li><a href="https://discord.gg/superinstance">Discord</a></li>
              <li><a href="https://twitter.com/superinstance">Twitter</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>SuperInstance</h4>
            <ul>
              <li><a href="https://superinstance.ai">Website</a></li>
              <li><a href="https://cocapn.ai">Cocapn</a></li>
              <li><a href="https://capitaine.ai">Capitaine</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 SuperInstance Project. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
