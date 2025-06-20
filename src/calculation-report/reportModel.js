const mongoose = require('mongoose');

const calculationReportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  electricityPrice: { type: String, required: true },
  kaspaPerDay: { type: String, required: true },
  kaspaPrice: { type: String, required: true },
  price: { type: String, required: true },
  spending: { type: String, required: true },
  investmentAmount: { type: String, required: true },
  specifications: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CalculationReport', calculationReportSchema);
