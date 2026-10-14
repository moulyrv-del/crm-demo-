import { useState, useEffect, useCallback } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
const PATH = { lead: '/leads/', customer: '/customers/', deal: '/deals/' };
export default function NotificationBell() {
  const [open, setOpen] = useState(false), [items, setItems] = useState([]), [unread, setUnread] = useState(0), nav = useNavigate();
  const load = useCallback(() => api.get('/notifications').then(r => { setItems(r.data.data); setUnread(r.data.unread); }).catch(() => {}), []);
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);
  const go = async (n) => { if (!n.isRead) await api.put(`/notifications/${n._id}/read`).catch(() => {}); setOpen(false); load(); if (PATH[n.relatedEntityType]) nav(PATH[n.relatedEntityType] + n.relatedEntityId); };
  const readAll = async () => { await api.put('/notifications/read-all'); load(); };
  const del = async (e, n) => { e.stopPropagation(); await api.delete(`/notifications/${n._id}`); load(); };
  return (<div className="bell"><button className="icon" aria-label="Notifications" onClick={() => setOpen(!open)}><Bell size={18} />{unread > 0 && <span className="count">{unread}</span>}</button>
    {open && <div className="card drop"><div className="bar" style={{ marginBottom: 6 }}><b>Notifications</b><div className="grow" /><button className="link" onClick={readAll}>Mark all read</button></div>
      {!items.length ? <div className="muted center">You're all caught up</div> : items.map(n => <div key={n._id} className={'nitem' + (n.isRead ? '' : ' unread')} onClick={() => go(n)}>
        <div className="grow"><b>{n.title}</b><div className="muted small">{n.message}</div><div className="muted small">{new Date(n.createdAt).toLocaleString()}</div></div>
        <button className="icon" aria-label="Delete notification" onClick={e => del(e, n)}><Trash2 size={14} /></button></div>)}</div>}</div>);
}
