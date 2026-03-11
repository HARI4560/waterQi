import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {

  return (
    <nav className="navbar-wrapper">
      <div className="container navbar">
        {/* Brand */}
        <Link to="/" className="brand-wrapper">
          <svg className="brand-logo" viewBox="0 0 40 40" fill="none" width="36" height="36">
            <circle cx="20" cy="20" r="18" stroke="url(#grad)" strokeWidth="2.5" fill="none" />
            <path d="M20 8 C20 8 12 18 12 23 C12 27.4 15.6 31 20 31 C24.4 31 28 27.4 28 23 C28 18 20 8 20 8Z" fill="url(#grad)" opacity="0.8" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="#00bcd4" />
                <stop offset="100%" stopColor="#2979ff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="brand-text">
            <span className="brand-title">WaterQI</span>
          </div>
        </Link>
        {/* Nav Links */}
        <div className="nav-controls">
          <div className="nav-links">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/locations" className="nav-link">Locations</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
