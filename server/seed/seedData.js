const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const WaterBody = require('../models/WaterBody');
const WQIReading = require('../models/WQIReading');
const HealthAdvice = require('../models/HealthAdvice');
const { calculateWQI } = require('../utils/wqiCalculator');

// ─── Water Bodies Data ───────────────────────────────────────────────
const waterBodiesData = [
  // Bangalore Lakes
  { name: 'Bellandur Lake', slug: 'bellandur-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 12.9340, longitude: 77.6700, description: 'Largest lake in Bangalore, severely polluted due to untreated sewage and industrial effluents.', area: '892 acres', monitoringStation: 'KSPCB-BLR-001' },
  { name: 'Ulsoor Lake', slug: 'ulsoor-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 12.9830, longitude: 77.6200, description: 'Historic lake in central Bangalore, popular for boating and recreation.', area: '123.6 acres', monitoringStation: 'KSPCB-BLR-002' },
  { name: 'Varthur Lake', slug: 'varthur-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 12.9412, longitude: 77.7400, description: 'Second largest lake in Bangalore, faces severe froth and pollution issues.', area: '220.43 hectares', monitoringStation: 'KSPCB-BLR-003' },
  { name: 'Hebbal Lake', slug: 'hebbal-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 13.0450, longitude: 77.5910, description: 'Important bird sanctuary and lake in north Bangalore.', area: '150 acres', monitoringStation: 'KSPCB-BLR-004' },
  { name: 'Madiwala Lake', slug: 'madiwala-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 12.9220, longitude: 77.6180, description: 'One of the oldest lakes in Bangalore, a popular bird-watching location.', area: '114.7 hectares', monitoringStation: 'KSPCB-BLR-005' },
  { name: 'Sankey Tank', slug: 'sankey-tank', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 13.0100, longitude: 77.5730, description: 'Well-maintained tank in Malleshwaram, popular for walking and recreation.', area: '15 acres', monitoringStation: 'KSPCB-BLR-006' },
  { name: 'Agara Lake', slug: 'agara-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 12.9257, longitude: 77.6396, description: 'A scenic lake in the HSR Layout area, restored by BBMP and BDA.', area: '52 acres', monitoringStation: 'KSPCB-BLR-007' },
  { name: 'Nagavara Lake', slug: 'nagavara-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 13.0440, longitude: 77.6150, description: 'Scenic lake in north Bangalore now developed as Lumbini Gardens.', area: '38 acres', monitoringStation: 'KSPCB-BLR-008' },
  { name: 'Hesaraghatta Lake', slug: 'hesaraghatta-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 13.1360, longitude: 77.4950, description: 'Freshwater manmade reservoir built in 1894 across the Arkavathy River.', area: '1000 acres', monitoringStation: 'KSPCB-BLR-009' },
  { name: 'Jakkur Lake', slug: 'jakkur-lake', type: 'lake', city: 'Bangalore', district: 'Bangalore Urban', latitude: 13.0760, longitude: 77.6060, description: 'One of the larger lakes in northern Bangalore, fed by an STP.', area: '160 acres', monitoringStation: 'KSPCB-BLR-010' },
  // Other Karnataka Cities
  { name: 'Kukkarahalli Lake', slug: 'kukkarahalli-lake', type: 'lake', city: 'Mysore', district: 'Mysore', latitude: 12.3100, longitude: 76.6380, description: 'Historic lake inside University of Mysore campus, known for biodiversity.', area: '58 hectares', monitoringStation: 'KSPCB-MYS-001' },
  { name: 'Karanji Lake', slug: 'karanji-lake', type: 'lake', city: 'Mysore', district: 'Mysore', latitude: 12.2900, longitude: 76.6700, description: 'One of the largest lakes in Mysore, next to Mysore Zoo, a bird sanctuary.', area: '90 hectares', monitoringStation: 'KSPCB-MYS-002' },
  { name: 'Unakal Lake', slug: 'unakal-lake', type: 'lake', city: 'Hubli', district: 'Dharwad', latitude: 15.3700, longitude: 75.1200, description: 'A major recreational lake in Hubli town, featuring a statue of Swami Vivekananda.', area: '200 acres', monitoringStation: 'KSPCB-HBL-001' },
  { name: 'Pilikula Lake', slug: 'pilikula-lake', type: 'lake', city: 'Mangalore', district: 'Dakshina Kannada', latitude: 12.9250, longitude: 74.8960, description: 'Part of the Pilikula Nisargadhama nature park complex.', area: '10 acres', monitoringStation: 'KSPCB-MNG-002' },
  // Rivers
  { name: 'Cauvery River - KRS Dam', slug: 'cauvery-river-krs', type: 'river', city: 'Mandya', district: 'Mandya', latitude: 12.4300, longitude: 76.5600, description: 'Monitoring station at Krishna Raja Sagara reservoir, the lifeline of Karnataka.', monitoringStation: 'KSPCB-MDY-001' },
  { name: 'Tungabhadra River - Hospet', slug: 'tungabhadra-river-hospet', type: 'river', city: 'Hospet', district: 'Bellary', latitude: 15.2690, longitude: 76.3880, description: 'Major river in northern Karnataka, monitored at Hospet.', monitoringStation: 'KSPCB-BLY-001' },
  { name: 'Nethravathi River - Mangalore', slug: 'nethravathi-river-mangalore', type: 'river', city: 'Mangalore', district: 'Dakshina Kannada', latitude: 12.8700, longitude: 74.8800, description: 'Important river of Dakshina Kannada district.', monitoringStation: 'KSPCB-MNG-001' },
  { name: 'Sharavathi River - Jog Falls', slug: 'sharavathi-river-jog', type: 'river', city: 'Shimoga', district: 'Shimoga', latitude: 14.2300, longitude: 74.8100, description: 'Famous for Jog Falls, one of the highest waterfalls in India.', monitoringStation: 'KSPCB-SHM-001' },
  { name: 'Krishna River - Bagalkot', slug: 'krishna-river-bagalkot', type: 'river', city: 'Bagalkot', district: 'Bagalkot', latitude: 16.1800, longitude: 75.6960, description: 'Major river flowing through northern Karnataka.', monitoringStation: 'KSPCB-BGK-001' },
  { name: 'Kabini River - Nanjangud', slug: 'kabini-river-nanjangud', type: 'river', city: 'Nanjangud', district: 'Mysore', latitude: 12.1167, longitude: 76.6833, description: 'Tributary of Cauvery, monitored at Nanjangud.', monitoringStation: 'KSPCB-MYS-003' },
  { name: 'Hemavathi River - Hassan', slug: 'hemavathi-river-hassan', type: 'river', city: 'Hassan', district: 'Hassan', latitude: 12.7760, longitude: 76.1010, description: 'Major tributary of the Cauvery River.', monitoringStation: 'KSPCB-HSN-001' },
  { name: 'Bhadra River - Bhadravathi', slug: 'bhadra-river-bhadravathi', type: 'river', city: 'Shimoga', district: 'Shimoga', latitude: 13.8400, longitude: 75.7000, description: 'River passing through the industrial town of Bhadravathi.', monitoringStation: 'KSPCB-SHM-002' },
  // Reservoirs
  { name: 'Linganamakki Reservoir', slug: 'linganamakki-reservoir', type: 'reservoir', city: 'Sagar', district: 'Shimoga', latitude: 14.1800, longitude: 75.0400, description: 'Major hydroelectric reservoir on Sharavathi river.', monitoringStation: 'KSPCB-SGR-001' },
  { name: 'Almatti Dam Reservoir', slug: 'almatti-dam-reservoir', type: 'reservoir', city: 'Bagalkot', district: 'Bagalkot', latitude: 16.3300, longitude: 75.8800, description: 'One of the largest dams on the Krishna River.', monitoringStation: 'KSPCB-BGK-002' },
  { name: 'Tunga Bhadra Dam - Munirabad', slug: 'tb-dam-munirabad', type: 'reservoir', city: 'Hospet', district: 'Koppal', latitude: 15.3020, longitude: 76.3240, description: 'Vast reservoir built across Tungabhadra River.', monitoringStation: 'KSPCB-BLY-002' }
];

// ─── Get realistic parameter ranges based on water body condition ────
function generateReadingParams(condition) {
  // condition: 'clean', 'moderate', 'polluted', 'severe'
  const ranges = {
    clean: {
      ph: [6.8, 7.5], dissolvedOxygen: [7, 10], bod: [0.5, 2], cod: [5, 15],
      totalColiform: [20, 200], fecalColiform: [5, 50], turbidity: [1, 5],
      temperature: [22, 27], conductivity: [100, 300], tds: [80, 200],
      nitrate: [1, 5], phosphate: [0.05, 0.3], ammonia: [0.01, 0.2], chloride: [10, 50], hardness: [50, 150]
    },
    moderate: {
      ph: [6.5, 8.0], dissolvedOxygen: [4, 7], bod: [3, 6], cod: [15, 50],
      totalColiform: [500, 5000], fecalColiform: [100, 1000], turbidity: [5, 15],
      temperature: [24, 30], conductivity: [300, 600], tds: [200, 500],
      nitrate: [5, 20], phosphate: [0.3, 1.0], ammonia: [0.2, 1.0], chloride: [50, 150], hardness: [150, 300]
    },
    polluted: {
      ph: [6.0, 8.5], dissolvedOxygen: [2, 4], bod: [6, 15], cod: [50, 150],
      totalColiform: [5000, 30000], fecalColiform: [1000, 10000], turbidity: [15, 40],
      temperature: [26, 33], conductivity: [600, 1200], tds: [500, 900],
      nitrate: [20, 50], phosphate: [1.0, 3.0], ammonia: [1.0, 3.5], chloride: [150, 350], hardness: [300, 500]
    },
    severe: {
      ph: [5.5, 9.0], dissolvedOxygen: [0.5, 2], bod: [15, 40], cod: [150, 400],
      totalColiform: [30000, 100000], fecalColiform: [10000, 50000], turbidity: [40, 100],
      temperature: [28, 36], conductivity: [1200, 2500], tds: [900, 2000],
      nitrate: [50, 120], phosphate: [3.0, 8.0], ammonia: [3.5, 12.0], chloride: [350, 600], hardness: [500, 800]
    }
  };

  const r = ranges[condition];
  const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

  return {
    ph: { value: rand(r.ph[0], r.ph[1]) },
    dissolvedOxygen: { value: rand(r.dissolvedOxygen[0], r.dissolvedOxygen[1]) },
    bod: { value: rand(r.bod[0], r.bod[1]) },
    cod: { value: rand(r.cod[0], r.cod[1]) },
    totalColiform: { value: Math.round(rand(r.totalColiform[0], r.totalColiform[1])) },
    fecalColiform: { value: Math.round(rand(r.fecalColiform[0], r.fecalColiform[1])) },
    turbidity: { value: rand(r.turbidity[0], r.turbidity[1]) },
    temperature: { value: rand(r.temperature[0], r.temperature[1]) },
    conductivity: { value: rand(r.conductivity[0], r.conductivity[1]) },
    tds: { value: Math.round(rand(r.tds[0], r.tds[1])) },
    nitrate: { value: rand(r.nitrate[0], r.nitrate[1]) },
    phosphate: { value: rand(r.phosphate[0], r.phosphate[1]) },
    ammonia: { value: rand(r.ammonia[0], r.ammonia[1]) },
    chloride: { value: rand(r.chloride[0], r.chloride[1]) },
    hardness: { value: Math.round(rand(r.hardness[0], r.hardness[1])) }
  };
}

const conditionProfiles = {
  'bellandur-lake': 'severe',
  'ulsoor-lake': 'moderate',
  'varthur-lake': 'severe',
  'hebbal-lake': 'moderate',
  'madiwala-lake': 'polluted',
  'sankey-tank': 'moderate',
  'agara-lake': 'moderate',
  'nagavara-lake': 'polluted',
  'hesaraghatta-lake': 'clean',
  'jakkur-lake': 'moderate',
  'kukkarahalli-lake': 'moderate',
  'karanji-lake': 'moderate',
  'unakal-lake': 'polluted',
  'pilikula-lake': 'clean',
  'cauvery-river-krs': 'clean',
  'tungabhadra-river-hospet': 'clean',
  'nethravathi-river-mangalore': 'clean',
  'sharavathi-river-jog': 'clean',
  'krishna-river-bagalkot': 'moderate',
  'kabini-river-nanjangud': 'clean',
  'hemavathi-river-hassan': 'moderate',
  'bhadra-river-bhadravathi': 'polluted',
  'linganamakki-reservoir': 'clean',
  'almatti-dam-reservoir': 'moderate',
  'tb-dam-munirabad': 'clean'
};

// ─── Health Advice Data ──────────────────────────────────────────────
const healthAdviceData = [
  {
    category: 'Excellent',
    wqiRange: { min: 90, max: 100 },
    color: '#00e400',
    emoji: '💧',
    description: 'Water quality is pristine and ideal for all uses including drinking after standard treatment.',
    usageSuitability: {
      drinking: { safe: true, note: 'Safe for drinking with standard treatment.' },
      bathing: { safe: true, note: 'Excellent for bathing and swimming.' },
      fishing: { safe: true, note: 'Ideal for aquatic life and fishing.' },
      irrigation: { safe: true, note: 'Excellent for all types of irrigation.' },
      industrial: { safe: true, note: 'Suitable for all industrial processes.' }
    },
    healthRisks: ['No significant health risks associated with this water quality level.'],
    doList: ['Use for recreational activities like swimming and boating', 'Support ecosystems around the water body', 'Continue monitoring to maintain quality'],
    dontList: ['Avoid throwing waste into the water body', 'Do not release untreated effluents nearby'],
    recommendations: ['This water body is well-maintained. Continue existing conservation practices.']
  },
  {
    category: 'Good',
    wqiRange: { min: 70, max: 89 },
    color: '#92d050',
    emoji: '🟢',
    description: 'Water quality is good and suitable for most uses with minimal treatment.',
    usageSuitability: {
      drinking: { safe: true, note: 'Safe with proper treatment and filtration.' },
      bathing: { safe: true, note: 'Suitable for bathing.' },
      fishing: { safe: true, note: 'Supports aquatic life well.' },
      irrigation: { safe: true, note: 'Good for all crops.' },
      industrial: { safe: true, note: 'Suitable for most industrial uses.' }
    },
    healthRisks: ['Minimal risk for healthy individuals.', 'Sensitive groups should exercise light caution.'],
    doList: ['Use for recreational activities', 'Water can be treated for drinking purposes', 'Support conservation efforts'],
    dontList: ['Avoid dumping waste', 'Do not use directly for drinking without treatment'],
    recommendations: ['Maintain existing treatment facilities.', 'Monitor seasonal variations.']
  },
  {
    category: 'Moderate',
    wqiRange: { min: 50, max: 69 },
    color: '#ffff00',
    emoji: '🟡',
    description: 'Water quality is acceptable but may have elevated levels of some pollutants.',
    usageSuitability: {
      drinking: { safe: false, note: 'Requires advanced treatment before drinking.' },
      bathing: { safe: true, note: 'Generally safe but may cause skin irritation in sensitive individuals.' },
      fishing: { safe: true, note: 'Fish may accumulate some pollutants. Limited consumption advised.' },
      irrigation: { safe: true, note: 'Suitable for most non-sensitive crops.' },
      industrial: { safe: true, note: 'Suitable with some pre-treatment.' }
    },
    healthRisks: ['Possible gastrointestinal issues if consumed untreated.', 'Skin irritation for sensitive individuals during prolonged contact.', 'Elevated coliform levels indicate microbial presence.'],
    doList: ['Boil water before any consumption', 'Limit skin contact duration', 'Use for irrigation with care', 'Get water tested regularly'],
    dontList: ['Do not drink directly', 'Avoid swimming for extended periods', 'Do not use for cooking without filtration'],
    recommendations: ['Install proper sewage treatment for nearby outlets.', 'Regular deweeding and desilting recommended.', 'Community awareness programs about water conservation.']
  },
  {
    category: 'Poor',
    wqiRange: { min: 30, max: 49 },
    color: '#ff7e00',
    emoji: '🟠',
    description: 'Water quality is poor and unsuitable for direct human contact or consumption.',
    usageSuitability: {
      drinking: { safe: false, note: 'Not safe. Even after treatment, risk remains.' },
      bathing: { safe: false, note: 'Not recommended. Skin diseases and infections possible.' },
      fishing: { safe: false, note: 'Fish may be contaminated. Consumption not advised.' },
      irrigation: { safe: true, note: 'Limited crops only. May affect soil and crop quality.' },
      industrial: { safe: true, note: 'Requires pre-treatment for most uses.' }
    },
    healthRisks: ['High risk of waterborne diseases (typhoid, cholera, dysentery).', 'Skin infections and allergic reactions from contact.', 'Heavy metal accumulation risk in local food chain.', 'Respiratory issues from aerosolized pollutants near the water body.'],
    doList: ['Report water quality concerns to local authorities', 'Use only treated municipal water for household needs', 'Keep children and animals away from the water body'],
    dontList: ['Do not swim, bathe, or wade in this water', 'Do not drink under any circumstances', 'Do not use for growing edible crops', 'Do not let livestock drink from this source'],
    recommendations: ['Immediate intervention needed from pollution control authorities.', 'Identify and cut off untreated sewage inlets.', 'Consider aeration and bioremediation measures.']
  },
  {
    category: 'Very Poor',
    wqiRange: { min: 15, max: 29 },
    color: '#ff0000',
    emoji: '🔴',
    description: 'Water is heavily polluted and poses serious health risks. Avoid all contact.',
    usageSuitability: {
      drinking: { safe: false, note: 'Extremely dangerous. Not safe under any circumstances.' },
      bathing: { safe: false, note: 'Strictly prohibited. Toxic chemical and biological contamination.' },
      fishing: { safe: false, note: 'Aquatic life severely damaged. Fish unsafe for consumption.' },
      irrigation: { safe: false, note: 'Will damage soil and contaminate crops.' },
      industrial: { safe: false, note: 'Requires extensive treatment. May damage equipment.' }
    },
    healthRisks: ['Severe waterborne disease outbreaks likely.', 'Toxic fumes may cause respiratory illness.', 'Carcinogenic compounds may be present.', 'Neurological damage from heavy metals.', 'Reproductive health impacts with prolonged exposure.'],
    doList: ['Stay away from the water body', 'Report to CPCB/State Pollution Control Board', 'Use only RO-treated water for all needs', 'Seek medical attention if exposed'],
    dontList: ['Absolutely no human or animal contact', 'Do not consume fish from this water', 'Do not live within 500m if possible', 'Do not ignore foul smells or foam'],
    recommendations: ['Emergency pollution control measures needed.', 'Complete diversion of sewage and industrial effluents.', 'Long-term lake/river rejuvenation plan required.', 'Community health screening recommended for nearby residents.']
  },
  {
    category: 'Unsuitable',
    wqiRange: { min: 0, max: 14 },
    color: '#7e0023',
    emoji: '☠️',
    description: 'Water is toxic and completely unsuitable for any use. Immediate remediation required.',
    usageSuitability: {
      drinking: { safe: false, note: 'Lethal. Contains toxic levels of pollutants.' },
      bathing: { safe: false, note: 'Contact can cause severe chemical burns and poisoning.' },
      fishing: { safe: false, note: 'No aquatic life can survive. Dead zone.' },
      irrigation: { safe: false, note: 'Will permanently damage soil fertility.' },
      industrial: { safe: false, note: 'Too toxic even for industrial use.' }
    },
    healthRisks: ['Immediate health hazard upon exposure.', 'Fatal if ingested.', 'Severe environmental disaster zone.'],
    doList: ['Evacuate the area if possible', 'Report immediately to CPCB, NGT, and local authorities', 'Demand immediate government intervention'],
    dontList: ['Do not go near the water body', 'Do not allow children or animals in the vicinity', 'Do not use for any purpose whatsoever'],
    recommendations: ['Declare environmental emergency.', 'Complete shutdown of polluting units.', 'Emergency health camps for affected population.', 'Long-term ecological restoration plan.']
  }
];

// ─── Seed Function ───────────────────────────────────────────────────
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await WaterBody.deleteMany({});
    await WQIReading.deleteMany({});
    await HealthAdvice.deleteMany({});
    console.log('Cleared existing data');

    // Seed water bodies
    const waterBodies = await WaterBody.insertMany(waterBodiesData);
    console.log(`Seeded ${waterBodies.length} water bodies`);

    // Seed readings (12 months for each water body)
    let readingCount = 0;
    for (const wb of waterBodies) {
      const condition = conditionProfiles[wb.slug] || 'moderate';
      const readings = [];

      for (let monthsAgo = 0; monthsAgo < 12; monthsAgo++) {
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        date.setDate(15); // mid-month readings

        const params = generateReadingParams(condition);
        const { wqi, category, parameterStatuses, eutrophicationStatus } = calculateWQI(params);

        // Add status to each parameter
        for (const [key, status] of Object.entries(parameterStatuses)) {
          if (params[key]) params[key].status = status;
        }

        readings.push({
          waterBody: wb._id,
          date,
          wqi,
          category,
          eutrophicationStatus, // added
          parameters: params,
          source: 'KSPCB'
        });
        readingCount++;
      }

      await WQIReading.insertMany(readings);
    }
    console.log(`Seeded ${readingCount} WQI readings`);

    // Seed health advice
    await HealthAdvice.insertMany(healthAdviceData);
    console.log(`Seeded ${healthAdviceData.length} health advice entries`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
