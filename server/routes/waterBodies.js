const express = require('express');
const router = express.Router();
const WaterBody = require('../models/WaterBody');
const WQIReading = require('../models/WQIReading');

// GET /api/water-bodies — List all water bodies with latest WQI
router.get('/', async (req, res) => {
  try {
    const { city, type, search } = req.query;
    const filter = { isActive: true };

    if (city) filter.city = new RegExp(city, 'i');
    if (type) filter.type = type;
    if (search) filter.name = new RegExp(search, 'i');

    const waterBodies = await WaterBody.find(filter).sort({ name: 1 });

    // Get latest reading for each water body
    const result = await Promise.all(
      waterBodies.map(async (wb) => {
        const latestReading = await WQIReading.findOne({ waterBody: wb._id })
          .sort({ date: -1 })
          .lean();
        return {
          ...wb.toObject(),
          latestWQI: latestReading ? latestReading.wqi : null,
          latestCategory: latestReading ? latestReading.category : null,
          lastUpdated: latestReading ? latestReading.date : null
        };
      })
    );

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/water-bodies/:id — Single water body details + latest reading
router.get('/:id', async (req, res) => {
  try {
    const waterBody = await WaterBody.findById(req.params.id);
    if (!waterBody) {
      return res.status(404).json({ success: false, message: 'Water body not found' });
    }

    const latestReading = await WQIReading.findOne({ waterBody: waterBody._id })
      .sort({ date: -1 })
      .lean();

    // Get last 6 months of readings for mini-trends
    const recentReadings = await WQIReading.find({ waterBody: waterBody._id })
      .sort({ date: -1 })
      .limit(6)
      .lean();

    res.json({
      success: true,
      data: {
        ...waterBody.toObject(),
        latestReading,
        recentReadings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/water-bodies/:id/readings — Historical readings
router.get('/:id/readings', async (req, res) => {
  try {
    const { limit = 12, offset = 0, startDate, endDate } = req.query;
    const filter = { waterBody: req.params.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const readings = await WQIReading.find(filter)
      .sort({ date: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const total = await WQIReading.countDocuments(filter);

    res.json({ success: true, count: readings.length, total, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/water-bodies/:id/trends — Monthly/yearly trend aggregations
router.get('/:id/trends', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const waterBodyId = new mongoose.Types.ObjectId(req.params.id);

    const trends = await WQIReading.aggregate([
      { $match: { waterBody: waterBodyId } },
      { $sort: { date: 1 } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          avgWQI: { $avg: '$wqi' },
          minWQI: { $min: '$wqi' },
          maxWQI: { $max: '$wqi' },
          readings: { $sum: 1 },
          date: { $first: '$date' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
