import { Link } from 'react-router-dom';
import { getCategoryClass, getCategoryFromWQI } from '../../utils/wqiHelpers';

export default function LocationsList({ waterBodies, title = "Monitoring Locations" }) {
  if (!waterBodies || waterBodies.length === 0) return null;

  const sorted = [...waterBodies].sort((a, b) => (a.wqi || 0) - (b.wqi || 0));

  return (
    <div className="glass-card locations-list-card" style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
      <div className="section-header">
        <h2 className="section-title"><span>📍</span> {title}</h2>
        <Link to="/locations" className="view-all-link">View All →</Link>
      </div>
      <div className="locations-scroll-area stagger-children">
        {sorted.map((wb, idx) => {
          const catInfo = getCategoryFromWQI(wb.wqi || wb.latestWQI || 0);
          const wqi = wb.wqi || wb.latestWQI;
          const category = wb.category || wb.latestCategory;

          return (
            <Link key={wb._id || wb.id || `loc-${idx}`} to={`/water-body/${wb._id || wb.id}`}
              className="location-list-item">
              <div className="location-info">
                <span className="location-icon">{wb.type === 'lake' ? '🏞️' : wb.type === 'river' ? '🏞️' : '💧'}</span>
                <div>
                  <span className="location-name">{wb.name}</span>
                  <span className="location-meta">{wb.city} • {wb.type}</span>
                </div>
              </div>
              <div className="location-score-badge">
                <span className="location-score" style={{ color: catInfo.color }}>{wqi || '--'}</span>
                <span className={`wqi-badge ${getCategoryClass(category)}`}>{category || 'N/A'}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
