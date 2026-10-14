process.env.JWT_SECRET = 'test-secret'; process.env.CLIENT_URL = 'http://localhost:5173';
delete process.env.MONGODB_URI; // tests only ever use the in-memory database below
const request = require('supertest'), mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app'), User = require('../src/models/User');
let mongod; const T = {}, I = {};
const api = (m, p, t, body) => { const r = request(app)[m]('/api' + p); if (t) r.set('Authorization', 'Bearer ' + T[t]); return body ? r.send(body) : r; };
const creds = [['admin', 'admin@t.com', 'Admin@123'], ['manager', 'manager@t.com', 'Manager@123'], ['sales', 'sales@t.com', 'Sales@123']];
beforeAll(async () => {
  mongod = await MongoMemoryServer.create(); await mongoose.connect(mongod.getUri());
  await User.create([{ name: 'Admin', email: 'admin@t.com', password: 'Admin@123', role: 'ADMIN' }, { name: 'Manager', email: 'manager@t.com', password: 'Manager@123', role: 'SALES_MANAGER' }, { name: 'Sales', email: 'sales@t.com', password: 'Sales@123', role: 'SALES_EXECUTIVE' }]);
  for (const [k, email, password] of creds) T[k] = (await request(app).post('/api/auth/login').send({ email, password })).body.data.token;
});
afterAll(async () => { await mongoose.disconnect(); await mongod.stop(); });

