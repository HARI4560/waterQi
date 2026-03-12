import { getCategoryFromWQI, formatDateTime } from '../../utils/wqiHelpers';

export default function WQIHero({ wqi, category, city, state, lastUpdated, waterBodyCount }) {
  const catInfo = getCategoryFromWQI(wqi || 0);
  const circumference = 2 * Math.PI * 90;
  const progress = ((wqi || 0) / 100) * circumference;

  return (
    <div className="wqi-hero glass-card animate-fadeInUp">
      <div className="hero-glow" style={{ background: catInfo.color }}></div>

      <div className="hero-content">
        <div className="hero-gauge-container">
          <svg className="hero-gauge animate-breathe" viewBox="-15 -15 230 230">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="100" cy="100" r="90" fill="none" stroke={catInfo.color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference - progress}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', transition: 'stroke-dashoffset 1.5s ease-out' }}
              filter={`drop-shadow(0 0 12px ${catInfo.color})`} />
            <circle cx="100" cy="100" r="78" fill="rgba(255,255,255,0.02)" />
          </svg>
          <div className="hero-gauge-content">
            <span className="hero-wqi-score drop-shadow-glow" style={{ color: catInfo.color }}>{wqi || '--'}</span>
            <span className="hero-wqi-label">WQI</span>
            <span className={`wqi-badge ${catInfo.class} hero-badge animate-pulse-slow`}>{catInfo.label}</span>
          </div>
        </div>

        <div className="hero-text-content">
          <span className="hero-location-path">India / Karnataka / {city}</span>
          <h1 className="hero-title kinetic-text">{city} Water Quality Index (WQI)</h1>
          <p className="hero-subtitle">Real-time Water Quality Monitoring | {state || 'Karnataka'} | <a href="https://kspcb.karnataka.gov.in/environmental-monitoring/water" target="_blank" rel="noopener noreferrer" className="kspcb-link">KSPCB Data</a></p>
        </div>
      </div>

      <div className="hero-stats-wrapper">
        <div className="hero-stats-grid stagger-children">
          {[
            { icon: '🏞️', value: waterBodyCount || 0, label: 'Monitored Water Bodies' },
            { icon: '📊', value: `${catInfo.emoji} ${catInfo.label}`, label: 'Overall Water Quality' },
            { icon: '🕐', value: lastUpdated ? formatDateTime(lastUpdated) : 'N/A', label: 'Last Updated' },
            { icon: '🗺️', value: 'Karnataka', label: 'State | KSPCB Data' },
          ].map((item, i) => (
            <div key={i} className="hero-stat-card">
              <span className="stat-icon">{item.icon}</span>
              <div>
                <span className="stat-value">{item.value}</span>
                <span className="stat-label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
