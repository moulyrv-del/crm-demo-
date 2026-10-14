const mongoose = require('mongoose');
exports.validateId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ success: false, message: 'Invalid ID' });
exports.notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found' });
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500, message = err.message || 'Server error';
  if (err.code === 11000) { status = 409; message = 'Duplicate value: ' + Object.keys(err.keyValue).join(', '); }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  res.status(status).json({ success: false, message });
};
