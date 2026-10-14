import { useState, useEffect } from 'react';
import api, { errMsg } from '../api.js';
import { Field, toast } from '../pages/Resource.jsx';
export default function RecordForm({ cfg, row, initial = {}, onClose, onSaved }) {
  const [refs, setRefs] = useState({}), [busy, setBusy] = useState(false);
  const [data, setData] = useState(() => { const d = {}; cfg.fields.forEach(f => { const x = row?.[f.name]; d[f.name] = x && typeof x === 'object' ? x._id : f.type === 'date' && x ? String(x).slice(0, 10) : (x ?? ''); }); return { ...d, ...initial }; });
  useEffect(() => { cfg.fields.filter(f => f.type === 'ref').forEach(f => api.get(f.url).then(r => setRefs(p => ({ ...p, [f.name]: r.data.data }))).catch(() => {})); }, [cfg]);
  const save = async (e) => { e.preventDefault(); setBusy(true);
    try { const body = { ...data }; Object.keys(body).forEach(k => { if (body[k] === '') delete body[k]; });
      row ? await api.put(`${cfg.url}/${row._id}`, body) : await api.post(cfg.url, body); toast('Saved'); onSaved(); onClose(); } catch (x) { toast(errMsg(x), true); } setBusy(false); };
  return (<div className="overlay" onClick={onClose}><form className="card modal" onClick={e => e.stopPropagation()} onSubmit={save}><h2>{row ? 'Edit' : 'New'} {cfg.title.replace(/s$/, '')}</h2>
    <div className="grid">{cfg.fields.map(f => <div key={f.name} className={f.type === 'textarea' ? 'full' : ''}><label>{f.label}</label><Field f={f} v={String(data[f.name] ?? '')} refs={refs} set={(k, v) => setData({ ...data, [k]: v })} /></div>)}</div>
    <div className="bar"><div className="grow" /><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button></div></form></div>);
}
