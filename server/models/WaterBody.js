const mongoose = require('mongoose');

const waterBodySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['lake', 'river', 'reservoir', 'pond'], required: true },
  city: { type: String, required: true, index: true },
  state: { type: String, default: 'Karnataka' },
  district: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  description: { type: String },
  area: { type: String },
  depth: { type: String },
  imageUrl: { type: String },
  monitoringStation: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

waterBodySchema.index({ city: 1, type: 1 });

module.exports = mongoose.model('WaterBody', waterBodySchema);
