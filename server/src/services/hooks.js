const { notify } = require('./notify');
const Activity = require('../models/Activity'), User = require('../models/User');
const same = (a, b) => String(a || '') === String(b || '');
exports.lead = {
  onCreate: (d, req) => notify({ user: d.assignedTo, actor: req.user._id, title: 'New lead assigned', message: `${d.firstName} ${d.lastName} was assigned to you`, type: 'lead_assigned', entityType: 'lead', entityId: d._id }),
  onUpdate: async (b, a, req) => {
    if (!same(b.assignedTo, a.assignedTo)) await notify({ user: a.assignedTo, actor: req.user._id, title: 'New lead assigned', message: `${a.firstName} ${a.lastName} was assigned to you`, type: 'lead_assigned', entityType: 'lead', entityId: a._id });
    if (b.status !== a.status) {
      await Activity.create({ type: 'Status Change', title: `Status changed: ${b.status} → ${a.status}`, lead: a._id, createdBy: req.user._id, status: 'Completed' });
      await notify({ user: a.assignedTo, actor: req.user._id, title: `Lead status: ${a.status}`, message: `${a.firstName} ${a.lastName}: ${b.status} → ${a.status}`, type: 'lead_status', entityType: 'lead', entityId: a._id });
    }
  },
};
exports.customer = { onCreate: (d, req) => notify({ user: d.assignedTo, actor: req.user._id, title: 'Customer created', message: `${d.name} was added`, type: 'customer_created', entityType: 'customer', entityId: d._id }) };
exports.deal = {
  onUpdate: async (b, a, req) => {
    if (b.stage === a.stage) return;
    await Activity.create({ type: 'Status Change', title: `Stage changed: ${b.stage} → ${a.stage}`, deal: a._id, createdBy: req.user._id, status: 'Completed' });
    const type = a.stage === 'Closed Won' ? 'deal_won' : a.stage === 'Closed Lost' ? 'deal_lost' : 'deal_stage';
    const title = type === 'deal_won' ? 'Deal won' : type === 'deal_lost' ? 'Deal lost' : `Deal stage: ${a.stage}`;
    const targets = [a.assignedTo];
    if (type !== 'deal_stage') (await User.find({ role: 'SALES_MANAGER', isActive: true }).select('_id')).forEach(u => targets.push(u._id));
    for (const user of targets) await notify({ user, actor: req.user._id, title, message: `${a.name}: ${b.stage} → ${a.stage}`, type, entityType: 'deal', entityId: a._id });
  },
};
