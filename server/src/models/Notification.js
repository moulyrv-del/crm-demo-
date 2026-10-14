const mongoose = require('mongoose');
const s = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true }, message: String,
  type: { type: String, enum: ['lead_assigned', 'lead_status', 'deal_stage', 'deal_won', 'deal_lost', 'follow_up_due', 'activity_assigned', 'customer_created', 'system'], default: 'system' },
  relatedEntityType: { type: String, enum: ['lead', 'customer', 'deal', 'activity', 'system'], default: 'system' },
  relatedEntityId: mongoose.Schema.Types.ObjectId,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });
s.index({ user: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', s);
