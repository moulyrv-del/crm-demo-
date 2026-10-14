const User = require('../models/User');
const h = (fn) => async (req, res, next) => { try { await fn(req, res); } catch (e) { next(e); } };
exports.options = h(async (req, res) => res.json({ success: true, data: await User.find({ isActive: true }).select('name') }));
exports.list = h(async (req, res) => {
  const { search, role, sort = '-createdAt', page = 1, limit = 10 } = req.query;
  const q = {}; if (role) q.role = role;
  if (search) { const r = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); q.$or = [{ name: r }, { email: r }]; }
  const p = Math.max(+page || 1, 1), l = Math.min(+limit || 10, 100);
  const [data, total] = await Promise.all([User.find(q).sort(String(sort)).skip((p - 1) * l).limit(l), User.countDocuments(q)]);
  res.json({ success: true, data, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
});
exports.create = h(async (req, res) => { const u = await User.create(req.body); u.password = undefined; res.status(201).json({ success: true, data: u }); });
exports.update = h(async (req, res) => {
  const u = await User.findById(req.params.id).select('+password');
  if (!u) return res.status(404).json({ success: false, message: 'User not found' });
  ['name', 'email', 'role', 'phone', 'department', 'isActive'].forEach(k => { if (req.body[k] !== undefined) u[k] = req.body[k]; });
  if (req.body.password) u.password = req.body.password;
  await u.save(); u.password = undefined; res.json({ success: true, data: u });
});
exports.remove = h(async (req, res) => {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
  await User.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Deleted' });
});
