const Notification = require('../models/Notification'), Activity = require('../models/Activity');
const { notify } = require('../services/notify');
const h = (fn) => async (req, res, next) => { try { await fn(req, res); } catch (e) { next(e); } };
exports.list = h(async (req, res) => {
  // lazily raise "follow-up due" notifications for this user (deduplicated in notify)
  const due = await Activity.find({ createdBy: req.user._id, type: 'Follow-up', status: 'Pending', date: { $lte: new Date() } }).limit(20);
  for (const a of due) await notify({ user: req.user._id, title: `Follow-up due: ${a.title}`, message: a.description, type: 'follow_up_due',
    entityType: a.lead ? 'lead' : a.customer ? 'customer' : a.deal ? 'deal' : 'activity', entityId: a.lead || a.customer || a.deal || a._id });
  const [data, unread] = await Promise.all([Notification.find({ user: req.user._id }).sort('-createdAt').limit(30), Notification.countDocuments({ user: req.user._id, isRead: false })]);
  res.json({ success: true, data, unread });
});
exports.read = h(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true });
  n ? res.json({ success: true, data: n }) : res.status(404).json({ success: false, message: 'Notification not found' });
});
exports.readAll = h(async (req, res) => { await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true }); res.json({ success: true, message: 'All marked as read' }); });
exports.remove = h(async (req, res) => {
  const n = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  n ? res.json({ success: true, message: 'Deleted' }) : res.status(404).json({ success: false, message: 'Notification not found' });
});
