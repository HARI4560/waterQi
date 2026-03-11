import { getParamInfo, getStatusColor } from '../../utils/wqiHelpers';

export default function ParameterCards({ parameters }) {
  if (!parameters) return null;

  const paramKeys = ['ph', 'dissolvedOxygen', 'bod', 'cod', 'totalColiform', 'fecalColiform',
    'turbidity', 'temperature', 'conductivity', 'tds', 'nitrate', 'phosphate', 'ammonia', 'chloride', 'hardness'];

  return (
    <div className="parameters-section" style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>
      <div className="section-header">
        <h2 className="section-title"><span>🧪</span> Water Quality Parameters</h2>
        <span className="section-subtitle">KSPCB monitoring data • <a href="https://cpcb.nic.in" target="_blank" rel="noopener noreferrer" className="accent-link">CPCB</a> / BIS 10500 standards</span>
      </div>

      {parameters.eutrophicationStatus && (
        <div className="eutrophication-banner glass-card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', borderLeft: `4px solid ${getEutrophicationColor(parameters.eutrophicationStatus)}` }}>
          <span style={{ fontSize: '2rem' }}>🌿</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Eutrophication Status: <span style={{ color: getEutrophicationColor(parameters.eutrophicationStatus) }}>{parameters.eutrophicationStatus}</span></h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Calculated based on nutrient levels (BOD, Nitrate, Phosphate, Ammonia).</p>
          </div>
        </div>
      )}

      <div className="parameters-grid stagger-children">
        {paramKeys.map(key => {
          const param = parameters[key];
          if (!param || param.value === undefined) return null;
          const info = getParamInfo(key);
          const statusColor = getStatusColor(param.status);

          return (
            <div key={key} className="glass-card param-card interactive">
              <div className="param-header">
                <span className="param-icon">{info.icon}</span>
                <span className="param-status-dot" style={{ background: statusColor }}></span>
              </div>
              <div className="param-value-container">
                <span className="param-value font-display" style={{ color: statusColor }}>
                  {typeof param.value === 'number' ? param.value.toLocaleString() : param.value}
                </span>
                <span className="param-unit">{info.unit || param.unit}</span>
              </div>
              <span className="param-label">{info.label}</span>
              <div className="param-bar-bg">
                <div className="param-bar-fill" style={{ background: statusColor, width: getBarWidth(key, param.value) }}></div>
              </div>
              <span className="param-ideal text-muted">Ideal: {info.ideal}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getBarWidth(key, value) {
  const maxValues = { ph: 14, dissolvedOxygen: 12, bod: 30, cod: 300, totalColiform: 50000, fecalColiform: 10000, turbidity: 100, temperature: 40, conductivity: 2000, tds: 2000, nitrate: 100, phosphate: 5, ammonia: 10, chloride: 600, hardness: 800 };
  return Math.min((value / (maxValues[key] || 100)) * 100, 100) + '%';
}

function getEutrophicationColor(status) {
  if (!status) return '#999';
  if (status.includes('High Risk')) return '#ff5252';
  if (status.includes('Moderate')) return '#ffd740';
  if (status.includes('Low Risk')) return '#69f0ae';
  if (status.includes('Safe')) return '#00e676';
  return '#38bdf8';
}
