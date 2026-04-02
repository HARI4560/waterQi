/**
 * Water Quality Index (WQI) Calculator
 * 
 * Standards Used:
 *   - BIS IS 10500:2012 (Indian Standard for Drinking Water)
 *   - CPCB Designated Best Use Classification (Classes A–E)
 *   - KSPCB (Karnataka State Pollution Control Board) monitoring norms
 * 
 * Methodology:
 *   Weighted Arithmetic Index Method (most widely used in Indian WQI research)
 *   WQI = Σ(Wi × qi) / Σ(Wi)
 *   Where Wi = weight of ith parameter, qi = sub-index of ith parameter
 * 
 * References:
 *   - BIS IS 10500:2012 — Drinking Water Specification
 *   - CPCB — Water Quality Criteria for Designated Best Use (MINARS/27/2007-08)
 *   - Ramakrishnaiah et al. (2009) — WQI for groundwater in India
 *   - Tyagi et al. (2020) — WQI for Indian surface water bodies
 */

// ─── Sub-index calculation functions (qi) ─────────────────────────────
// Each returns a quality rating (qi) on 0–100 scale
// Based on: qi = [(Vi - Vs) / (Si - Vs)] × 100
// Simplified to lookup tables aligned with BIS/CPCB breakpoints

const subIndexFunctions = {

  /**
   * pH — BIS IS 10500: Acceptable 6.5–8.5 (no relaxation)
   * CPCB Class A: 6.5–8.5, Class C: 6.0–9.0
   */
  ph: (value) => {
    if (value >= 6.5 && value <= 7.5) return 95;   // Ideal neutral range
    if (value >= 6.5 && value <= 8.5) return 80;    // Within BIS acceptable limit
    if (value >= 6.0 && value <= 9.0) return 55;    // CPCB Class C range
    if (value >= 5.5 && value <= 9.5) return 30;    // Beyond CPCB limits
    return 5;                                        // Extreme deviation
  },

  /**
   * Dissolved Oxygen (mg/L) — Higher is better
   * CPCB: Class A ≥6, Class B ≥5, Class C ≥4, Class D ≥4
   */
  dissolvedOxygen: (value) => {
    if (value >= 6) return 95;    // CPCB Class A (drinking source)
    if (value >= 5) return 75;    // CPCB Class B (bathing)
    if (value >= 4) return 55;    // CPCB Class C/D
    if (value >= 3) return 30;    // Below all CPCB classes
    if (value >= 2) return 15;
    return 5;                     // Anaerobic / dead zone
  },

  /**
   * BOD (mg/L) — Lower is better
   * CPCB: Class A ≤2, Class B ≤3, Class C ≤3
   */
  bod: (value) => {
    if (value <= 2) return 95;    // CPCB Class A
    if (value <= 3) return 80;    // CPCB Class B/C
    if (value <= 5) return 55;    // Moderate pollution
    if (value <= 8) return 35;    // Significant pollution
    if (value <= 15) return 15;   // Heavy pollution
    return 5;                     // Severe pollution
  },

  /**
   * COD (mg/L) — Lower is better
   * BIS does not specify for drinking water
   * Indian environmental practice: <10 clean, <25 moderate, <50 polluted
   */
  cod: (value) => {
    if (value <= 10) return 95;
    if (value <= 25) return 75;
    if (value <= 50) return 55;
    if (value <= 100) return 35;
    if (value <= 250) return 15;
    return 5;
  },

  /**
   * Total Coliform (MPN/100mL) — Lower is better
   * CPCB: Class A ≤50, Class B ≤500, Class C ≤5000
   * BIS: Shall not be detectable in treated drinking water
   */
  totalColiform: (value) => {
    if (value <= 50) return 95;       // CPCB Class A
    if (value <= 500) return 75;      // CPCB Class B
    if (value <= 5000) return 50;     // CPCB Class C
    if (value <= 10000) return 30;    // Beyond CPCB limits
    if (value <= 50000) return 15;
    return 5;
  },

  /**
   * Fecal Coliform (MPN/100mL) — Lower is better
   * CPCB: Class A ≤50 (TC), Class B ≤500 (TC)
   * FC is typically 10-20% of TC in Indian surface waters
   */
  fecalColiform: (value) => {
    if (value <= 10) return 95;
    if (value <= 100) return 75;
    if (value <= 1000) return 50;
    if (value <= 5000) return 25;
    return 5;
  },

  /**
   * Turbidity (NTU) — Lower is better
   * BIS IS 10500: Acceptable ≤1, Permissible ≤5
   */
  turbidity: (value) => {
    if (value <= 1) return 95;    // BIS acceptable limit
    if (value <= 5) return 80;    // BIS permissible limit
    if (value <= 10) return 55;   // Above BIS
    if (value <= 25) return 35;
    if (value <= 50) return 15;
    return 5;
  },

  /**
   * Temperature (°C) — deviation from ambient ~25°C
   * CPCB does not specify temperature for classes
   * Indian tropical surface water: 20–30°C normal
   */
  temperature: (value) => {
    const diff = Math.abs(value - 25);
    if (diff <= 3) return 90;     // Normal tropical range
    if (diff <= 5) return 75;
    if (diff <= 8) return 55;
    if (diff <= 12) return 35;
    return 15;
  },

  /**
   * Nitrate (mg/L) — Lower is better
   * BIS IS 10500: 45 mg/L (no relaxation)
   */
  nitrate: (value) => {
    if (value <= 5) return 95;
    if (value <= 10) return 80;
    if (value <= 20) return 55;
    if (value <= 45) return 35;   // BIS maximum limit
    if (value <= 100) return 15;  // Exceeds BIS
    return 5;
  },

  /**
   * Phosphate (mg/L) — Lower is better
   * BIS does not specify; CPCB does not specify for classes
   * Indian eutrophication criteria (CPCB guidelines):
   *   Oligotrophic <0.02, Mesotrophic 0.02–0.05, Eutrophic >0.05
   * Practical monitoring thresholds used by KSPCB
   */
  phosphate: (value) => {
    if (value <= 0.1) return 95;
    if (value <= 0.5) return 75;
    if (value <= 1.0) return 55;
    if (value <= 2.0) return 35;
    if (value <= 5.0) return 15;
    return 5;
  },

  /**
   * Ammonia / Free Ammonia (mg/L) — Lower is better
   * CPCB Class D: Free Ammonia (as N) ≤1.2 mg/L
   * BIS IS 10500: Ammonia 0.5 mg/L (acceptable)
   */
  ammonia: (value) => {
    if (value <= 0.5) return 95;    // BIS acceptable limit
    if (value <= 1.2) return 75;    // CPCB Class D limit
    if (value <= 2.5) return 50;    // Above CPCB limits
    if (value <= 5.0) return 30;
    if (value <= 10.0) return 15;
    return 5;
  },

  /**
   * TDS (mg/L) — Lower is better
   * BIS IS 10500: Acceptable ≤500, Permissible ≤2000
   */
  tds: (value) => {
    if (value <= 300) return 95;
    if (value <= 500) return 80;    // BIS acceptable limit
    if (value <= 1000) return 55;
    if (value <= 2000) return 30;   // BIS permissible limit
    return 5;                       // Exceeds BIS
  },

  /**
   * Conductivity (µS/cm)
   * CPCB Class E: ≤2250 µmhos/cm
   * Correlated with TDS: TDS ≈ 0.65 × EC
   */
  conductivity: (value) => {
    if (value <= 500) return 95;
    if (value <= 1000) return 75;
    if (value <= 1500) return 50;
    if (value <= 2250) return 30;   // CPCB Class E limit
    return 5;
  },

  /**
   * Chloride (mg/L) — Lower is better
   * BIS IS 10500: Acceptable ≤250, Permissible ≤1000
   */
  chloride: (value) => {
    if (value <= 100) return 95;
    if (value <= 250) return 80;    // BIS acceptable limit
    if (value <= 500) return 50;
    if (value <= 1000) return 25;   // BIS permissible limit
    return 5;
  },

  /**
   * Total Hardness (mg/L as CaCO3)
   * BIS IS 10500: Acceptable ≤200, Permissible ≤600
   */
  hardness: (value) => {
    if (value <= 100) return 95;
    if (value <= 200) return 80;    // BIS acceptable limit
    if (value <= 300) return 55;
    if (value <= 600) return 30;    // BIS permissible limit
    return 5;
  }
};


