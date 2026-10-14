import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Handshake, Activity, UserCog, Kanban, Mail, BarChart3, LogOut, Menu, Settings as Cog } from 'lucide-react';
import api, { errMsg } from './api.js';
import Dashboard from './pages/Dashboard.jsx';
import Resource from './pages/Resource.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Detail from './pages/Detail.jsx';
import NotificationBell from './components/NotificationBell.jsx';
import Pipeline from './pages/Pipeline.jsx';
import { leadsCfg, customersCfg, dealsCfg, activitiesCfg, usersCfg, emailsCfg } from './configs.js';

export const Auth = createContext(); export const useAuth = () => useContext(Auth);

function Login() {
  const { login } = useAuth(); const [f, setF] = useState({ email: 'admin@nexacrm.com', password: 'Admin@123' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr('');
    try { await login(f.email, f.password); } catch (x) { setErr(errMsg(x)); } setBusy(false); };
  return (<div className="login"><form className="card" onSubmit={submit}><h1>Nexa<span>CRM</span></h1><p className="muted">Sign in to your workspace</p>
    {err && <div className="alert">{err}</div>}
    <label>Email</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
    <label>Password</label><input type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
    <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
    <p className="muted small">Demo: admin@ / manager@ / sales@nexacrm.com</p></form></div>);
}

function Layout({ children }) {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false);
  const links = [['/', 'Dashboard', LayoutDashboard], ['/leads', 'Leads', Users], ['/pipeline', 'Pipeline', Kanban], ['/customers', 'Customers', UserCheck],
    ['/deals', 'Deals', Handshake], ['/activities', 'Activities', Activity], ['/emails', 'Email Logs', Mail], ...(user.role !== 'SALES_EXECUTIVE' ? [['/reports', 'Reports', BarChart3]] : []), ...(user.role === 'ADMIN' ? [['/users', 'Users', UserCog]] : []), ['/settings', 'Settings', Cog]];
  return (<div className="shell"><aside className={open ? 'side open' : 'side'} onClick={() => setOpen(false)}><h2>Nexa<span>CRM</span></h2>
    {links.map(([to, l, I]) => <NavLink key={to} to={to} end={to === '/'}><I size={18} />{l}</NavLink>)}</aside>
    <div className="main"><header><button className="icon menu" onClick={() => setOpen(!open)}><Menu /></button><div className="grow" /><NotificationBell />
      <div className="who"><b>{user.name}</b><span className="badge">{user.role.replace('_', ' ')}</span></div>
      <button className="icon" title="Logout" onClick={logout}><LogOut size={18} /></button></header><section>{children}</section></div></div>);
}

export default function App() {
  const [user, setUser] = useState(null); const [ready, setReady] = useState(false); const nav = useNavigate();
  useEffect(() => { if (!localStorage.getItem('token')) return setReady(true);
    api.get('/auth/me').then(r => setUser(r.data.data)).catch(() => localStorage.removeItem('token')).finally(() => setReady(true)); }, []);
  useEffect(() => { document.documentElement.dataset.theme = user?.preferences?.theme || 'light'; }, [user]);
  const login = async (email, password) => { const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', r.data.data.token); setUser(r.data.data.user); nav('/'); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); nav('/login'); };
  if (!ready) return <div className="center">Loading...</div>;
  if (!user) return <Auth.Provider value={{ login }}><Routes><Route path="*" element={<Login />} /></Routes></Auth.Provider>;
  return (<Auth.Provider value={{ user, logout, setUser }}><Layout><Routes>
    <Route path="/" element={<Dashboard />} /><Route path="/leads" element={<Resource cfg={leadsCfg} />} /><Route path="/pipeline" element={<Pipeline />} />
    <Route path="/customers" element={<Resource cfg={customersCfg} />} /><Route path="/deals" element={<Resource cfg={dealsCfg} />} />
    <Route path="/activities" element={<Resource cfg={activitiesCfg} />} />
    <Route path="/emails" element={<Resource cfg={emailsCfg} />} /><Route path="/reports" element={user.role !== 'SALES_EXECUTIVE' ? <Reports /> : <Navigate to="/" />} />
    <Route path="/leads/:id" element={<Detail kind="lead" />} /><Route path="/customers/:id" element={<Detail kind="customer" />} /><Route path="/deals/:id" element={<Detail kind="deal" />} /><Route path="/settings" element={<Settings />} />
    <Route path="/users" element={user.role === 'ADMIN' ? <Resource cfg={usersCfg} /> : <Navigate to="/" />} />
    <Route path="*" element={<Navigate to="/" />} /></Routes></Layout></Auth.Provider>);
}
