import { useState } from 'react';
import api, { errMsg } from '../api.js';
import { toast } from '../pages/Resource.jsx';
export default function ActivityForm({ related, onClose, onSaved }) {
  const [f, setF] = useState({ type: 'Call', title: '', description: '', date: new Date().toISOString().slice(0, 10), time: '', status: 'Pending' }), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => { e.preventDefault(); setBusy(true);
    try { const body = { ...f, ...related }; if (!body.time) delete body.time; await api.post('/activities', body); toast('Activity added'); onSaved(); onClose(); }
    catch (x) { toast(errMsg(x), true); } setBusy(false); };
  return (<div className="overlay" onClick={onClose}><form className="card modal" onClick={e => e.stopPropagation()} onSubmit={submit}><h2>Add activity</h2>
    <div className="grid"><div><label>Type</label><select value={f.type} onChange={set('type')}>{['Call', 'Email', 'Meeting', 'Follow-up', 'Note', 'Task'].map(t => <option key={t}>{t}</option>)}</select></div>
      <div><label>Status</label><select value={f.status} onChange={set('status')}>{['Pending', 'Completed', 'Cancelled'].map(t => <option key={t}>{t}</option>)}</select></div>
      <div className="full"><label>Title</label><input required value={f.title} onChange={set('title')} /></div>
      <div><label>Date</label><input type="date" value={f.date} onChange={set('date')} /></div><div><label>Time</label><input value={f.time} placeholder="10:30" onChange={set('time')} /></div>
      <div className="full"><label>Description</label><textarea rows={3} value={f.description} onChange={set('description')} /></div></div>
    <div className="bar"><div className="grow" /><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button></div></form></div>);
}
