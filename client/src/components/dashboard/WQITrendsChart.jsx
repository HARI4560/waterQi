import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getWQIColor } from '../../utils/wqiHelpers';

export default function WQITrendsChart({ readings }) {
  if (!readings || readings.length === 0) return null;

  const data = [...readings].reverse().map(r => ({
    date: new Date(r.date || r._id?.year && `${r._id.year}-${r._id.month}`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    wqi: Math.round(r.avgWQI || r.wqi),
    min: r.minWQI, max: r.maxWQI
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const wqi = payload[0].value;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          <p className="chart-tooltip-value" style={{ color: getWQIColor(wqi) }}>WQI: {wqi}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="trends-chart-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
      <div className="section-header">
        <h2 className="section-title"><span>📈</span> WQI Trends</h2>
        <span className="section-subtitle">Monthly water quality changes</span>
      </div>
      <div className="chart-container-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="wqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#6b72a8" fontSize={11} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#6b72a8" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="#69f0ae" strokeDasharray="5 5" strokeOpacity={0.4} />
            <ReferenceLine y={50} stroke="#ffd740" strokeDasharray="5 5" strokeOpacity={0.4} />
            <ReferenceLine y={30} stroke="#ff5252" strokeDasharray="5 5" strokeOpacity={0.4} />
            <Area type="monotone" dataKey="wqi" stroke="#00bcd4" strokeWidth={2.5}
              fillOpacity={1} fill="url(#wqiGradient)" dot={{ fill: '#00bcd4', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#00bcd4', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        {[{ c: '#69f0ae', l: 'Good (70+)' }, { c: '#ffd740', l: 'Moderate (50+)' }, { c: '#ff5252', l: 'Poor (<30)' }].map(i => (
          <span key={i.l} className="legend-item">
            <span className="legend-dot" style={{ background: i.c }}></span>{i.l}
          </span>
        ))}
      </div>
    </div>
  );
}
