const L = (a) => a.map(v => [v, v]);
const user = { name: 'assignedTo', label: 'Assigned to', type: 'ref', url: '/users/options', label2: 'name', render: r => r.assignedTo?.name || '-' };
const money = (k) => (r) => '₹' + Number(r[k] || 0).toLocaleString('en-IN');
const date = (k) => (r) => (r[k] ? new Date(r[k]).toLocaleDateString() : '-');
export const leadsCfg = { title: 'Leads', url: '/leads', detail: '/leads', canDelete: ['ADMIN'], convert: true,
  filters: [{ key: 'status', opts: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] }, { key: 'priority', opts: ['Low', 'Medium', 'High', 'Urgent'] },
    { key: 'source', opts: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Advertisement', 'Email Campaign', 'Event', 'Other'] }],
  columns: [{ label: 'Name', render: r => `${r.firstName} ${r.lastName}`, sort: 'firstName' }, { label: 'Company', key: 'company', sort: 'company' }, { label: 'Status', key: 'status', badge: 1 },
    { label: 'Priority', key: 'priority', badge: 1 }, { label: 'Source', key: 'source' }, { label: 'Value', render: money('estimatedValue'), sort: 'estimatedValue' }, { label: 'Owner', render: user.render }],
  fields: [{ name: 'firstName', label: 'First name', req: 1 }, { name: 'lastName', label: 'Last name', req: 1 }, { name: 'company', label: 'Company' }, { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone' }, { name: 'jobTitle', label: 'Job title' }, { name: 'industry', label: 'Industry' },
    { name: 'source', label: 'Source', type: 'select', opts: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Advertisement', 'Email Campaign', 'Event', 'Other'] },
    { name: 'status', label: 'Status', type: 'select', opts: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] },
    { name: 'priority', label: 'Priority', type: 'select', opts: ['Low', 'Medium', 'High', 'Urgent'] }, user, { name: 'estimatedValue', label: 'Estimated value', type: 'number' },
    { name: 'expectedCloseDate', label: 'Expected close', type: 'date' }, { name: 'notes', label: 'Notes', type: 'textarea' }] };
export const customersCfg = { title: 'Customers', url: '/customers', detail: '/customers', canDelete: ['ADMIN', 'SALES_MANAGER'],
  filters: [{ key: 'status', opts: ['Active', 'Inactive', 'Churned'] }],
  columns: [{ label: 'Name', key: 'name', sort: 'name' }, { label: 'Company', key: 'company' }, { label: 'Email', key: 'email' }, { label: 'City', key: 'city' }, { label: 'Status', key: 'status', badge: 1 }, { label: 'Owner', render: user.render }],
  fields: [{ name: 'name', label: 'Name', req: 1 }, { name: 'company', label: 'Company' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'phone', label: 'Phone' }, { name: 'industry', label: 'Industry' },
    { name: 'address', label: 'Address' }, { name: 'city', label: 'City' }, { name: 'state', label: 'State' }, { name: 'country', label: 'Country' },
    { name: 'status', label: 'Status', type: 'select', opts: ['Active', 'Inactive', 'Churned'] }, user, { name: 'notes', label: 'Notes', type: 'textarea' }] };
export const dealsCfg = { title: 'Deals', url: '/deals', detail: '/deals', canDelete: ['ADMIN', 'SALES_MANAGER'],
  filters: [{ key: 'stage', opts: ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] }],
  columns: [{ label: 'Deal', key: 'name', sort: 'name' }, { label: 'Customer', render: r => r.customer?.name || '-' }, { label: 'Value', render: money('value'), sort: 'value' }, { label: 'Stage', key: 'stage', badge: 1 },
    { label: 'Prob.', render: r => r.probability + '%' }, { label: 'Weighted', render: r => '₹' + Math.round(r.value * r.probability / 100).toLocaleString('en-IN') }, { label: 'Owner', render: user.render }],
  fields: [{ name: 'name', label: 'Deal name', req: 1 }, { name: 'customer', label: 'Customer', type: 'ref', url: '/customers?limit=100', label2: 'name', req: 1 }, { name: 'company', label: 'Company' },
    { name: 'value', label: 'Value', type: 'number' }, { name: 'stage', label: 'Stage', type: 'select', opts: ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
    { name: 'probability', label: 'Probability %', type: 'number' }, { name: 'expectedCloseDate', label: 'Expected close', type: 'date' }, user, { name: 'source', label: 'Source' }, { name: 'description', label: 'Description', type: 'textarea' }] };
export const activitiesCfg = { title: 'Activities', url: '/activities', canDelete: ['ADMIN', 'SALES_MANAGER'],
  filters: [{ key: 'type', opts: ['Call', 'Email', 'Meeting', 'Follow-up', 'Note', 'Task'] }, { key: 'status', opts: ['Pending', 'Completed', 'Cancelled'] }],
  columns: [{ label: 'Type', key: 'type', badge: 1 }, { label: 'Title', key: 'title' }, { label: 'Lead', render: r => r.lead ? `${r.lead.firstName} ${r.lead.lastName}` : '-' }, { label: 'Deal', render: r => r.deal?.name || '-' },
    { label: 'Date', render: date('date'), sort: 'date' }, { label: 'Status', key: 'status', badge: 1 }, { label: 'By', render: r => r.createdBy?.name || '-' }],
  fields: [{ name: 'type', label: 'Type', type: 'select', opts: ['Call', 'Email', 'Meeting', 'Follow-up', 'Note', 'Task'] }, { name: 'title', label: 'Title', req: 1 },
    { name: 'lead', label: 'Related lead', type: 'ref', url: '/leads?limit=100', label2: 'firstName' }, { name: 'customer', label: 'Related customer', type: 'ref', url: '/customers?limit=100', label2: 'name' },
    { name: 'deal', label: 'Related deal', type: 'ref', url: '/deals?limit=100', label2: 'name' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'time', label: 'Time' },
    { name: 'status', label: 'Status', type: 'select', opts: ['Pending', 'Completed', 'Cancelled'] }, { name: 'description', label: 'Description', type: 'textarea' }] };
export const usersCfg = { title: 'Users', url: '/users', canDelete: ['ADMIN'], filters: [{ key: 'role', opts: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] }],
  columns: [{ label: 'Name', key: 'name', sort: 'name' }, { label: 'Email', key: 'email' }, { label: 'Role', key: 'role', badge: 1 }, { label: 'Department', key: 'department' }, { label: 'Active', render: r => (r.isActive ? 'Yes' : 'No') }],
  fields: [{ name: 'name', label: 'Name', req: 1 }, { name: 'email', label: 'Email', type: 'email', req: 1 }, { name: 'password', label: 'Password (leave blank to keep)', type: 'password' },
    { name: 'role', label: 'Role', type: 'select', opts: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] }, { name: 'phone', label: 'Phone' }, { name: 'department', label: 'Department' },
    { name: 'isActive', label: 'Status', type: 'select', opts: [['true', 'Active'], ['false', 'Inactive']], bool: 1 }] };
