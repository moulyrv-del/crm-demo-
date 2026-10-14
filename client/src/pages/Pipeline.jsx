import { useState, useEffect } from 'react';
import api, { errMsg } from '../api.js';
import { toast } from './Resource.jsx';
const COLS = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
export default function Pipeline() {
  const [leads, setLeads] = useState([]), [loading, setLoading] = useState(true);
  const load = () => api.get('/leads', { params: { limit: 100 } }).then(r => setLeads(r.data.data)).catch(e => toast(errMsg(e), true)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const drop = async (e, status) => { e.preventDefault(); const id = e.dataTransfer.getData('id'); const l = leads.find(x => x._id === id); if (!l || l.status === status) return;
    setLeads(leads.map(x => x._id === id ? { ...x, status } : x));
    try { await api.put(`/leads/${id}`, { status }); toast('Moved to ' + status); } catch (x) { toast(errMsg(x), true); load(); } };
  if (loading) return <div className="center">Loading...</div>;
  return (<div><h1>Lead Pipeline</h1><p className="muted">Drag cards between columns to change status.</p><div className="kanban">{COLS.map(c => <div key={c} className="col" onDragOver={e => e.preventDefault()} onDrop={e => drop(e, c)}>
    <h3>{c} <span className="badge">{leads.filter(l => l.status === c).length}</span></h3>
    {leads.filter(l => l.status === c).map(l => <div key={l._id} className="kcard" draggable onDragStart={e => e.dataTransfer.setData('id', l._id)}><b>{l.firstName} {l.lastName}</b><div className="muted small">{l.company}</div>
      <div className="small">₹{(l.estimatedValue || 0).toLocaleString('en-IN')} · {l.priority}</div></div>)}</div>)}</div></div>);
}
