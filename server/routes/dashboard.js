const express = require('express');
const router = express.Router();
const WaterBody = require('../models/WaterBody');
const WQIReading = require('../models/WQIReading');
const HealthAdvice = require('../models/HealthAdvice');

// GET /api/dashboard/overview — Overall Karnataka WQI summary
router.get('/overview', async (req, res) => {
  try {
    const waterBodies = await WaterBody.find({ isActive: true });

    const withReadings = await Promise.all(
      waterBodies.map(async (wb) => {
        const latest = await WQIReading.findOne({ waterBody: wb._id })
          .sort({ date: -1 })
          .lean();
        return {
          id: wb._id,
          name: wb.name,
          slug: wb.slug,
          type: wb.type,
          city: wb.city,
          latitude: wb.latitude,
          longitude: wb.longitude,
          wqi: latest ? latest.wqi : null,
          category: latest ? latest.category : null,
          lastUpdated: latest ? latest.date : null
        };
      })
    );

    // Calculate overall stats
    const validReadings = withReadings.filter(w => w.wqi !== null);
    const avgWQI = validReadings.length
      ? Math.round(validReadings.reduce((sum, w) => sum + w.wqi, 0) / validReadings.length)
      : 0;

    // Category distribution
    const categoryCount = {};
    validReadings.forEach(w => {
      categoryCount[w.category] = (categoryCount[w.category] || 0) + 1;
    });

    // City-wise breakdown
    const cities = {};
    validReadings.forEach(w => {
      if (!cities[w.city]) {
        cities[w.city] = { totalWQI: 0, count: 0, waterBodies: [] };
      }
      cities[w.city].totalWQI += w.wqi;
      cities[w.city].count += 1;
      cities[w.city].waterBodies.push(w);
    });

    const cityBreakdown = Object.entries(cities).map(([city, data]) => ({
      city,
      avgWQI: Math.round(data.totalWQI / data.count),
      waterBodyCount: data.count,
      waterBodies: data.waterBodies
    }));

    res.json({
      success: true,
      data: {
        overallWQI: avgWQI,
        totalWaterBodies: waterBodies.length,
        monitoredCount: validReadings.length,
        categoryDistribution: categoryCount,
        cityBreakdown,
        waterBodies: withReadings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/city/:city — City-level dashboard
router.get('/city/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const waterBodies = await WaterBody.find({
      city: new RegExp(`^${city}$`, 'i'),
      isActive: true
    });

    if (!waterBodies.length) {
      return res.status(404).json({ success: false, message: `No water bodies found in ${city}` });
    }

    const withReadings = await Promise.all(
      waterBodies.map(async (wb) => {
        const latest = await WQIReading.findOne({ waterBody: wb._id })
          .sort({ date: -1 })
          .lean();
        return {
          ...wb.toObject(),
          latestReading: latest,
          wqi: latest ? latest.wqi : null,
          category: latest ? latest.category : null
        };
      })
    );

    const validReadings = withReadings.filter(w => w.wqi !== null);
    const avgWQI = validReadings.length
      ? Math.round(validReadings.reduce((sum, w) => sum + w.wqi, 0) / validReadings.length)
      : 0;

    // Get overall category
    const { getCategory } = require('../utils/wqiCalculator');

    res.json({
      success: true,
      data: {
        city,
        state: 'Karnataka',
        avgWQI,
        category: getCategory(avgWQI),
        waterBodyCount: waterBodies.length,
        waterBodies: withReadings,
        lastUpdated: validReadings.length
          ? validReadings.reduce((latest, r) =>
              r.latestReading && r.latestReading.date > latest ? r.latestReading.date : latest, new Date(0))
          : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/health-advice/:category
router.get('/health-advice/:category', async (req, res) => {
  try {
    const advice = await HealthAdvice.findOne({
      category: new RegExp(`^${req.params.category}$`, 'i')
    });
    if (!advice) {
      return res.status(404).json({ success: false, message: 'Health advice not found for category' });
    }
    res.json({ success: true, data: advice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/health-advice — All health advice
router.get('/health-advice', async (req, res) => {
  try {
    const allAdvice = await HealthAdvice.find().sort({ 'wqiRange.min': -1 });
    res.json({ success: true, data: allAdvice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
