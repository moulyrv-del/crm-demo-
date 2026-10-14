const mongoose = require('mongoose');
const s = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  company: String, email: { type: String, lowercase: true, trim: true }, phone: String, jobTitle: String,
  source: { type: String, enum: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Advertisement', 'Email Campaign', 'Event', 'Other'], default: 'Other' },
  industry: String,
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'], default: 'New' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimatedValue: { type: Number, default: 0, min: 0 },
  expectedCloseDate: Date, notes: String,
  convertedCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
}, { timestamps: true });
s.index({ status: 1, assignedTo: 1 });
module.exports = mongoose.model('Lead', s);
