require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'), Lead = require('./models/Lead'), Customer = require('./models/Customer'), Deal = require('./models/Deal'), Activity = require('./models/Activity');
const pick = (a, i) => a[i % a.length];
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User, Lead, Customer, Deal, Activity].map(M => M.deleteMany()));
  const users = await User.create([
    { name: 'Admin User', email: 'admin@nexacrm.com', password: 'Admin@123', role: 'ADMIN' },
    { name: 'Meera Manager', email: 'manager@nexacrm.com', password: 'Manager@123', role: 'SALES_MANAGER' },
    { name: 'Sam Sales', email: 'sales@nexacrm.com', password: 'Sales@123', role: 'SALES_EXECUTIVE' },
    { name: 'Riya Sharma', email: 'riya@nexacrm.com', password: 'Sales@123', role: 'SALES_EXECUTIVE' },
    { name: 'Arjun Patel', email: 'arjun@nexacrm.com', password: 'Sales@123', role: 'SALES_EXECUTIVE' }]);
  const reps = users.slice(2);
  const st = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const src = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Advertisement', 'Email Campaign', 'Event', 'Other'];
  const pr = ['Low', 'Medium', 'High', 'Urgent'], ind = ['IT', 'Finance', 'Retail', 'Healthcare', 'Education'];
  const leads = await Lead.create(Array.from({ length: 24 }, (_, i) => ({ firstName: `Lead${i + 1}`, lastName: pick(['Mehta', 'Khan', 'Rao', 'Iyer', 'Das'], i),
    company: `${pick(['Zen', 'Apex', 'Blue', 'Nova', 'Orbit'], i)} Corp ${i + 1}`, email: `lead${i + 1}@example.com`, phone: `98000000${10 + i}`,
    source: pick(src, i), industry: pick(ind, i), status: pick(st, i), priority: pick(pr, i * 3), estimatedValue: 15000 * (i + 1), assignedTo: pick(reps, i)._id })));
  const custs = await Customer.create(Array.from({ length: 12 }, (_, i) => ({ name: `Customer ${i + 1}`, company: `${pick(['Alpha', 'Beta', 'Gamma', 'Delta'], i)} Ltd ${i + 1}`,
    email: `cust${i + 1}@example.com`, phone: `97000000${10 + i}`, industry: pick(ind, i), city: pick(['Pune', 'Mumbai', 'Delhi', 'Bengaluru'], i), country: 'India',
    createdAt: new Date(Date.now() - (i % 6) * 30 * 864e5), status: pick(['Active', 'Active', 'Inactive', 'Churned'], i), assignedTo: pick(reps, i)._id })));
  const stages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'], prob = [10, 30, 50, 70, 100, 0];
  const deals = await Deal.create(Array.from({ length: 18 }, (_, i) => ({ name: `Deal ${i + 1}`, customer: pick(custs, i)._id, company: pick(custs, i).company,
    value: 25000 * (i % 7 + 1), stage: pick(stages, i), probability: prob[i % 6], source: pick(src, i), assignedTo: pick(reps, i)._id })));
  await Activity.create(Array.from({ length: 24 }, (_, i) => ({ type: pick(['Call', 'Email', 'Meeting', 'Follow-up', 'Note', 'Task'], i), title: `Activity ${i + 1}`,
    description: 'Discussed requirements and next steps.', lead: pick(leads, i)._id, customer: pick(custs, i)._id, deal: pick(deals, i)._id,
    createdBy: pick(reps, i)._id, status: pick(['Pending', 'Completed', 'Cancelled'], i) })));
  console.log('Seeded: 5 users, 24 leads, 12 customers, 18 deals, 24 activities'); process.exit(0);
})();
