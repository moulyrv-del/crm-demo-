import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../App.jsx';

export function Badge({ v }) { return <span className={'badge b-' + String(v).toLowerCase().replace(/\W/g, '')}>{v}</span>; }
export function toast(msg, bad) { const d = document.createElement('div'); d.className = 'toast' + (bad ? ' bad' : ''); d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 3000); }

export function Field({ f, v, set, refs }) {
  const common = { value: v ?? '', required: f.req, onChange: e => set(f.name, e.target.value) };
  if (f.type === 'textarea') return <textarea rows={3} {...common} />;
  if (f.type === 'select') return <select {...common}><option value="">--</option>{f.opts.map(o => { const [a, b] = Array.isArray(o) ? o : [o, o]; return <option key={a} value={a}>{b}</option>; })}</select>;
  if (f.type === 'ref') return <select {...common}><option value="">--</option>{(refs[f.name] || []).map(o => <option key={o._id} value={o._id}>{o[f.label2]}{o.lastName ? ' ' + o.lastName : ''}</option>)}</select>;
  return <input type={f.type || 'text'} {...common} />;
}

export default function Resource({ cfg }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]), [pg, setPg] = useState({ page: 1, pages: 1, total: 0 }), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [q, setQ] = useState({ search: '', page: 1, sort: '-createdAt' }), [filters, setFilters] = useState({}), [modal, setModal] = useState(null), [busy, setBusy] = useState(false);
  const [refs, setRefs] = useState({});
  const load = useCallback(async () => { setLoading(true); setError('');
    try { const r = await api.get(cfg.url, { params: { ...q, ...filters } }); setRows(r.data.data); setPg(r.data.pagination); } catch (e) { setError(errMsg(e)); } setLoading(false); }, [cfg, q, filters]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setQ({ search: '', page: 1, sort: '-createdAt' }); setFilters({}); }, [cfg]);
  useEffect(() => { cfg.fields.filter(f => f.type === 'ref').forEach(f => api.get(f.url).then(r => setRefs(p => ({ ...p, [f.name]: r.data.data })))); }, [cfg]);
  const open = (row) => { const d = {}; cfg.fields.forEach(f => { const x = row?.[f.name]; d[f.name] = x && typeof x === 'object' ? x._id : f.type === 'date' && x ? String(x).slice(0, 10) : (x ?? ''); });
    if (!row) d.__new = true; setModal({ id: row?._id, data: d }); };
  const save = async (e) => { e.preventDefault(); setBusy(true);
    try { const body = { ...modal.data }; delete body.__new; Object.keys(body).forEach(k => { if (body[k] === '') delete body[k]; });
      cfg.fields.filter(f => f.bool).forEach(f => { if (body[f.name] !== undefined) body[f.name] = body[f.name] === true || body[f.name] === 'true'; });
      modal.id ? await api.put(`${cfg.url}/${modal.id}`, body) : await api.post(cfg.url, body);
      toast('Saved'); setModal(null); load(); } catch (x) { toast(errMsg(x), true); } setBusy(false); };
  const del = async (r) => { if (!window.confirm('Delete this record?')) return; try { await api.delete(`${cfg.url}/${r._id}`); toast('Deleted'); load(); } catch (x) { toast(errMsg(x), true); } };
  const convert = async (r) => { try { await api.post(`/leads/${r._id}/convert`); toast('Converted to customer'); load(); } catch (x) { toast(errMsg(x), true); } };
  const canDel = cfg.canDelete.includes(user.role);
  return (<div><div className="bar"><h1>{cfg.title}</h1><div className="grow" /><button className="btn" onClick={() => open()}><Plus size={16} /> New</button></div>
    <div className="bar"><div className="search"><Search size={16} /><input placeholder="Search..." value={q.search} onChange={e => setQ({ ...q, search: e.target.value, page: 1 })} /></div>
      {cfg.filters.map(f => <select key={f.key} value={filters[f.key] || ''} onChange={e => { setFilters({ ...filters, [f.key]: e.target.value }); setQ({ ...q, page: 1 }); }}><option value="">All {f.key}</option>{f.opts.map(o => <option key={o}>{o}</option>)}</select>)}</div>
    {error && <div className="alert">{error} <button className="link" onClick={load}>Retry</button></div>}
    <div className="card tablewrap"><table><thead><tr>{cfg.columns.map(c => <th key={c.label} className={c.sort ? 'sortable' : ''} onClick={() => c.sort && setQ({ ...q, sort: q.sort === c.sort ? '-' + c.sort : c.sort })}>{c.label}</th>)}<th /></tr></thead>
      <tbody>{loading ? <tr><td colSpan={9} className="center">Loading...</td></tr> : !rows.length ? <tr><td colSpan={9} className="center muted">No records found</td></tr> :
        rows.map(r => <tr key={r._id}>{cfg.columns.map(c => <td key={c.label}>{cfg.detail && c === cfg.columns[0] ? <Link className="link" to={`${cfg.detail}/${r._id}`}>{c.render ? c.render(r) : r[c.key]}</Link> : c.badge ? <Badge v={r[c.key]} /> : c.render ? c.render(r) : (r[c.key] ?? '-')}</td>)}
          <td className="acts">{cfg.convert && !r.convertedCustomer && <button className="icon" title="Convert to customer" onClick={() => convert(r)}><UserCheck size={16} /></button>}
            <button className="icon" onClick={() => open(r)}><Pencil size={16} /></button>{canDel && <button className="icon danger" onClick={() => del(r)}><Trash2 size={16} /></button>}</td></tr>)}</tbody></table></div>
    <div className="bar"><span className="muted">{pg.total} records</span><div className="grow" /><button className="btn ghost" disabled={q.page <= 1} onClick={() => setQ({ ...q, page: q.page - 1 })}>Prev</button>
      <span>Page {pg.page} / {pg.pages || 1}</span><button className="btn ghost" disabled={q.page >= pg.pages} onClick={() => setQ({ ...q, page: q.page + 1 })}>Next</button></div>
    {modal && <div className="overlay" onClick={() => setModal(null)}><form className="card modal" onClick={e => e.stopPropagation()} onSubmit={save}><h2>{modal.id ? 'Edit' : 'New'} {cfg.title.replace(/s$/, '')}</h2>
      <div className="grid">{cfg.fields.map(f => <div key={f.name} className={f.type === 'textarea' ? 'full' : ''}><label>{f.label}</label>
        <Field f={f} v={String(modal.data[f.name] ?? '')} refs={refs} set={(k, v) => setModal({ ...modal, data: { ...modal.data, [k]: v } })} /></div>)}</div>
      <div className="bar"><div className="grow" /><button type="button" className="btn ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button></div></form></div>}</div>);
}
