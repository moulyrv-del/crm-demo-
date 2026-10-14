const mongoose = require('mongoose');
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  company: String, value: { type: Number, default: 0, min: 0 },
  stage: { type: String, enum: ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'], default: 'Discovery' },
  probability: { type: Number, default: 10, min: 0, max: 100 },
  expectedCloseDate: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: String, description: String,
}, { timestamps: true });
s.index({ stage: 1, assignedTo: 1 });
module.exports = mongoose.model('Deal', s);
