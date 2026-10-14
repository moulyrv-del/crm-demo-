const r = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { validateId } = require('../middleware/error');
const crud = require('../controllers/crud'), users = require('../controllers/users');
const auth = require('../controllers/auth'), dash = require('../controllers/dashboard');
const Lead = require('../models/Lead'), Customer = require('../models/Customer'), Deal = require('../models/Deal'), Activity = require('../models/Activity');
const EmailLog = require('../models/EmailLog'), reports = require('../controllers/reports');
const H = require('../services/hooks'), notif = require('../controllers/notifications');
const AP = { path: 'assignedTo', select: 'name' };
r.post('/auth/login', auth.login);
r.get('/auth/me', protect, auth.me);
const mount = (path, ctl, delRoles) => {
  r.get(`/${path}`, protect, ctl.list); r.post(`/${path}`, protect, ctl.create);
  r.get(`/${path}/:id`, protect, validateId, ctl.get); r.put(`/${path}/:id`, protect, validateId, ctl.update);
  r.delete(`/${path}/:id`, protect, validateId, authorize(...delRoles), ctl.remove);
};
mount('leads', crud(Lead, { ...H.lead, populate: [AP], filters: ['status', 'priority', 'source', 'assignedTo'], search: ['firstName', 'lastName', 'company', 'email'] }), ['ADMIN']);
mount('customers', crud(Customer, { ...H.customer, populate: [AP], filters: ['status', 'industry'], search: ['name', 'company', 'email'] }), ['ADMIN', 'SALES_MANAGER']);
mount('deals', crud(Deal, { ...H.deal, populate: [AP, { path: 'customer', select: 'name company' }], filters: ['stage', 'assignedTo'], search: ['name', 'company'] }), ['ADMIN', 'SALES_MANAGER']);
mount('activities', crud(Activity, { owner: 'createdBy', populate: [{ path: 'createdBy', select: 'name' }, { path: 'lead', select: 'firstName lastName' }, { path: 'customer', select: 'name' }, { path: 'deal', select: 'name' }], filters: ['type', 'status', 'lead', 'customer', 'deal'], search: ['title', 'description'] }), ['ADMIN', 'SALES_MANAGER']);
mount('emails', crud(EmailLog, { owner: 'sender', populate: [{ path: 'sender', select: 'name' }, { path: 'lead', select: 'firstName lastName' }, { path: 'customer', select: 'name' }], filters: ['status', 'lead', 'customer'], search: ['recipient', 'subject'] }), ['ADMIN', 'SALES_MANAGER']);
r.get('/reports', protect, authorize('ADMIN', 'SALES_MANAGER'), reports.report);
r.post('/leads/:id/convert', protect, validateId, async (req, res, next) => {
  try {
    const q = { _id: req.params.id }; if (req.user.role === 'SALES_EXECUTIVE') q.assignedTo = req.user._id;
    const l = await Lead.findOne(q);
    if (!l) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (l.convertedCustomer) return res.status(409).json({ success: false, message: 'Already converted' });
    if (!['Qualified', 'Proposal', 'Negotiation', 'Won'].includes(l.status)) return res.status(400).json({ success: false, message: 'Only qualified/won leads can be converted' });
    const c = await Customer.create({ name: `${l.firstName} ${l.lastName}`, company: l.company, email: l.email, phone: l.phone, industry: l.industry, assignedTo: l.assignedTo });
    l.convertedCustomer = c._id; l.status = 'Won'; await l.save();
    res.status(201).json({ success: true, data: c });
  } catch (e) { next(e); }
});
r.get('/users/options', protect, users.options);
r.get('/users', protect, authorize('ADMIN'), users.list); r.post('/users', protect, authorize('ADMIN'), users.create);
r.put('/users/:id', protect, authorize('ADMIN'), validateId, users.update); r.delete('/users/:id', protect, authorize('ADMIN'), validateId, users.remove);
r.put('/auth/profile', protect, auth.profile); r.put('/auth/password', protect, auth.password); r.put('/auth/preferences', protect, auth.preferences);
r.get('/notifications', protect, notif.list); r.put('/notifications/read-all', protect, notif.readAll);
r.put('/notifications/:id/read', protect, validateId, notif.read); r.delete('/notifications/:id', protect, validateId, notif.remove);
r.get('/customers/:id/related', protect, validateId, async (req, res, next) => {
  try {
    const dq = { customer: req.params.id }; if (req.user.role === 'SALES_EXECUTIVE') dq.assignedTo = req.user._id;
    const [deals, leads] = await Promise.all([Deal.find(dq).populate(AP).sort('-createdAt'), Lead.find({ convertedCustomer: req.params.id }).select('firstName lastName status estimatedValue')]);
    res.json({ success: true, data: { deals, leads, totalDealValue: deals.reduce((a, d) => a + d.value, 0) } });
  } catch (e) { next(e); }
});
r.get('/dashboard/summary', protect, dash.summary);
r.get('/dashboard/customer-growth', protect, dash.customerGrowth);
module.exports = r;
