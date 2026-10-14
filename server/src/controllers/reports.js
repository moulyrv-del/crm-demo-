const Lead = require('../models/Lead'), Deal = require('../models/Deal'), User = require('../models/User');
exports.report = async (req, res, next) => {
  try {
    const { from, to, assignedTo, source, stage } = req.query;
    const dr = {}; if (from) dr.$gte = new Date(from); if (to) dr.$lte = new Date(to + 'T23:59:59');
    const lq = {}, dq = {};
    if (from || to) { lq.createdAt = dr; dq.createdAt = dr; }
    if (assignedTo) { lq.assignedTo = assignedTo; dq.assignedTo = assignedTo; }
    if (source) { lq.source = source; dq.source = source; }
    if (stage) dq.stage = stage;
    const [leads, deals, users] = await Promise.all([Lead.find(lq).select('status source assignedTo'), Deal.find(dq).select('stage value probability assignedTo createdAt updatedAt'), User.find().select('name')]);
    const perEmployee = users.map(u => { const id = String(u._id), ml = leads.filter(l => String(l.assignedTo) === id), md = deals.filter(d => String(d.assignedTo) === id);
      const won = md.filter(d => d.stage === 'Closed Won'); return { name: u.name, leads: ml.length, wonLeads: ml.filter(l => l.status === 'Won').length, deals: md.length, wonDeals: won.length, revenue: won.reduce((a, d) => a + d.value, 0) }; })
      .filter(e => e.leads || e.deals);
    const bySource = [...new Set(leads.map(l => l.source))].map(s => { const m = leads.filter(l => l.source === s), w = m.filter(l => l.status === 'Won').length;
      return { source: s, leads: m.length, won: w, conversion: +(w / m.length * 100).toFixed(1) }; });
    const byStage = [...new Set(deals.map(d => d.stage))].map(s => { const m = deals.filter(d => d.stage === s);
      return { stage: s, deals: m.length, value: m.reduce((a, d) => a + d.value, 0), weighted: Math.round(m.reduce((a, d) => a + d.value * d.probability / 100, 0)) }; });
    const rev = {}; deals.filter(d => d.stage === 'Closed Won').forEach(d => { const k = d.updatedAt.toISOString().slice(0, 7); rev[k] = (rev[k] || 0) + d.value; });
    res.json({ success: true, data: { perEmployee, bySource, byStage, revenue: Object.keys(rev).sort().map(k => ({ month: k, revenue: rev[k] })),
      totals: { leads: leads.length, deals: deals.length, wonRevenue: perEmployee.reduce((a, e) => a + e.revenue, 0) } } });
  } catch (e) { next(e); }
};
