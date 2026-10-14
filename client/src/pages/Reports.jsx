import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import api, { errMsg } from '../api.js';
const SRC = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Advertisement', 'Email Campaign', 'Event', 'Other'], STG = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const Tbl = ({ t, cols, rows }) => <div className="card tablewrap" style={{ marginBottom: 16 }}><h3 style={{ padding: '12px 12px 0' }}>{t}</h3><table><thead><tr>{cols.map(c => <th key={c[0]}>{c[1]}</th>)}</tr></thead>
  <tbody>{rows.length ? rows.map((r, i) => <tr key={i}>{cols.map(c => <td key={c[0]}>{r[c[0]]}</td>)}</tr>) : <tr><td colSpan={9} className="center muted">No data</td></tr>}</tbody></table></div>;
export default function Reports() {
  const [f, setF] = useState({}), [d, setD] = useState(null), [users, setUsers] = useState([]), [err, setErr] = useState('');
  const load = useCallback(() => { setD(null); api.get('/reports', { params: f }).then(r => setD(r.data.data)).catch(e => setErr(errMsg(e))); }, [f]);
  useEffect(() => { load(); }, [load]); useEffect(() => { api.get('/users/options').then(r => setUsers(r.data.data)); }, []);
  const csv = () => { const sec = (n, rows) => `${n}\n` + (rows.length ? [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n') : 'no data');
    const b = new Blob([[sec('Employee performance', d.perEmployee), sec('Lead sources', d.bySource), sec('Deal pipeline', d.byStage), sec('Revenue', d.revenue)].join('\n\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'nexacrm-report.csv'; a.click(); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<div><div className="bar"><h1>Reports</h1><div className="grow" /><button className="btn" disabled={!d} onClick={csv}><Download size={16} /> Export CSV</button></div>
    <div className="bar"><input type="date" style={{ width: 'auto' }} onChange={set('from')} /><input type="date" style={{ width: 'auto' }} onChange={set('to')} />
      <select onChange={set('assignedTo')}><option value="">All salespeople</option>{users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select>
      <select onChange={set('source')}><option value="">All sources</option>{SRC.map(s => <option key={s}>{s}</option>)}</select>
      <select onChange={set('stage')}><option value="">All stages</option>{STG.map(s => <option key={s}>{s}</option>)}</select></div>
    {err && <div className="alert">{err}</div>}{!d ? <div className="center">Loading...</div> : <>
      <Tbl t="Employee performance" cols={[['name', 'Name'], ['leads', 'Leads'], ['wonLeads', 'Won leads'], ['deals', 'Deals'], ['wonDeals', 'Won deals'], ['revenue', 'Revenue']]} rows={d.perEmployee} />
      <Tbl t="Lead sources & conversion" cols={[['source', 'Source'], ['leads', 'Leads'], ['won', 'Won'], ['conversion', 'Conversion %']]} rows={d.bySource} />
      <Tbl t="Deal pipeline" cols={[['stage', 'Stage'], ['deals', 'Deals'], ['value', 'Value'], ['weighted', 'Weighted']]} rows={d.byStage} />
      <Tbl t="Revenue by month" cols={[['month', 'Month'], ['revenue', 'Revenue']]} rows={d.revenue} /></>}</div>);
}
