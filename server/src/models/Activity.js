const mongoose = require('mongoose');
const R = (ref) => ({ type: mongoose.Schema.Types.ObjectId, ref });
const s = new mongoose.Schema({
  type: { type: String, enum: ['Call', 'Email', 'Meeting', 'Follow-up', 'Note', 'Task', 'Status Change'], required: true },
  title: { type: String, required: true }, description: String,
  lead: R('Lead'), customer: R('Customer'), deal: R('Deal'), createdBy: R('User'),
  date: { type: Date, default: Date.now }, time: String,
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });
s.index({ date: -1 });
module.exports = mongoose.model('Activity', s);
