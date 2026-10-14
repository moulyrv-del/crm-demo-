const mongoose = require('mongoose');
const R = (ref) => ({ type: mongoose.Schema.Types.ObjectId, ref });
const s = new mongoose.Schema({
  recipient: { type: String, required: true, trim: true }, subject: { type: String, required: true }, message: String,
  date: { type: Date, default: Date.now }, time: String, sender: R('User'), lead: R('Lead'), customer: R('Customer'),
  status: { type: String, enum: ['Sent', 'Scheduled', 'Failed'], default: 'Sent' },
}, { timestamps: true });
module.exports = mongoose.model('EmailLog', s);
