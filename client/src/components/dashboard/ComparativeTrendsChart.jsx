import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { getWaterBodyTrends } from '../../services/api';
import { getWQIColor } from '../../utils/wqiHelpers';

// A predefined list of distinct colors for the different lines
const LINE_COLORS = [
  '#00e5ff', '#ff3d00', '#7c4dff', '#00e676', '#ffea00', '#f50057', '#00b0ff', '#1de9b6'
];

export default function ComparativeTrendsChart({ waterBodies }) {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track which waterbodies are active/selected for comparison
  // By default, let's select the first 3 to prevent the chart from being too cluttered
  const [activeIds, setActiveIds] = useState([]);

  useEffect(() => {
    if (waterBodies && waterBodies.length > 0) {
      setActiveIds(waterBodies.slice(0, 3).map(wb => wb._id || wb.id));
    }
  }, [waterBodies]);

  useEffect(() => {
    const fetchAllTrends = async () => {
      if (!waterBodies || waterBodies.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch trends for all active IDs in parallel
        const promises = activeIds.map(id => getWaterBodyTrends(id));
        const responses = await Promise.allSettled(promises);

        // Map the responses back to the water body info
        const successfulTrends = responses
          .map((res, index) => {
            if (res.status === 'fulfilled' && res.value.data.data) {
              const wbId = activeIds[index];
              const wbInfo = waterBodies.find(w => (w._id || w.id) === wbId);
              return {
                id: wbId,
                name: wbInfo ? wbInfo.name : 'Unknown',
                readings: res.value.data.data
              };
            }
            return null;
          })
          .filter(Boolean);

        setTrendData(successfulTrends);
      } catch (err) {
        console.error("Error fetching comparative trends:", err);
        setError("Failed to load comparative trend data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllTrends();
  }, [activeIds, waterBodies]);

  // Transform the multi-series data into an array of objects for Recharts
  // e.g., { date: 'Jan 24', 'Bellandur Lake': 25, 'Ulsoor Lake': 65 }
  const chartData = useMemo(() => {
    if (trendData.length === 0) return [];

    // We assume all water bodies have readings for the same 12 months in our seed data
    // We'll use the first one's dates as the baseline
    const baseReadings = [...trendData[0].readings].reverse();

    return baseReadings.map((baseReading, index) => {
      const dateStr = new Date(baseReading.date || (baseReading._id?.year && `${baseReading._id.year}-${baseReading._id.month}`)).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

      const dataPoint = { date: dateStr };

      trendData.forEach(wbTrend => {
        // Find the matching reading (or just match by index since they're sequential)
        const reading = [...wbTrend.readings].reverse()[index];
        if (reading) {
          dataPoint[wbTrend.name] = Math.round(reading.avgWQI || reading.wqi);
        }
      });

      return dataPoint;
    });
  }, [trendData]);

  // Generate technical interpretation
  const interpretation = useMemo(() => {
    if (trendData.length < 2) return null;

    let worstLake = { name: '', score: 100 };
    let bestLake = { name: '', score: 0 };

    trendData.forEach(wb => {
      const latest = wb.readings[0]; // First is latest from API
      const latestWqi = Math.round(latest?.avgWQI || latest?.wqi || 0);

      if (latestWqi < worstLake.score) { worstLake = { name: wb.name, score: latestWqi }; }
      if (latestWqi > bestLake.score) { bestLake = { name: wb.name, score: latestWqi }; }
    });

    if (worstLake.name === bestLake.name) return "All monitored locations currently show similar water quality levels.";

    return `Technical Analysis: Amongst the selected water bodies, ${bestLake.name} maintains the highest quality (${bestLake.score} WQI), 
    while ${worstLake.name} is showing the most degraded state (${worstLake.score} WQI). Variance between the two highlights significantly different environmental pressures or treatment efficacy.`;
  }, [trendData]);

  const toggleWaterBody = (id) => {
    setActiveIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id); // Remove
      } else {
        if (prev.length >= 5) return prev; // Limit to 5 max for readability
        return [...prev, id]; // Add
      }
    });
  };

  if (!waterBodies || waterBodies.length < 2) return null;

  return (
    <div className="glass-card comparative-trends-card animate-fadeInUp" style={{ animationDelay: '0.3s', marginTop: '30px' }}>
      <div className="section-header" style={{ marginBottom: '10px' }}>
        <h2 className="section-title"><span>📊</span> Comparative Trend Analysis</h2>
        <span className="section-subtitle">Select up to 5 locations to compare</span>
      </div>

      {/* Location Selector Chips */}
      <div className="location-selector-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {waterBodies.map(wb => {
          const id = wb._id || wb.id;
          const isActive = activeIds.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggleWaterBody(id)}
              className={`chip ${isActive ? 'active' : ''}`}
              style={{
                background: isActive ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)'}`,
                color: isActive ? '#00e5ff' : 'var(--color-text-secondary)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: (!isActive && activeIds.length >= 5) ? 0.5 : 1
              }}
            >
              {wb.name}
            </button>
          )
        })}
      </div>

      <div className="chart-container-wrapper" style={{ height: '350px', position: 'relative', width: '100%' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Loading comparative data...</span>
          </div>
        ) : error ? (
          <div style={{ color: 'var(--color-wqi-verypoor)', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b72a8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#6b72a8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(17, 22, 56, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                  itemStyle={{ fontSize: '0.85rem', fontWeight: 600 }}
                  labelStyle={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '0.8rem' }} />

                <ReferenceLine y={70} stroke="#69f0ae" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={50} stroke="#ffd740" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={30} stroke="#ff5252" strokeDasharray="3 3" strokeOpacity={0.3} />

                {trendData.map((wb, index) => (
                  <Line
                    key={wb.name}
                    type="monotone"
                    dataKey={wb.name}
                    stroke={LINE_COLORS[index % LINE_COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 3, fill: LINE_COLORS[index % LINE_COLORS.length], strokeWidth: 0 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {interpretation && (
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', borderLeft: '4px solid #7c4dff' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#7c4dff' }}>Insight & Interpretation</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{interpretation}</p>
        </div>
      )}
    </div>
  );
}
