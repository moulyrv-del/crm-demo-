import { useState, useEffect } from 'react';
import { Phone, Mail, Users, Clock, StickyNote, CheckSquare, GitBranch } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { Badge } from '../pages/Resource.jsx';
const ICON = { Call: Phone, Email: Mail, Meeting: Users, 'Follow-up': Clock, Note: StickyNote, Task: CheckSquare, 'Status Change': GitBranch };
export default function ActivityTimeline({ filter, refreshKey = 0 }) {
  const [items, setItems] = useState(null), [err, setErr] = useState('');
  useEffect(() => { setItems(null); setErr('');
    api.get('/activities', { params: { ...filter, limit: 100, sort: '-date' } }).then(r => setItems(r.data.data)).catch(e => setErr(errMsg(e)));
  }, [JSON.stringify(filter), refreshKey]);
  if (err) return <div className="alert">{err}</div>;
  if (!items) return <div className="center">Loading timeline...</div>;
  if (!items.length) return <div className="center muted">No activity yet</div>;
  return (<ul className="timeline">{items.map(a => { const I = ICON[a.type] || StickyNote; return (
    <li key={a._id}><span className="dot"><I size={14} /></span><div><div className="bar" style={{ marginBottom: 2 }}><b>{a.title}</b><Badge v={a.type} /><Badge v={a.status} /></div>
      {a.description && <div className="muted">{a.description}</div>}
      <div className="muted small">{a.createdBy?.name || 'System'} · {new Date(a.date).toLocaleDateString()} {a.time || new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div></li>); })}</ul>);
}
