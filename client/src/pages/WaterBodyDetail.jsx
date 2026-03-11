import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import WQIHero from '../components/dashboard/WQIHero';
import ParameterCards from '../components/dashboard/ParameterCards';
import WQITrendsChart from '../components/dashboard/WQITrendsChart';
import HealthAdvice from '../components/dashboard/HealthAdvice';
import HistoricalData from '../components/dashboard/HistoricalData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getWaterBody, getWaterBodyReadings, getWaterBodyTrends, getHealthAdvice } from '../services/api';

export default function WaterBodyDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [readings, setReadings] = useState([]);
  const [trends, setTrends] = useState(null);
  const [healthAdvice, setHealthAdvice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [wbRes, readingsRes, trendsRes] = await Promise.all([
          getWaterBody(id),
          getWaterBodyReadings(id, { limit: 12 }),
          getWaterBodyTrends(id)
        ]);
        setData(wbRes.data.data);
        setReadings(readingsRes.data.data);
        setTrends(trendsRes.data.data);

        const category = wbRes.data.data.latestReading?.category;
        if (category) {
          try {
            const advRes = await getHealthAdvice(category);
            setHealthAdvice(advRes.data.data);
          } catch (e) { /* non-critical */ }
        }
      } catch (err) {
        console.error('Error loading water body:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="error-message">Water body not found</div>;

  const latest = data.latestReading;
  const wqi = latest?.wqi || 0;

  return (
    <div className="container water-body-detail-page">
      <div className="breadcrumb animate-fadeIn">
        <Link to="/" className="breadcrumb-link">Dashboard</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to={`/dashboard/${data.city?.toLowerCase()}`} className="breadcrumb-link">{data.city}</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">{data.name}</span>
      </div>

      <WQIHero
        wqi={wqi}
        category={latest?.category}
        city={data.name}
        state={`${data.city}, Karnataka`}
        lastUpdated={latest?.date}
        waterBodyCount={1}
      />

      <div className="flex gap-2.5 flex-wrap mb-8" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-full text-[0.8rem] text-[var(--color-text-secondary)]"><span>🏞️</span> {data.type?.charAt(0).toUpperCase() + data.type?.slice(1)}</div>
        {data.area && <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-full text-[0.8rem] text-[var(--color-text-secondary)]"><span>📐</span> {data.area}</div>}
        {data.monitoringStation && <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-full text-[0.8rem] text-[var(--color-text-secondary)]"><span>📡</span> {data.monitoringStation}</div>}
        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-full text-[0.8rem] text-[var(--color-text-secondary)]"><span>📍</span> {data.latitude?.toFixed(4)}°N, {data.longitude?.toFixed(4)}°E</div>
      </div>

      <div className="flex flex-col gap-[30px]">
        {data.description && (
          <div className="glass-card" style={{ animation: 'fadeInUp 0.5s ease-out 0.15s both', background: 'rgba(255,255,255,0.015)' }}>
            <p className="text-[0.9rem] text-[var(--color-text-secondary)] leading-relaxed">{data.description}</p>
          </div>
        )}

        {latest && <ParameterCards parameters={latest.parameters} />}

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[30px]">
          <div className="flex flex-col gap-[30px]">
            {trends && <WQITrendsChart readings={trends} />}
            {readings.length > 0 && <HistoricalData readings={readings} />}
          </div>
          <div className="flex flex-col gap-[30px]">
            <HealthAdvice advice={healthAdvice} category={latest?.category} />
          </div>
        </div>
      </div>
    </div>
  );
}
