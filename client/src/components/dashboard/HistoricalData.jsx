import { formatDate, getParamInfo, getStatusColor } from '../../utils/wqiHelpers';

export default function HistoricalData({ readings }) {
  if (!readings || readings.length === 0) return null;
  const mainParams = ['ph', 'dissolvedOxygen', 'bod', 'cod', 'totalColiform', 'turbidity', 'tds', 'nitrate'];

  return (
    <div className="glass-card historical-data-card" style={{ animation: 'fadeInUp 0.6s ease-out 0.35s both' }}>
      <div className="section-header">
        <h2 className="section-title"><span>📋</span> Historical Data</h2>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {['Date', 'WQI', 'Category', ...mainParams.map(k => getParamInfo(k).label)].map(h => (
                <th key={h} className="px-3.5 py-3 text-left font-bold text-[0.72rem] text-[var(--color-text-secondary)] uppercase tracking-wide border-b border-white/[0.06]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {readings.map((r, idx) => (
              <tr key={idx} className="animate-fadeIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                <td>{formatDate(r.date)}</td>
                <td>
                  <span className="table-score" style={{ color: getStatusColor(r.category === 'Excellent' || r.category === 'Good' ? 'Good' : r.category === 'Moderate' ? 'Moderate' : 'Poor') }}>
                    {r.wqi}
                  </span>
                </td>
                <td><span className={`wqi-badge ${r.category?.toLowerCase().replace(/\s+/g, '-')}`}>{r.category}</span></td>
                {mainParams.map(key => {
                  const param = r.parameters?.[key];
                  return (
                    <td key={key}>
                      {param ? <span style={{ color: getStatusColor(param.status) }}>{typeof param.value === 'number' ? param.value.toLocaleString() : '--'}</span> : '--'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
