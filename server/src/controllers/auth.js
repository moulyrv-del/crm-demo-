const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)) || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    user.password = undefined;
    res.json({ success: true, data: { token, user } });
  } catch (e) { next(e); }
};
exports.me = (req, res) => res.json({ success: true, data: req.user });
const NKEYS = ['email', 'followUps', 'deals', 'leads', 'system'];
exports.profile = async (req, res, next) => {
  try {
    ['name', 'email', 'phone', 'department'].forEach(k => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
    await req.user.save(); res.json({ success: true, data: req.user });
  } catch (e) { next(e); }
};
exports.password = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'Current password and a new password (min 6 characters) are required' });
    const u = await User.findById(req.user._id).select('+password');
    if (!(await u.matchPassword(currentPassword))) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    u.password = newPassword; await u.save(); res.json({ success: true, message: 'Password updated' });
  } catch (e) { next(e); }
};
exports.preferences = async (req, res, next) => {
  try {
    const { theme, notifications } = req.body;
    if (theme) { if (!['light', 'dark'].includes(theme)) return res.status(400).json({ success: false, message: 'Invalid theme' }); req.user.set('preferences.theme', theme); }
    if (notifications) NKEYS.forEach(k => { if (k in notifications) req.user.set('preferences.notifications.' + k, !!notifications[k]); });
    await req.user.save(); res.json({ success: true, data: req.user });
  } catch (e) { next(e); }
};
