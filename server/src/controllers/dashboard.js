const Lead = require('../models/Lead'), Customer = require('../models/Customer'), Deal = require('../models/Deal');
exports.summary = async (req, res, next) => {
  try {
    const ex = req.user.role === 'SALES_EXECUTIVE', lq = ex ? { assignedTo: req.user._id } : {};
    const g = (M, f, q = {}) => M.aggregate([{ $match: q }, { $group: { _id: '$' + f, count: { $sum: 1 }, value: { $sum: '$value' } } }]);
    const [leads, customers, deals, ls, lsrc, ds, monthly, perf] = await Promise.all([
      Lead.find(lq).select('status'), Customer.countDocuments(lq), Deal.find(lq).select('stage value probability'),
      g(Lead, 'status', lq), g(Lead, 'source', lq), g(Deal, 'stage', lq),
      Deal.aggregate([{ $match: { ...lq, stage: 'Closed Won' } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } }, revenue: { $sum: '$value' } } }, { $sort: { _id: 1 } }]),
      Deal.aggregate([{ $match: { ...lq, stage: 'Closed Won' } }, { $group: { _id: '$assignedTo', revenue: { $sum: '$value' }, deals: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } }, { $project: { name: { $arrayElemAt: ['$u.name', 0] }, revenue: 1, deals: 1 } }]),
    ]);
    const won = deals.filter(d => d.stage === 'Closed Won'), open = deals.filter(d => !d.stage.startsWith('Closed'));
    const wonLeads = leads.filter(l => l.status === 'Won').length;
    res.json({ success: true, data: {
      kpis: { totalLeads: leads.length, newLeads: leads.filter(l => l.status === 'New').length, qualifiedLeads: leads.filter(l => l.status === 'Qualified').length,
        totalCustomers: customers, activeDeals: open.length, wonDeals: won.length, lostDeals: deals.filter(d => d.stage === 'Closed Lost').length,
        revenue: won.reduce((a, d) => a + d.value, 0), pipelineValue: open.reduce((a, d) => a + d.value, 0),
        weightedPipeline: Math.round(open.reduce((a, d) => a + d.value * d.probability / 100, 0)),
        conversionRate: leads.length ? +(wonLeads / leads.length * 100).toFixed(1) : 0 },
      leadsByStatus: ls.map(x => ({ name: x._id, value: x.count })), leadsBySource: lsrc.map(x => ({ name: x._id, value: x.count })),
      dealsByStage: ds.map(x => ({ name: x._id, count: x.count, value: x.value })),
      monthlyRevenue: monthly.map(x => ({ month: x._id, revenue: x.revenue })), performance: perf } });
  } catch (e) { next(e); }
};
exports.customerGrowth = async (req, res, next) => {
  try {
    const q = req.user.role === 'SALES_EXECUTIVE' ? { assignedTo: req.user._id } : {};
    const rows = await Customer.aggregate([{ $match: q }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, n: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    let total = 0;
    res.json({ success: true, data: rows.map(r => { total += r.n; const [y, m] = r._id.split('-');
      return { month: new Date(+y, +m - 1).toLocaleString('en', { month: 'short' }) + ' ' + y, newCustomers: r.n, customers: total }; }) });
  } catch (e) { next(e); }
};
