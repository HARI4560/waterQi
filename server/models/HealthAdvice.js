const mongoose = require('mongoose');

const healthAdviceSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Excellent', 'Good', 'Moderate', 'Poor', 'Very Poor', 'Unsuitable'],
    required: true,
    unique: true
  },
  wqiRange: {
    min: Number,
    max: Number
  },
  color: { type: String },
  emoji: { type: String },
  description: { type: String },
  usageSuitability: {
    drinking: { safe: Boolean, note: String },
    bathing: { safe: Boolean, note: String },
    fishing: { safe: Boolean, note: String },
    irrigation: { safe: Boolean, note: String },
    industrial: { safe: Boolean, note: String }
  },
  healthRisks: [{ type: String }],
  doList: [{ type: String }],
  dontList: [{ type: String }],
  recommendations: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('HealthAdvice', healthAdviceSchema);
