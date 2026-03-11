const mongoose = require('mongoose');

const wqiReadingSchema = new mongoose.Schema({
  waterBody: { type: mongoose.Schema.Types.ObjectId, ref: 'WaterBody', required: true, index: true },
  date: { type: Date, required: true, index: true },
  wqi: { type: Number, required: true, min: 0, max: 100 },
  category: {
    type: String,
    enum: ['Excellent', 'Good', 'Moderate', 'Poor', 'Very Poor', 'Unsuitable'],
    required: true
  },
  parameters: {
    ph: { value: Number, unit: { type: String, default: '' }, status: String },
    dissolvedOxygen: { value: Number, unit: { type: String, default: 'mg/L' }, status: String },
    bod: { value: Number, unit: { type: String, default: 'mg/L' }, status: String },
    cod: { value: Number, unit: { type: String, default: 'mg/L' }, status: String },
    totalColiform: { value: Number, unit: { type: String, default: 'MPN/100mL' }, status: String },
    fecalColiform: { value: Number, unit: { type: String, default: 'MPN/100mL' }, status: String },
    turbidity: { value: Number, unit: { type: String, default: 'NTU' }, status: String },
    temperature: { value: Number, unit: { type: String, default: '°C' }, status: String },
    conductivity: { value: Number, unit: { type: String, default: 'µS/cm' }, status: String },
    tds: { value: Number, unit: { type: String, default: 'mg/L' }, status: String },
    nitrate: { value: Number, unit: { type: String, default: 'mg/L' }, status: String },
    phosphate: { value: Number, unit: { type: String, default: 'mg/L' }, status: String },
    ammonia: { value: Number, unit: { type: String, default: 'mg/L' }, status: String },
    chloride: { value: Number, unit: { type: String, default: 'mg/L' }, status: String },
    hardness: { value: Number, unit: { type: String, default: 'mg/L' }, status: String }
  },
  source: { type: String, default: 'KSPCB' }
}, { timestamps: true });

wqiReadingSchema.index({ waterBody: 1, date: -1 });

module.exports = mongoose.model('WQIReading', wqiReadingSchema);
