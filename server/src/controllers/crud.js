const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const run = async (f, ...a) => { try { await f(...a); } catch (e) { console.error('hook error:', e.message); } };
module.exports = (M, o = {}) => {
  const owner = o.owner || 'assignedTo', pop = o.populate || [];
  const scope = (u) => (u.role === 'SALES_EXECUTIVE' ? { [owner]: u._id } : {});
  const h = (fn) => async (req, res, next) => { try { await fn(req, res); } catch (e) { next(e); } };
  const nf = (res) => res.status(404).json({ success: false, message: 'Record not found' });
  return {
    list: h(async (req, res) => {
      const { search, sort = '-createdAt', page = 1, limit = 10 } = req.query;
      const q = { ...scope(req.user) };
      (o.filters || []).forEach(f => { if (req.query[f]) q[f] = req.query[f]; });
      if (search && o.search) { const r = new RegExp(esc(search), 'i'); q.$or = o.search.map(f => ({ [f]: r })); }
      const p = Math.max(+page || 1, 1), l = Math.min(+limit || 10, 100);
      const [data, total] = await Promise.all([
        M.find(q).populate(pop).sort(String(sort)).skip((p - 1) * l).limit(l), M.countDocuments(q)]);
      res.json({ success: true, data, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
    }),
    get: h(async (req, res) => {
      const d = await M.findOne({ _id: req.params.id, ...scope(req.user) }).populate(pop);
      d ? res.json({ success: true, data: d }) : nf(res);
    }),
    create: h(async (req, res) => {
      const b = { ...req.body };
      if (req.user.role === 'SALES_EXECUTIVE' || !b[owner]) b[owner] = req.user._id;
      const doc = await M.create(b);
      if (o.onCreate) await run(o.onCreate, doc, req);
      res.status(201).json({ success: true, data: doc });
    }),
    update: h(async (req, res) => {
      const b = { ...req.body };
      if (req.user.role === 'SALES_EXECUTIVE') delete b[owner];
      const before = o.onUpdate ? await M.findOne({ _id: req.params.id, ...scope(req.user) }) : null;
      const d = await M.findOneAndUpdate({ _id: req.params.id, ...scope(req.user) }, b, { new: true, runValidators: true });
      if (d && before) await run(o.onUpdate, before, d, req);
      d ? res.json({ success: true, data: d }) : nf(res);
    }),
    remove: h(async (req, res) => {
      const d = await M.findOneAndDelete({ _id: req.params.id, ...scope(req.user) });
      d ? res.json({ success: true, message: 'Deleted' }) : nf(res);
    }),
  };
};
