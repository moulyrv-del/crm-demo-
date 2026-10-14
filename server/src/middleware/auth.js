const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Account unavailable' });
    req.user = user; next();
  } catch { res.status(401).json({ success: false, message: 'Invalid or expired token' }); }
};
exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ success: false, message: 'Forbidden' });