export const emailsCfg = { title: 'Email Logs', url: '/emails', canDelete: ['ADMIN', 'SALES_MANAGER'], filters: [{ key: 'status', opts: ['Sent', 'Scheduled', 'Failed'] }],
  columns: [{ label: 'Recipient', key: 'recipient' }, { label: 'Subject', key: 'subject' }, { label: 'Status', key: 'status', badge: 1 }, { label: 'Date', render: r => new Date(r.date).toLocaleDateString(), sort: 'date' },
    { label: 'Related', render: r => r.lead ? `${r.lead.firstName} ${r.lead.lastName}` : r.customer?.name || '-' }, { label: 'Sender', render: r => r.sender?.name || '-' }],
  fields: [{ name: 'recipient', label: 'Recipient', type: 'email', req: 1 }, { name: 'subject', label: 'Subject', req: 1 }, { name: 'lead', label: 'Related lead', type: 'ref', url: '/leads?limit=100', label2: 'firstName' },
    { name: 'customer', label: 'Related customer', type: 'ref', url: '/customers?limit=100', label2: 'name' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'time', label: 'Time' },
    { name: 'status', label: 'Status', type: 'select', opts: ['Sent', 'Scheduled', 'Failed'] }, { name: 'message', label: 'Message', type: 'textarea' }] };
