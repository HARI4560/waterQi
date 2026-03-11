/**
 * Water Quality Index (WQI) Calculator
 * Based on NSF (National Sanitation Foundation) WQI methodology
 * adapted with Indian standards (BIS 10500 / CPCB norms)
 */

// Sub-index calculation functions (returns 0-100 scale)
const subIndexFunctions = {
  // pH: ideal is 7.0, deviates worse in both directions
  ph: (value) => {
    if (value >= 7.0 && value <= 7.5) return 95;
    if (value >= 6.5 && value <= 8.0) return 80;
    if (value >= 6.0 && value <= 8.5) return 60;
    if (value >= 5.5 && value <= 9.0) return 40;
    if (value >= 5.0 && value <= 9.5) return 20;
    return 5;
  },

  // Dissolved Oxygen (mg/L): higher is better
  dissolvedOxygen: (value) => {
    if (value >= 8) return 95;
    if (value >= 6) return 80;
    if (value >= 4) return 55;
    if (value >= 3) return 35;
    if (value >= 2) return 15;
    return 5;
  },

  // BOD (mg/L): lower is better
  bod: (value) => {
    if (value <= 1) return 95;
    if (value <= 3) return 80;
    if (value <= 5) return 55;
    if (value <= 8) return 35;
    if (value <= 15) return 15;
    return 5;
  },

  // COD (mg/L): lower is better
  cod: (value) => {
    if (value <= 10) return 95;
    if (value <= 25) return 75;
    if (value <= 50) return 55;
    if (value <= 100) return 35;
    if (value <= 250) return 15;
    return 5;
  },

  // Total Coliform (MPN/100mL): lower is better
  totalColiform: (value) => {
    if (value <= 50) return 95;
    if (value <= 500) return 75;
    if (value <= 5000) return 50;
    if (value <= 10000) return 30;
    if (value <= 50000) return 15;
    return 5;
  },

  // Fecal Coliform (MPN/100mL): lower is better
  fecalColiform: (value) => {
    if (value <= 10) return 95;
    if (value <= 100) return 75;
    if (value <= 1000) return 50;
    if (value <= 5000) return 25;
    return 5;
  },

  // Turbidity (NTU): lower is better
  turbidity: (value) => {
    if (value <= 1) return 95;
    if (value <= 5) return 80;
    if (value <= 10) return 60;
    if (value <= 25) return 40;
    if (value <= 50) return 20;
    return 5;
  },

  // Temperature change from 25°C ideal
  temperature: (value) => {
    const diff = Math.abs(value - 25);
    if (diff <= 2) return 90;
    if (diff <= 5) return 75;
    if (diff <= 8) return 55;
    if (diff <= 12) return 35;
    return 15;
  },

  // Nitrate (mg/L): lower is better
  nitrate: (value) => {
    if (value <= 5) return 95;
    if (value <= 10) return 80;
    if (value <= 20) return 55;
    if (value <= 45) return 35;
    if (value <= 100) return 15;
    return 5;
  },

  // Phosphate (mg/L): lower is better
  phosphate: (value) => {
    if (value <= 0.1) return 95;
    if (value <= 0.5) return 75;
    if (value <= 1.0) return 55;
    if (value <= 2.0) return 35;
    if (value <= 5.0) return 15;
    return 5;
  },

  // Ammonia (mg/L): lower is better
  ammonia: (value) => {
    if (value <= 0.5) return 95;
    if (value <= 1.2) return 80;
    if (value <= 2.5) return 55;
    if (value <= 5.0) return 30;
    if (value <= 10.0) return 15;
    return 5;
  }
};

// Weights for each parameter (sum = 1.0)
const weights = {
  ph: 0.11,
  dissolvedOxygen: 0.17,
  bod: 0.11,
  cod: 0.08,
  totalColiform: 0.10,
  fecalColiform: 0.10,
  turbidity: 0.08,
  temperature: 0.05,
  nitrate: 0.08,
  phosphate: 0.08,
  ammonia: 0.04
};

/**
 * Calculate WQI from parameters
 * @param {Object} params - Water quality parameters
 * @returns {{ wqi: number, category: string, parameterStatuses: Object }}
 */
function calculateWQI(params) {
  let totalWeight = 0;
  let weightedSum = 0;
  const parameterStatuses = {};

  for (const [param, weight] of Object.entries(weights)) {
    const paramData = params[param];
    if (paramData && paramData.value !== null && paramData.value !== undefined) {
      const subIndex = subIndexFunctions[param](paramData.value);
      weightedSum += subIndex * weight;
      totalWeight += weight;

      // Assign status based on sub-index
      if (subIndex >= 80) parameterStatuses[param] = 'Good';
      else if (subIndex >= 55) parameterStatuses[param] = 'Moderate';
      else if (subIndex >= 35) parameterStatuses[param] = 'Poor';
      else parameterStatuses[param] = 'Very Poor';
    }
  }

  // Normalize if not all parameters are available
  const wqi = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const category = getCategory(wqi);

  // Eutrophication Check (based on BOD, Nitrate, Phosphate, Ammonia)
  let eutrophicationStatus = 'Low Risk';
  let nutrientScore = 0;
  let nutrientCount = 0;

  ['bod', 'nitrate', 'phosphate', 'ammonia'].forEach(param => {
    if (params[param] && params[param].value !== null) {
      nutrientScore += subIndexFunctions[param](params[param].value);
      nutrientCount++;
    }
  });

  if (nutrientCount > 0) {
    const avgNutrientIndex = nutrientScore / nutrientCount;
    // Lower index = worse water quality / higher nutrients = high Eutrophication risk
    if (avgNutrientIndex < 35) eutrophicationStatus = 'High Risk (Hyper-Eutrophic)';
    else if (avgNutrientIndex < 60) eutrophicationStatus = 'Moderate Risk (Eutrophic)';
    else if (avgNutrientIndex < 80) eutrophicationStatus = 'Low Risk (Mesotrophic)';
    else eutrophicationStatus = 'Safe (Oligotrophic)';
  }

  return { wqi, category, parameterStatuses, eutrophicationStatus };
}

/**
 * Get WQI category from score
 */
function getCategory(wqi) {
  if (wqi >= 90) return 'Excellent';
  if (wqi >= 70) return 'Good';
  if (wqi >= 50) return 'Moderate';
  if (wqi >= 30) return 'Poor';
  if (wqi >= 15) return 'Very Poor';
  return 'Unsuitable';
}

/**
 * Get color for WQI category
 */
function getCategoryColor(category) {
  const colors = {
    'Excellent': '#00e400',
    'Good': '#92d050',
    'Moderate': '#ffff00',
    'Poor': '#ff7e00',
    'Very Poor': '#ff0000',
    'Unsuitable': '#7e0023'
  };
  return colors[category] || '#999';
}

module.exports = { calculateWQI, getCategory, getCategoryColor };
