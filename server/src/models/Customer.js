const mongoose = require('mongoose');
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, company: String,
  email: { type: String, lowercase: true }, phone: String, industry: String,
  address: String, city: String, state: String, country: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Inactive', 'Churned'], default: 'Active' },
  notes: String,
}, { timestamps: true });
module.exports = mongoose.model('Customer', s);
