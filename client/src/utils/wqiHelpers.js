/**
 * WQI Helper Utilities
 */

export const WQI_CATEGORIES = {
  EXCELLENT: { label: 'Excellent', min: 90, max: 100, color: '#00e676', bg: 'rgba(0, 230, 118, 0.15)', emoji: '💧', class: 'excellent' },
  GOOD: { label: 'Good', min: 70, max: 89, color: '#69f0ae', bg: 'rgba(105, 240, 174, 0.15)', emoji: '🟢', class: 'good' },
  MODERATE: { label: 'Moderate', min: 50, max: 69, color: '#ffd740', bg: 'rgba(255, 215, 64, 0.15)', emoji: '🟡', class: 'moderate' },
  POOR: { label: 'Poor', min: 30, max: 49, color: '#ff9100', bg: 'rgba(255, 145, 0, 0.15)', emoji: '🟠', class: 'poor' },
  VERY_POOR: { label: 'Very Poor', min: 15, max: 29, color: '#ff5252', bg: 'rgba(255, 82, 82, 0.15)', emoji: '🔴', class: 'verypoor' },
  UNSUITABLE: { label: 'Unsuitable', min: 0, max: 14, color: '#d50000', bg: 'rgba(213, 0, 0, 0.15)', emoji: '☠️', class: 'unsuitable' },
};

export function getCategoryInfo(category) {
  const key = category?.toUpperCase().replace(/\s+/g, '_');
  return WQI_CATEGORIES[key] || WQI_CATEGORIES.MODERATE;
}

export function getCategoryFromWQI(wqi) {
  if (wqi >= 90) return WQI_CATEGORIES.EXCELLENT;
  if (wqi >= 70) return WQI_CATEGORIES.GOOD;
  if (wqi >= 50) return WQI_CATEGORIES.MODERATE;
  if (wqi >= 30) return WQI_CATEGORIES.POOR;
  if (wqi >= 15) return WQI_CATEGORIES.VERY_POOR;
  return WQI_CATEGORIES.UNSUITABLE;
}

export function getWQIColor(wqi) {
  return getCategoryFromWQI(wqi).color;
}

export function getCategoryClass(category) {
  return getCategoryInfo(category).class;
}

export const PARAMETER_INFO = {
  ph: { label: 'pH', icon: '⚗️', unit: '', description: 'Measure of acidity/alkalinity. Ideal: 6.5–8.5', ideal: '6.5–8.5' },
  dissolvedOxygen: { label: 'Dissolved Oxygen', icon: '🫧', unit: 'mg/L', description: 'Oxygen available for aquatic life. Higher is better.', ideal: '≥ 6 mg/L' },
  bod: { label: 'BOD', icon: '🧪', unit: 'mg/L', description: 'Biochemical Oxygen Demand. Lower means cleaner.', ideal: '≤ 3 mg/L' },
  cod: { label: 'COD', icon: '🔬', unit: 'mg/L', description: 'Chemical Oxygen Demand. Lower means less pollution.', ideal: '≤ 25 mg/L' },
  totalColiform: { label: 'Total Coliform', icon: '🦠', unit: 'MPN/100mL', description: 'Bacterial contamination indicator.', ideal: '≤ 500 MPN' },
  fecalColiform: { label: 'Fecal Coliform', icon: '⚠️', unit: 'MPN/100mL', description: 'Fecal contamination indicator. Critical for health.', ideal: '≤ 100 MPN' },
  turbidity: { label: 'Turbidity', icon: '🌊', unit: 'NTU', description: 'Water clarity. Lower is clearer.', ideal: '≤ 5 NTU' },
  temperature: { label: 'Temperature', icon: '🌡️', unit: '°C', description: 'Water temperature. Affects dissolved oxygen levels.', ideal: '20–30°C' },
  conductivity: { label: 'Conductivity', icon: '⚡', unit: 'µS/cm', description: 'Electrical conductivity. Indicates dissolved ions.', ideal: '≤ 500 µS/cm' },
  tds: { label: 'TDS', icon: '💎', unit: 'mg/L', description: 'Total Dissolved Solids. Affects taste and safety.', ideal: '≤ 500 mg/L' },
  nitrate: { label: 'Nitrate', icon: '🌿', unit: 'mg/L', description: 'Nitrogen pollutant. Causes eutrophication.', ideal: '≤ 10 mg/L' },
  phosphate: { label: 'Phosphate', icon: '🧫', unit: 'mg/L', description: 'Phosphorus pollutant. Causes algal blooms.', ideal: '≤ 0.5 mg/L' },
  ammonia: { label: 'Ammonia', icon: '🧪', unit: 'mg/L', description: 'Toxicity indicator from organic matter decay.', ideal: '≤ 1.2 mg/L' },
  chloride: { label: 'Chloride', icon: '🧂', unit: 'mg/L', description: 'Chloride content. Affects taste.', ideal: '≤ 250 mg/L' },
  hardness: { label: 'Hardness', icon: '💠', unit: 'mg/L', description: 'Calcium & Magnesium content.', ideal: '≤ 300 mg/L' },
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


