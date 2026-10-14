import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api, { errMsg } from '../api.js';
const C = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#64748b'];
const K = [['totalLeads', 'Total Leads'], ['newLeads', 'New Leads'], ['qualifiedLeads', 'Qualified Leads'], ['totalCustomers', 'Customers'], ['activeDeals', 'Active Deals'], ['wonDeals', 'Won Deals'],
  ['lostDeals', 'Lost Deals'], ['revenue', 'Revenue', '₹'], ['pipelineValue', 'Pipeline Value', '₹'], ['weightedPipeline', 'Weighted Pipeline', '₹'], ['conversionRate', 'Conversion Rate', '', '%']];
const Box = ({ t, children }) => <div className="card"><h3>{t}</h3><div style={{ height: 240 }}><ResponsiveContainer>{children}</ResponsiveContainer></div></div>;
export default function Dashboard() {
  const [d, setD] = useState(null), [err, setErr] = useState('');
  useEffect(() => { Promise.all([api.get('/dashboard/summary'), api.get('/dashboard/customer-growth')]).then(([a, b]) => setD({ ...a.data.data, customerGrowth: b.data.data })).catch(e => setErr(errMsg(e))); }, []);
  if (err) return <div className="alert">{err}</div>; if (!d) return <div className="center">Loading dashboard...</div>;
  return (<div><h1>Dashboard</h1><div className="kpis">{K.map(([k, l, pre = '', suf = '']) => <div key={k} className="card kpi"><span className="muted">{l}</span><b>{pre}{Number(d.kpis[k]).toLocaleString('en-IN')}{suf}</b></div>)}</div>
    <div className="charts">
      <Box t="Leads by Status"><PieChart><Pie data={d.leadsByStatus} dataKey="value" nameKey="name" outerRadius={90} label>{d.leadsByStatus.map((_, i) => <Cell key={i} fill={C[i % 8]} />)}</Pie><Tooltip /></PieChart></Box>
      <Box t="Leads by Source"><BarChart data={d.leadsBySource}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#6366f1" /></BarChart></Box>
      <Box t="Deals by Stage"><BarChart data={d.dealsByStage}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#22c55e" /></BarChart></Box>
      <Box t="Pipeline Value by Stage"><BarChart data={d.dealsByStage}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#f59e0b" /></BarChart></Box>
      <Box t="Monthly Revenue"><LineChart data={d.monthlyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line dataKey="revenue" stroke="#6366f1" strokeWidth={2} /></LineChart></Box>
      <Box t="Sales Performance by Employee"><BarChart data={d.performance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis /><Tooltip /><Bar dataKey="revenue" fill="#06b6d4" /></BarChart></Box>
      <Box t="Customer Growth"><LineChart data={d.customerGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Line dataKey="customers" stroke="#a855f7" strokeWidth={2} /></LineChart></Box>
      <Box t="Won vs Lost Deals"><PieChart><Pie data={[{ name: 'Won', value: d.kpis.wonDeals }, { name: 'Lost', value: d.kpis.lostDeals }]} dataKey="value" nameKey="name" outerRadius={90} label><Cell fill="#22c55e" /><Cell fill="#ef4444" /></Pie><Tooltip /></PieChart></Box>
    </div></div>);
}
