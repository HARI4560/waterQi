/**
 * WQI Helper Utilities
 * Standards: BIS IS 10500:2012 + CPCB Surface Water Classification
 */

export const WQI_CATEGORIES = {
  EXCELLENT: { label: 'Excellent', min: 90, max: 100, color: '#00e676', bg: 'rgba(0, 230, 118, 0.15)', emoji: '💧', class: 'excellent' },
  GOOD: { label: 'Good', min: 70, max: 89, color: '#69f0ae', bg: 'rgba(105, 240, 174, 0.15)', emoji: '🟢', class: 'good' },
  MODERATE: { label: 'Moderate', min: 50, max: 69, color: '#ffd740', bg: 'rgba(255, 215, 64, 0.15)', emoji: '🟡', class: 'moderate' },
  POOR: { label: 'Poor', min: 25, max: 49, color: '#ff9100', bg: 'rgba(255, 145, 0, 0.15)', emoji: '🟠', class: 'poor' },
  VERY_POOR: { label: 'Very Poor', min: 10, max: 24, color: '#ff5252', bg: 'rgba(255, 82, 82, 0.15)', emoji: '🔴', class: 'verypoor' },
  UNSUITABLE: { label: 'Unsuitable', min: 0, max: 9, color: '#d50000', bg: 'rgba(213, 0, 0, 0.15)', emoji: '☠️', class: 'unsuitable' },
};

export function getCategoryInfo(category) {
  const key = category?.toUpperCase().replace(/\s+/g, '_');
  return WQI_CATEGORIES[key] || WQI_CATEGORIES.MODERATE;
}

export function getCategoryFromWQI(wqi) {
  if (wqi >= 90) return WQI_CATEGORIES.EXCELLENT;
  if (wqi >= 70) return WQI_CATEGORIES.GOOD;
  if (wqi >= 50) return WQI_CATEGORIES.MODERATE;
  if (wqi >= 25) return WQI_CATEGORIES.POOR;
  if (wqi >= 10) return WQI_CATEGORIES.VERY_POOR;
  return WQI_CATEGORIES.UNSUITABLE;
}

export function getWQIColor(wqi) {
  return getCategoryFromWQI(wqi).color;
}

export function getCategoryClass(category) {
  return getCategoryInfo(category).class;
}

// Parameter info with BIS IS 10500:2012 / CPCB standard references
export const PARAMETER_INFO = {
  ph: { label: 'pH', icon: '⚗️', unit: '', description: 'Measure of acidity/alkalinity. BIS IS 10500: 6.5–8.5', ideal: '6.5–8.5' },
  dissolvedOxygen: { label: 'Dissolved Oxygen', icon: '🫧', unit: 'mg/L', description: 'Oxygen available for aquatic life. CPCB Class A: ≥6 mg/L', ideal: '≥ 6 mg/L' },
  bod: { label: 'BOD', icon: '🧪', unit: 'mg/L', description: 'Biochemical Oxygen Demand. CPCB Class A: ≤2 mg/L', ideal: '≤ 2 mg/L' },
  cod: { label: 'COD', icon: '🔬', unit: 'mg/L', description: 'Chemical Oxygen Demand. Lower means less pollution.', ideal: '≤ 10 mg/L' },
  totalColiform: { label: 'Total Coliform', icon: '🦠', unit: 'MPN/100mL', description: 'Bacterial contamination. CPCB Class A: ≤50 MPN', ideal: '≤ 50 MPN' },
  fecalColiform: { label: 'Fecal Coliform', icon: '⚠️', unit: 'MPN/100mL', description: 'Fecal contamination indicator. Critical for health.', ideal: '≤ 100 MPN' },
  turbidity: { label: 'Turbidity', icon: '🌊', unit: 'NTU', description: 'Water clarity. BIS IS 10500: ≤1 NTU (acceptable), ≤5 NTU (permissible)', ideal: '≤ 1 NTU' },
  temperature: { label: 'Temperature', icon: '🌡️', unit: '°C', description: 'Water temperature. Affects dissolved oxygen levels.', ideal: '20–30°C' },
  conductivity: { label: 'Conductivity', icon: '⚡', unit: 'µS/cm', description: 'Electrical conductivity. CPCB Class E: ≤2250 µS/cm', ideal: '≤ 2250 µS/cm' },
  tds: { label: 'TDS', icon: '💎', unit: 'mg/L', description: 'Total Dissolved Solids. BIS IS 10500: ≤500 mg/L (acceptable)', ideal: '≤ 500 mg/L' },
  nitrate: { label: 'Nitrate', icon: '🌿', unit: 'mg/L', description: 'Nitrogen pollutant. BIS IS 10500: ≤45 mg/L (no relaxation)', ideal: '≤ 45 mg/L' },
  phosphate: { label: 'Phosphate', icon: '🧫', unit: 'mg/L', description: 'Phosphorus pollutant. Causes algal blooms & eutrophication.', ideal: '≤ 0.1 mg/L' },
  ammonia: { label: 'Ammonia', icon: '🧪', unit: 'mg/L', description: 'Toxicity indicator. CPCB Class D: ≤1.2 mg/L, BIS: ≤0.5 mg/L', ideal: '≤ 0.5 mg/L' },
  chloride: { label: 'Chloride', icon: '🧂', unit: 'mg/L', description: 'Chloride content. BIS IS 10500: ≤250 mg/L (acceptable)', ideal: '≤ 250 mg/L' },
  hardness: { label: 'Hardness', icon: '💠', unit: 'mg/L', description: 'Calcium & Magnesium. BIS IS 10500: ≤200 mg/L (acceptable)', ideal: '≤ 200 mg/L' },
};

export function getParamInfo(key) {
  return PARAMETER_INFO[key] || { label: key, icon: '📊', unit: '', description: '' };
}

export function getStatusColor(status) {
  switch (status) {
    case 'Good': return '#00e676';
    case 'Moderate': return '#ffd740';
    case 'Poor': return '#ff9100';
    case 'Very Poor': return '#ff5252';
    default: return '#9ca3cf';
  }
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}