describe('Authentication', () => {
  test('successful login', async () => { const r = await request(app).post('/api/auth/login').send({ email: 'admin@t.com', password: 'Admin@123' }); expect(r.status).toBe(200); expect(r.body.data.token).toBeTruthy(); expect(r.body.data.user.password).toBeUndefined(); });
  test('invalid login', async () => expect((await request(app).post('/api/auth/login').send({ email: 'admin@t.com', password: 'bad' })).status).toBe(401));
  test('protected endpoint without token', async () => expect((await api('get', '/leads')).status).toBe(401));
  test('protected endpoint with token', async () => { const r = await api('get', '/auth/me', 'admin'); expect(r.status).toBe(200); expect(r.body.data.role).toBe('ADMIN'); });
});
describe('Leads', () => {
  test('create', async () => { const r = await api('post', '/leads', 'admin', { firstName: 'Jane', lastName: 'Doe', company: 'Acme', estimatedValue: 5000 }); expect(r.status).toBe(201); I.lead = r.body.data._id; });
  test('list (paginated)', async () => { const r = await api('get', '/leads?page=1&limit=5', 'admin'); expect(r.status).toBe(200); expect(r.body.pagination.total).toBeGreaterThanOrEqual(1); });
  test('get one', async () => expect((await api('get', '/leads/' + I.lead, 'admin')).body.data.firstName).toBe('Jane'));
  test('update status logs a timeline entry', async () => {
    expect((await api('put', '/leads/' + I.lead, 'admin', { status: 'Qualified' })).body.data.status).toBe('Qualified');
    const a = await api('get', '/activities?lead=' + I.lead, 'admin'); expect(a.body.data.length).toBe(1); expect(a.body.data[0].title).toMatch(/Qualified/);
  });
  test('unauthorized access', async () => {
    expect((await api('get', '/leads/' + I.lead, 'sales')).status).toBe(404);
    expect((await api('delete', '/leads/' + I.lead, 'sales')).status).toBe(403);
    expect((await api('get', '/leads/not-an-id', 'admin')).status).toBe(400);
  });
  test('delete (admin only)', async () => { const t = await api('post', '/leads', 'admin', { firstName: 'Tmp', lastName: 'Lead' }); expect((await api('delete', '/leads/' + t.body.data._id, 'admin')).status).toBe(200); });
});
describe('Customers', () => {
  test('create', async () => { const r = await api('post', '/customers', 'admin', { name: 'Acme Ltd', company: 'Acme' }); expect(r.status).toBe(201); I.cust = r.body.data._id; });
  test('list, details, related, update', async () => {
    expect((await api('get', '/customers', 'admin')).body.data.length).toBeGreaterThanOrEqual(1);
    expect((await api('get', '/customers/' + I.cust, 'admin')).body.data.name).toBe('Acme Ltd');
    expect((await api('get', `/customers/${I.cust}/related`, 'admin')).body.data.deals).toEqual([]);
    expect((await api('put', '/customers/' + I.cust, 'admin', { city: 'Pune' })).body.data.city).toBe('Pune');
  });
  test('delete', async () => { const t = await api('post', '/customers', 'admin', { name: 'Tmp' }); expect((await api('delete', '/customers/' + t.body.data._id, 'admin')).status).toBe(200); });
});
describe('Deals', () => {
  test('create + list', async () => { const r = await api('post', '/deals', 'admin', { name: 'Big Deal', customer: I.cust, value: 1000, probability: 50 }); expect(r.status).toBe(201); I.deal = r.body.data._id; expect((await api('get', '/deals', 'admin')).body.data.length).toBe(1); });
  test('stage update', async () => expect((await api('put', '/deals/' + I.deal, 'admin', { stage: 'Negotiation' })).body.data.stage).toBe('Negotiation'));
  test('closed won notifies managers', async () => { expect((await api('put', '/deals/' + I.deal, 'admin', { stage: 'Closed Won' })).status).toBe(200); const n = await api('get', '/notifications', 'manager'); expect(n.body.data.some(x => x.type === 'deal_won')).toBe(true); });
  test('delete', async () => { const t = await api('post', '/deals', 'admin', { name: 'Tmp', customer: I.cust }); expect((await api('delete', '/deals/' + t.body.data._id, 'admin')).status).toBe(200); });
});
describe('Activities', () => {
  test('create linked to lead/customer/deal and retrieve', async () => {
    const r = await api('post', '/activities', 'admin', { type: 'Call', title: 'Intro call', lead: I.lead, customer: I.cust, deal: I.deal }); expect(r.status).toBe(201);
    for (const k of ['lead', 'customer', 'deal']) expect((await api('get', `/activities?${k}=${I[k === 'customer' ? 'cust' : k]}`, 'admin')).body.data.some(a => a.title === 'Intro call')).toBe(true);
  });
});
describe('Notifications', () => {
  test('retrieve, mark read, mark all read', async () => {
    const l = await api('get', '/notifications', 'manager'); expect(l.body.unread).toBeGreaterThanOrEqual(1);
    expect((await api('put', `/notifications/${l.body.data[0]._id}/read`, 'manager')).body.data.isRead).toBe(true);
    await api('put', '/notifications/read-all', 'manager'); expect((await api('get', '/notifications', 'manager')).body.unread).toBe(0);
  });
});
describe('Dashboard & settings', () => {
  test('summary', async () => { const r = await api('get', '/dashboard/summary', 'admin'); expect(r.status).toBe(200); expect(r.body.data.kpis.totalLeads).toBeGreaterThanOrEqual(1); expect(r.body.data.kpis.wonDeals).toBe(1); });
  test('customer growth', async () => { const r = await api('get', '/dashboard/customer-growth', 'admin'); expect(r.status).toBe(200); expect(r.body.data[0].customers).toBeGreaterThanOrEqual(1); });
  test('profile + password change', async () => {
    expect((await api('put', '/auth/profile', 'sales', { phone: '123' })).body.data.phone).toBe('123');
    expect((await api('put', '/auth/password', 'sales', { currentPassword: 'wrong', newPassword: 'New@1234' })).status).toBe(400);
    expect((await api('put', '/auth/password', 'sales', { currentPassword: 'Sales@123', newPassword: 'New@1234' })).status).toBe(200);
    expect((await request(app).post('/api/auth/login').send({ email: 'sales@t.com', password: 'New@1234' })).status).toBe(200);
  });
  test('user management is admin only', async () => expect((await api('get', '/users', 'manager')).status).toBe(403));
});
