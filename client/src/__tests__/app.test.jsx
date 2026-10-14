import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, beforeEach, test, expect } from 'vitest';
vi.mock('../api.js', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }, errMsg: e => e?.message || 'error' }));
import api from '../api.js';
import App, { Auth } from '../App.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Resource from '../pages/Resource.jsx';
import Detail from '../pages/Detail.jsx';
import Settings from '../pages/Settings.jsx';
import ActivityTimeline from '../components/ActivityTimeline.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import { leadsCfg } from '../configs.js';

const lead = { _id: '1', firstName: 'Jane', lastName: 'Doe', company: 'Acme Corp', status: 'Qualified', priority: 'High', estimatedValue: 5000, assignedTo: { _id: 'u1', name: 'Sam' } };
const customer = { _id: '2', name: 'Globex Ltd', company: 'Globex', status: 'Active' };
const deal = { _id: '3', name: 'Big Deal', value: 100000, probability: 50, stage: 'Proposal', customer: { name: 'Globex Ltd' }, assignedTo: { name: 'Sam' } };
const acts = [{ _id: 'a1', type: 'Call', title: 'Intro call', status: 'Completed', date: '2026-01-05', createdBy: { name: 'Sam' } }];
const routes = {
  '/leads/1': { data: lead }, '/customers/2': { data: customer }, '/deals/3': { data: deal }, '/customers/2/related': { data: { deals: [deal], leads: [], totalDealValue: 100000 } },
  '/leads': { data: [lead], pagination: { page: 1, pages: 1, total: 1 } }, '/users/options': { data: [] }, '/activities': { data: acts },
  '/dashboard/summary': { data: { kpis: { totalLeads: 4, newLeads: 1, qualifiedLeads: 1, totalCustomers: 2, activeDeals: 1, wonDeals: 1, lostDeals: 0, revenue: 10, pipelineValue: 20, weightedPipeline: 5, conversionRate: 25 },
    leadsByStatus: [], leadsBySource: [], dealsByStage: [], monthlyRevenue: [], performance: [] } },
  '/dashboard/customer-growth': { data: [{ month: 'Jan 2026', customers: 2 }] },
  '/notifications': { data: [{ _id: 'n1', title: 'Deal won', message: 'Big Deal closed', isRead: false, createdAt: '2026-01-01', relatedEntityType: 'deal', relatedEntityId: '3' }], unread: 2 },
};
beforeEach(() => { localStorage.clear(); vi.clearAllMocks();
  api.get.mockImplementation(url => Promise.resolve({ data: routes[url.split('?')[0]] ?? { data: [] } })); api.put.mockResolvedValue({ data: { data: {} } }); });
const user = { name: 'Sam', email: 's@x.com', role: 'ADMIN', isActive: true, createdAt: '2026-01-01' };
const at = (ui, path = '/') => render(<Auth.Provider value={{ user, logout: vi.fn(), setUser: vi.fn() }}><MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter></Auth.Provider>);

test('login form renders when logged out', async () => { render(<MemoryRouter><App /></MemoryRouter>); expect(await screen.findByText('Sign in to your workspace')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument(); });
test('protected route redirects to login without a token', async () => { render(<MemoryRouter initialEntries={['/leads']}><App /></MemoryRouter>); expect(await screen.findByText('Sign in to your workspace')).toBeInTheDocument(); });
test('dashboard renders KPIs and the customer growth chart', async () => { at(<Dashboard />); expect(await screen.findByText('Total Leads')).toBeInTheDocument(); expect(screen.getByText('Customer Growth')).toBeInTheDocument(); });
test('leads page lists leads with a link to the detail page', async () => { at(<Resource cfg={leadsCfg} />); expect(await screen.findByRole('link', { name: 'Jane Doe' })).toHaveAttribute('href', '/leads/1'); });
test('lead detail page', async () => { at(<Routes><Route path="/leads/:id" element={<Detail kind="lead" />} /></Routes>, '/leads/1'); expect(await screen.findByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument(); expect(screen.getByText('Add activity')).toBeInTheDocument(); expect(await screen.findByText('Intro call')).toBeInTheDocument(); });
test('customer detail page shows associated deals', async () => { at(<Routes><Route path="/customers/:id" element={<Detail kind="customer" />} /></Routes>, '/customers/2'); expect(await screen.findByRole('heading', { name: 'Globex Ltd' })).toBeInTheDocument(); expect(await screen.findByRole('link', { name: 'Big Deal' })).toBeInTheDocument(); });
test('deal detail page shows the weighted value', async () => { at(<Routes><Route path="/deals/:id" element={<Detail kind="deal" />} /></Routes>, '/deals/3'); expect(await screen.findByText('₹50,000')).toBeInTheDocument(); });
test('activity timeline renders items from the API', async () => { at(<ActivityTimeline filter={{ lead: '1' }} />); expect(await screen.findByText('Intro call')).toBeInTheDocument(); expect(api.get).toHaveBeenCalledWith('/activities', expect.objectContaining({ params: expect.objectContaining({ lead: '1' }) })); });
test('settings page sections', () => { at(<Settings />); for (const t of ['Profile Settings', 'Password', 'Appearance', 'Notification Preferences', 'Account']) expect(screen.getByRole('heading', { name: t })).toBeInTheDocument(); });
test('notification dropdown shows badge and items', async () => { at(<NotificationBell />); expect(await screen.findByText('2')).toBeInTheDocument(); fireEvent.click(screen.getByLabelText('Notifications')); expect(await screen.findByText('Deal won')).toBeInTheDocument(); fireEvent.click(screen.getByText('Mark all read')); await waitFor(() => expect(api.put).toHaveBeenCalledWith('/notifications/read-all')); });
