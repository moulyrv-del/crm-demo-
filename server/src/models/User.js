const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'], default: 'SALES_EXECUTIVE' },
  phone: String, department: String,
  isActive: { type: Boolean, default: true },
  preferences: { theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: { email: { type: Boolean, default: true }, followUps: { type: Boolean, default: true }, deals: { type: Boolean, default: true }, leads: { type: Boolean, default: true }, system: { type: Boolean, default: true } } },
}, { timestamps: true });
s.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); next();
});
s.methods.matchPassword = function (p) { return bcrypt.compare(p, this.password); };
module.exports = mongoose.model('User', s);
