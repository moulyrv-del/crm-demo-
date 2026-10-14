import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, UserCheck } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../App.jsx';
import { Badge, toast } from './Resource.jsx';
import ActivityTimeline from '../components/ActivityTimeline.jsx';
import ActivityForm from '../components/ActivityForm.jsx';
import RecordForm from '../components/RecordForm.jsx';
import { leadsCfg, customersCfg, dealsCfg } from '../configs.js';
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN'), dt = d => (d ? new Date(d).toLocaleDateString() : '-');
const CFG = { lead: leadsCfg, customer: customersCfg, deal: dealsCfg }, BASE = { lead: '/leads', customer: '/customers', deal: '/deals' };
const TITLE = { lead: r => `${r.firstName} ${r.lastName}`, customer: r => r.name, deal: r => r.name };
const Q = { lead: [['status', leadsCfg.filters[0].opts], ['priority', leadsCfg.filters[1].opts]], customer: [['status', ['Active', 'Inactive', 'Churned']]],
  deal: [['stage', dealsCfg.filters[0].opts], ['probability', [0, 10, 25, 50, 75, 90, 100]]] };
const INFO = {
  lead: r => [['Company', r.company], ['Email', r.email], ['Phone', r.phone], ['Job title', r.jobTitle], ['Source', r.source], ['Industry', r.industry], ['Status', r.status], ['Priority', r.priority],
    ['Assigned to', r.assignedTo?.name], ['Estimated value', money(r.estimatedValue)], ['Expected close', dt(r.expectedCloseDate)], ['Created', dt(r.createdAt)], ['Updated', dt(r.updatedAt)], ['Notes', r.notes]],
  customer: (r, x) => [['Company', r.company], ['Email', r.email], ['Phone', r.phone], ['Industry', r.industry], ['Address', r.address], ['City', r.city], ['State', r.state], ['Country', r.country],
    ['Assigned to', r.assignedTo?.name], ['Status', r.status], ['Total deal value', money(x?.totalDealValue)], ['Created', dt(r.createdAt)], ['Notes', r.notes]],
  deal: r => [['Customer', r.customer?.name], ['Company', r.company], ['Deal value', money(r.value)], ['Stage', r.stage], ['Probability', r.probability + '%'], ['Expected close', dt(r.expectedCloseDate)],
    ['Assigned to', r.assignedTo?.name], ['Lead source', r.source], ['Description', r.description], ['Created', dt(r.createdAt)], ['Updated', dt(r.updatedAt)]],
};
export default function Detail({ kind }) {
  const { id } = useParams(), nav = useNavigate(), { user } = useAuth(), cfg = CFG[kind], base = BASE[kind];
  const [r, setR] = useState(null), [rel, setRel] = useState(null), [users, setUsers] = useState([]), [err, setErr] = useState(''), [modal, setModal] = useState(''), [rk, setRk] = useState(0);
  const load = useCallback(async () => { setErr('');
    try { setR((await api.get(`${base}/${id}`)).data.data); if (kind === 'customer') setRel((await api.get(`/customers/${id}/related`)).data.data); } catch (e) { setErr(errMsg(e)); } }, [id, kind, base]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (kind === 'lead') api.get('/users/options').then(x => setUsers(x.data.data)).catch(() => {}); }, [kind]);
  const refresh = () => { load(); setRk(k => k + 1); };
  const put = async (body) => { try { await api.put(`${base}/${id}`, body); toast('Updated'); refresh(); } catch (e) { toast(errMsg(e), true); } };
  const del = async () => { if (!window.confirm('Delete this record?')) return; try { await api.delete(`${base}/${id}`); toast('Deleted'); nav(base); } catch (e) { toast(errMsg(e), true); } };
  const convert = async () => { try { await api.post(`/leads/${id}/convert`); toast('Converted to customer'); refresh(); } catch (e) { toast(errMsg(e), true); } };
  if (err) return <div><div className="alert">{err}</div><Link className="link" to={base}>Back to list</Link></div>;
  if (!r) return <div className="center">Loading...</div>;
  const weighted = Math.round((r.value || 0) * (r.probability || 0) / 100);
  return (<div><Link className="link" to={base}>← Back</Link>
    <div className="bar"><h1 style={{ margin: 0 }}>{TITLE[kind](r)}</h1><Badge v={r.status || r.stage} /><div className="grow" />
      {kind === 'lead' && !r.convertedCustomer && <button className="btn ghost" onClick={convert}><UserCheck size={16} /> Convert to customer</button>}
      {kind === 'customer' && <button className="btn ghost" onClick={() => setModal('deal')}><Plus size={16} /> Create deal</button>}
      <button className="btn ghost" onClick={() => setModal('activity')}><Plus size={16} /> Add activity</button>
      <button className="btn ghost" onClick={() => setModal('edit')}><Pencil size={16} /> Edit</button>
      {cfg.canDelete.includes(user.role) && <button className="btn ghost" onClick={del}><Trash2 size={16} /> Delete</button>}</div>
    <div className="detail-grid"><div className="card"><h3>Information</h3><dl>{INFO[kind](r, rel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || '-'}</dd></div>)}</dl></div>
      <div className="card"><h3>Quick changes</h3>{Q[kind].map(([f, opts]) => <div key={f}><label>Change {f}</label><select value={r[f] ?? ''} onChange={e => put({ [f]: f === 'probability' ? Number(e.target.value) : e.target.value })}>{opts.map(o => <option key={o} value={o}>{f === 'probability' ? o + '%' : o}</option>)}</select></div>)}
        {kind === 'lead' && user.role !== 'SALES_EXECUTIVE' && <div><label>Assign salesperson</label><select value={r.assignedTo?._id || ''} onChange={e => put({ assignedTo: e.target.value })}><option value="">--</option>{users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select></div>}
        {kind === 'deal' && <div className="calc"><div className="muted small">Weighted value (value × probability)</div><b>{money(weighted)}</b><div className="muted small">{money(r.value)} × {r.probability}%</div></div>}</div></div>
    {kind === 'customer' && rel && <div className="card tablewrap" style={{ marginBottom: 16 }}><h3 style={{ padding: '12px 12px 0' }}>Associated deals</h3><table><thead><tr><th>Deal</th><th>Value</th><th>Stage</th></tr></thead>
      <tbody>{rel.deals.length ? rel.deals.map(d => <tr key={d._id}><td><Link className="link" to={`/deals/${d._id}`}>{d.name}</Link></td><td>{money(d.value)}</td><td><Badge v={d.stage} /></td></tr>) : <tr><td colSpan={3} className="center muted">No deals yet</td></tr>}</tbody></table>
      {rel.leads.length > 0 && <p style={{ padding: '0 12px' }}>Converted from lead: {rel.leads.map(l => <Link key={l._id} className="link" to={`/leads/${l._id}`}>{l.firstName} {l.lastName}</Link>)}</p>}</div>}
    <div className="card"><h3>Activity timeline</h3><ActivityTimeline filter={{ [kind]: id }} refreshKey={rk} /></div>
    {modal === 'edit' && <RecordForm cfg={cfg} row={r} onClose={() => setModal('')} onSaved={refresh} />}
    {modal === 'deal' && <RecordForm cfg={dealsCfg} initial={{ customer: id, company: r.company || '' }} onClose={() => setModal('')} onSaved={refresh} />}
    {modal === 'activity' && <ActivityForm related={{ [kind]: id }} onClose={() => setModal('')} onSaved={() => setRk(k => k + 1)} />}</div>);
}