// ─── Parameter Weights (Wi) ───────────────────────────────────────────
// Based on Indian WQI research convention (Weighted Arithmetic Method)
// Higher weight = more impact on human health and aquatic ecosystems
// Sum of primary weights = 1.0

const weights = {
  // Primary WQI parameters (always used)
  ph:               0.11,   // Critical for aquatic life & drinking
  dissolvedOxygen:  0.17,   // Most critical for aquatic ecosystem health
  bod:              0.11,   // Key organic pollution indicator
  cod:              0.08,   // Chemical pollution indicator
  totalColiform:    0.10,   // Microbial contamination (CPCB primary)
  fecalColiform:    0.10,   // Fecal contamination (health critical)
  turbidity:        0.08,   // Physical quality (BIS primary)
  temperature:      0.05,   // Affects DO saturation
  nitrate:          0.08,   // BIS primary parameter, eutrophication
  phosphate:        0.07,   // Eutrophication driver
  ammonia:          0.05,   // Toxicity indicator (CPCB)
  // Total:          1.00
};


/**
 * Calculate WQI using Weighted Arithmetic Index Method
 * WQI = Σ(Wi × qi) / Σ(Wi)
 * 
 * @param {Object} params - Water quality parameters { paramName: { value: Number } }
 * @returns {{ wqi: number, category: string, parameterStatuses: Object, eutrophicationStatus: string }}
 */
