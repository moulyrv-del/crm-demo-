import { useState } from 'react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../App.jsx';
import { toast } from './Resource.jsx';
const NOTIF = [['email', 'Email notifications'], ['followUps', 'Follow-up reminders'], ['deals', 'Deal notifications'], ['leads', 'Lead notifications'], ['system', 'System notifications']];
export default function Settings() {
  const { user, setUser } = useAuth();
  const [p, setP] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '', department: user.department || '' });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const prefs = { email: true, followUps: true, deals: true, leads: true, system: true, ...(user.preferences?.notifications || {}) };
  const theme = user.preferences?.theme || 'light';
  const save = async (call, msg = 'Saved') => { try { const r = await call(); if (r.data.data) setUser(r.data.data); toast(msg); } catch (e) { toast(errMsg(e), true); } };
  const changePw = (e) => { e.preventDefault(); if (pw.next !== pw.confirm) return toast('New passwords do not match', true);
    save(() => api.put('/auth/password', { currentPassword: pw.current, newPassword: pw.next }), 'Password updated').then(() => setPw({ current: '', next: '', confirm: '' })); };
  return (<div style={{ maxWidth: 760 }}><h1>Settings</h1>
    <form className="card" onSubmit={e => { e.preventDefault(); save(() => api.put('/auth/profile', p)); }} style={{ marginBottom: 16 }}><h3>Profile Settings</h3>
      <div className="grid">{[['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['department', 'Department']].map(([k, l]) => <div key={k}><label>{l}</label><input value={p[k]} onChange={e => setP({ ...p, [k]: e.target.value })} /></div>)}</div>
      <div className="bar" style={{ marginTop: 12 }}><button className="btn">Save profile</button></div></form>
    <form className="card" onSubmit={changePw} style={{ marginBottom: 16 }}><h3>Password</h3>
      <div className="grid"><div className="full"><label>Current password</label><input type="password" required value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} /></div>
        <div><label>New password</label><input type="password" required minLength={6} value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></div>
        <div><label>Confirm new password</label><input type="password" required value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} /></div></div>
      <div className="bar" style={{ marginTop: 12 }}><button className="btn">Change password</button></div></form>
    <div className="card" style={{ marginBottom: 16 }}><h3>Appearance</h3><div className="bar">{['light', 'dark'].map(t => <button key={t} className={'btn' + (theme === t ? '' : ' ghost')} onClick={() => save(() => api.put('/auth/preferences', { theme: t }))}>{t === 'light' ? 'Light mode' : 'Dark mode'}</button>)}</div></div>
    <div className="card" style={{ marginBottom: 16 }}><h3>Notification Preferences</h3>{NOTIF.map(([k, l]) => <label key={k} className="check"><input type="checkbox" checked={prefs[k]} onChange={e => save(() => api.put('/auth/preferences', { notifications: { [k]: e.target.checked } }))} /> {l}</label>)}</div>
    <div className="card"><h3>Account</h3><p>Role: <b>{String(user.role || '').replace('_', ' ')}</b></p><p>Status: <b>{user.isActive === false ? 'Inactive' : 'Active'}</b></p><p>Member since: <b>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</b></p>
      {user.role === 'ADMIN' && <p className="muted">Admin: manage accounts and roles from the Users page.</p>}</div></div>);
}
