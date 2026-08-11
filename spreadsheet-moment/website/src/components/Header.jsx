import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">Spreadsheet Moment</span>
        </Link>
        
        <nav className="nav">
          <Link to="/features">Features</Link>
          <Link to="/docs">Documentation</Link>
          <Link to="/examples">Examples</Link>
          <Link to="/download" className="btn btn-primary">Get Started</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