function calculateWQI(params) {
  let totalWeight = 0;
  let weightedSum = 0;
  const parameterStatuses = {};

  for (const [param, weight] of Object.entries(weights)) {
    const paramData = params[param];
    if (paramData && paramData.value !== null && paramData.value !== undefined) {
      const qi = subIndexFunctions[param](paramData.value);
      weightedSum += qi * weight;
      totalWeight += weight;

      // Assign status based on sub-index (qi)
      if (qi >= 80) parameterStatuses[param] = 'Good';
      else if (qi >= 55) parameterStatuses[param] = 'Moderate';
      else if (qi >= 30) parameterStatuses[param] = 'Poor';
      else parameterStatuses[param] = 'Very Poor';
    }
  }

  // Normalize if not all parameters are available
  const wqi = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const category = getCategory(wqi);

  // ─── Eutrophication Check ─────────────────────────────────────────
  // Based on CPCB nutrient loading criteria (BOD, Nitrate, Phosphate, Ammonia)
  // Trophic State Index adapted for Indian freshwater bodies
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
    // Lower sub-index = higher pollutant levels = higher eutrophication risk
    if (avgNutrientIndex < 35) eutrophicationStatus = 'High Risk (Hyper-Eutrophic)';
    else if (avgNutrientIndex < 55) eutrophicationStatus = 'Moderate Risk (Eutrophic)';
    else if (avgNutrientIndex < 75) eutrophicationStatus = 'Low Risk (Mesotrophic)';
    else eutrophicationStatus = 'Safe (Oligotrophic)';
  }

  return { wqi, category, parameterStatuses, eutrophicationStatus };
}


/**
 * WQI Category Classification
 * Based on standard Indian WQI research (5-tier + Unsuitable)
 * Ref: Chaterjee & Raziuddin (2002), Tiwari & Mishra (1985)
 */
function getCategory(wqi) {
  if (wqi >= 90) return 'Excellent';
  if (wqi >= 70) return 'Good';
  if (wqi >= 50) return 'Moderate';
  if (wqi >= 25) return 'Poor';          // Indian standard: 25–49
  if (wqi >= 10) return 'Very Poor';     // Indian standard: 10–24
  return 'Unsuitable';                    // <10: Unfit for any use
}


/**
 * Get color for WQI category (CPCB color convention)
 */
function getCategoryColor(category) {
  const colors = {
    'Excellent': '#00e400',   // Green
    'Good': '#92d050',        // Light green
    'Moderate': '#ffff00',    // Yellow
    'Poor': '#ff7e00',        // Orange
    'Very Poor': '#ff0000',   // Red
    'Unsuitable': '#7e0023'   // Dark red / Maroon
  };
  return colors[category] || '#999';
}

module.exports = { calculateWQI, getCategory, getCategoryColor };
