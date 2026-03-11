import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-brand">💧 WaterQI</h3>
            <p className="footer-desc">
              Real-time Water Quality Index monitoring for Karnataka's lakes, rivers, and reservoirs. Powered by KSPCB data.
            </p>

          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '16px' }}>QUICK LINKS</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>Dashboard</Link></li>
              <li><Link to="/locations" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>All Locations</Link></li>
              <li><Link to="/dashboard/bangalore" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>Bangalore</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '16px' }}>WATER BODIES</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/locations?type=lake" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>Lakes</Link></li>
              <li><Link to="/locations?type=river" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>Rivers</Link></li>
              <li><Link to="/locations?type=reservoir" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>Reservoirs</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} WaterQI — Karnataka Water Quality Monitoring Dashboard
          </p>
        </div>
      </div>
    </footer>
  );
}
