import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WQIHero from '../components/dashboard/WQIHero';
import ParameterCards from '../components/dashboard/ParameterCards';
import WQITrendsChart from '../components/dashboard/WQITrendsChart';
import LocationsList from '../components/dashboard/LocationsList';
import WQIMap from '../components/dashboard/WQIMap';
import HealthAdvice from '../components/dashboard/HealthAdvice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getCityDashboard, getDashboardOverview, getHealthAdvice, getWaterBodyTrends } from '../services/api';

export default function Dashboard() {
  const { city } = useParams();
  const displayCity = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'Bangalore';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthAdvice, setHealthAdvice] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        if (city) {
          response = await getCityDashboard(displayCity);
        } else {
          response = await getDashboardOverview();
        }
        setData(response.data.data);

        const category = response.data.data.category ||
          (response.data.data.overallWQI >= 70 ? 'Good' : response.data.data.overallWQI >= 50 ? 'Moderate' : 'Poor');
        try {
          const adviceRes = await getHealthAdvice(category);
          setHealthAdvice(adviceRes.data.data);
        } catch (e) { /* non-critical */ }

        const wbs = response.data.data.waterBodies || [];
        if (wbs.length > 0) {
          const firstWb = wbs.find(w => w.wqi || w.latestWQI) || wbs[0];
          try {
            const trendsRes = await getWaterBodyTrends(firstWb._id || firstWb.id);
            setTrends(trendsRes.data.data);
          } catch (e) { /* non-critical */ }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city, displayCity]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!data) return <div className="error-message">No data found</div>;

  return (
    <div className="container dashboard-layout animate-fadeIn" style={{ animationDelay: '0.1s' }}>
      {/* Left Column (Main Stats & Visuals) */}
      <div className="dashboard-column">
        <WQIHero
          wqi={data.overallWQI}
          category={data.category}
          city={displayCity}
          state={data.state}
          lastUpdated={data.lastUpdated}
          waterBodyCount={data.waterBodies?.length || 0}
        />

        {data.waterBodies && data.waterBodies.length > 0 && (
          <WQIMap waterBodies={data.waterBodies} />
        )}

        <ParameterCards parameters={data.avgParameters} />

        {trends && trends.length > 0 && (
          <WQITrendsChart readings={trends} />
        )}
      </div>

      {/* Right Column (Sidebar) */}
      <div className="dashboard-column">
        <HealthAdvice advice={healthAdvice} category={data.category || 'Good'} />
        <LocationsList waterBodies={data.waterBodies} title={`Monitoring Stations in ${displayCity}`} />
      </div>
    </div>
  );
}
