import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getWaterBodies } from '../services/api';
import { getCategoryFromWQI, getCategoryClass } from '../utils/wqiHelpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WQIMap from '../components/dashboard/WQIMap';

export default function Locations() {
  const [searchParams] = useSearchParams();
  const [waterBodies, setWaterBodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: searchParams.get('type') || '',
    search: searchParams.get('search') || '',
    city: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // grid | map

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filter.type) params.type = filter.type;
        if (filter.search) params.search = filter.search;
        if (filter.city) params.city = filter.city;
        const res = await getWaterBodies(params);
        setWaterBodies(res.data.data);
      } catch (err) {
        console.error('Error loading locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const cities = [...new Set(waterBodies.map(wb => wb.city))].sort();

  return (
    <div className="container locations-page">
      <div className="locations-hero animate-fadeInUp">
        <h1 className="kinetic-text">📍 Monitoring Locations</h1>
        <p className="text-secondary">Water quality monitoring stations across Karnataka</p>
      </div>

      <div className="locations-filters animate-fadeInUp">
        <div className="filter-bar">
          <input type="text" placeholder="🔍 Search water bodies..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="filter-input search-input" />
          <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="filter-select">
            <option value="">All Types</option>
            <option value="lake">🏞️ Lakes</option>
            <option value="river">🏞️ Rivers</option>
            <option value="reservoir">💧 Reservoirs</option>
          </select>
          <select value={filter.city} onChange={(e) => setFilter({ ...filter, city: e.target.value })}
            className="filter-select">
            <option value="">All Cities</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          <div className="view-toggle-container">
            <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>⊞ Grid</button>
            <button className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>🗺️ Map</button>
          </div>
        </div>
        <span className="text-[0.8rem] text-[var(--color-text-muted)]">{waterBodies.length} monitoring stations</span>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : viewMode === 'map' ? (
        <WQIMap waterBodies={waterBodies} />
      ) : (
        <div className="locations-grid stagger-children">
          {waterBodies.map(wb => {
            const wqi = wb.latestWQI || 0;
            const catInfo = getCategoryFromWQI(wqi);
            return (
              <Link key={wb._id} to={`/water-body/${wb._id}`} className="glass-card flex flex-col no-underline text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] cursor-pointer hover:-translate-y-1">
                <div className="location-card-header">
                  <span className="location-card-icon">{wb.type === 'lake' ? '🏞️' : wb.type === 'river' ? '🏞️' : '💧'}</span>
                  <span className={`wqi-badge ${getCategoryClass(wb.latestCategory)}`}>{wb.latestCategory || 'N/A'}</span>
                </div>
                <div className="location-card-score" style={{ color: catInfo.color }}>{wqi || '--'}</div>
                <h3 className="location-card-title">{wb.name}</h3>
                <p className="location-card-meta">{wb.city} • {wb.district || 'Karnataka'}</p>
                <div className="location-card-progress-bg">
                  <div className="location-card-progress-fill" style={{ width: `${wqi}%`, background: catInfo.color }}></div>
                </div>
                <span className="location-card-type">{wb.type}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
