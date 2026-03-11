import { getCategoryInfo } from '../../utils/wqiHelpers';
import { useMemo } from 'react';

export default function HealthAdvice({ advice, category }) {
  if (!advice) {
    const catInfo = getCategoryInfo(category);
    return (
      <div className="glass-card health-advice-card" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
        <div className="section-header">
          <h2 className="section-title"><span>🏥</span> Health Advisory</h2>
        </div>
        <div className="health-advice-banner">
          <span className="health-emoji">{catInfo.emoji}</span>
          <div>
            <h3 className="health-title" style={{ color: catInfo.color }}>{catInfo.label} Water Quality</h3>
            <p className="health-description">Water quality is categorized as <strong>{catInfo.label}</strong>. Check detailed parameters for specific usage suitability.</p>
          </div>
        </div>
      </div>
    );
  }

  const impactData = useMemo(() => {
    if (!advice) return null;
    return calculateSewageEquivalence(category, advice.category);
  }, [advice, category]);

  return (
    <div className="glass-card health-advice-card" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
      <div className="section-header">
        <h2 className="section-title"><span>🏥</span> Health Advisory</h2>
        <span className={`wqi-badge ${getCategoryInfo(advice.category).class}`}>{advice.category}</span>
      </div>

      {impactData && impactData.drops > 0 && (
        <div className="impact-banner">
          <div className="impact-main">
            <span className="impact-number" style={{ color: impactData.color }}>{impactData.drops}</span>
            <span className="impact-text" style={{ color: impactData.color }}>Drops of Raw<br/>Sewage <span style={{fontSize: '0.65rem', color: 'var(--color-text-muted)'}}>(per glass)</span></span>
          </div>
          <div className="impact-visual">
            <div className="toxic-drop-container">
              <div className="toxic-ripple" style={{ borderColor: impactData.color }}></div>
              <div className="toxic-drop" style={{ background: impactData.color, boxShadow: `0 0 15px ${impactData.color}` }}></div>
            </div>
          </div>
          <p className="impact-desc">
            Drinking a glass of this water is conceptually equivalent to swallowing <strong>{impactData.drops} drops of untreated raw sewage</strong>.
          </p>
          <p className="impact-disclaimer">
            Disclaimer: This sewage-equivalent estimate is a conceptual analogy based on the overall pollution index (WQI) to help visualize water safety.
          </p>
        </div>
      )}

      <div className="health-advice-banner mb-6">
        <span className="health-emoji">{advice.emoji}</span>
        <div>
          <h3 className="health-title" style={{ color: advice.color }}>{advice.category} Water Quality</h3>
          <p className="health-description">{advice.description}</p>
        </div>
      </div>

      {advice.usageSuitability && (
        <div className="usage-suitability-grid">
          {Object.entries(advice.usageSuitability).map(([key, val]) => (
            <div key={key} className={`usage-card ${val.safe ? 'safe' : 'unsafe'}`}>
              <span className="usage-icon">{getUsageIcon(key)}</span>
              <span className="usage-label">{capitalize(key)}</span>
              <span className={`usage-badge ${val.safe ? 'safe' : 'unsafe'}`}>
                {val.safe ? '✓ Safe' : '✗ Unsafe'}
              </span>
              <span className="usage-note">{val.note}</span>
            </div>
          ))}
        </div>
      )}

      {advice.healthRisks && advice.healthRisks.length > 0 && (
        <div className="health-risks-box">
          <h4>⚠️ Health Risks</h4>
          <ul>
            {advice.healthRisks.map((risk, i) => <li key={i}>{risk}</li>)}
          </ul>
        </div>
      )}

      {advice.recommendations && advice.recommendations.length > 0 && (
        <div className="recommendations-box">
          <h4>💡 Actionable Recommendations</h4>
          <ul>
            {advice.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advice.doList && advice.doList.length > 0 && (
          <div className="do-list-box">
            <h4>✅ Do's</h4>
            <ul>
              {advice.doList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
        {advice.dontList && advice.dontList.length > 0 && (
          <div className="dont-list-box">
            <h4>❌ Don'ts</h4>
            <ul>
              {advice.dontList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function getUsageIcon(key) {
  const icons = { drinking: '🚰', bathing: '🏊', fishing: '🎣', irrigation: '🌾', industrial: '🏭' };
  return icons[key] || '💧';
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function calculateSewageEquivalence(wqiCategoryVal, adviceCategory) {
  // Approximate drops of raw sewage per 250ml glass of water based on severity
  let drops = 0;
  let color = '#00e676';
  
  const cat = adviceCategory || wqiCategoryVal;

  switch (cat) {
    case 'Excellent':
      drops = 0;
      color = '#00e676';
      break;
    case 'Good':
      drops = 0.5; // Trace pathogens
      color = '#69f0ae';
      break;
    case 'Moderate':
      drops = 3; 
      color = '#ffd740';
      break;
    case 'Poor':
      drops = 15; 
      color = '#ff9100';
      break;
    case 'Very Poor':
      drops = 35; 
      color = '#ff5252';
      break;
    case 'Unsuitable':
    default:
      drops = 100; // Almost half a cup
      color = '#d50000';
      break;
  }
  
  return { drops, color };
}
