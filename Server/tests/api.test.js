const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
const request = require('supertest');

const { app } = require('../server');
const User = require('../Models/user');
const Lead = require('../Models/lead');
const Customer = require('../Models/customer');
const Deal = require('../Models/deal');
const AuditLog = require('../Models/AuditLog');
const Notification = require('../Models/Notification');

const TEST_DATABASE_URI = 'mongodb://127.0.0.1:27017/enterprise-crm-test';

const createUserAndToken = async (role, email) => {
  await User.create({ name: role, email, password: 'password123', role });
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });

  assert.equal(response.status, 200);
  return response.body.data.token;
};

test.before(async () => {
  await mongoose.connect(TEST_DATABASE_URI);
});

test.after(async () => {
  await mongoose.disconnect();
});

test.beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Customer.deleteMany({}),
    Deal.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({})
  ]);
});

test('authentication login returns a usable token', async () => {
  const token = await createUserAndToken('admin', 'admin@example.com');
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.email, 'admin@example.com');
});

test('protected routes reject missing authentication', async () => {
  const response = await request(app).get('/api/leads');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('RBAC prevents sales reps from deleting leads', async () => {
  const salesToken = await createUserAndToken('sales_rep', 'rep@example.com');
  const lead = await Lead.create({ firstName: 'Rita', lastName: 'Rep', email: 'rita@example.com' });

  const response = await request(app)
    .delete(`/api/leads/${lead.id}`)
    .set('Authorization', `Bearer ${salesToken}`);

  assert.equal(response.status, 403);
});

test('authenticated users can create and convert leads', async () => {
  const token = await createUserAndToken('manager', 'manager@example.com');
  const created = await request(app)
    .post('/api/leads')
    .set('Authorization', `Bearer ${token}`)
    .send({ firstName: 'Leah', lastName: 'Lead', email: 'leah@example.com', source: 'Website' });

  assert.equal(created.status, 201);
  assert.equal(created.body.data.status, 'new');

  const converted = await request(app)
    .put(`/api/leads/${created.body.data._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'converted' });

  assert.equal(converted.status, 200);
  assert.equal(converted.body.data.status, 'converted');
});

test('authenticated users can update a deal stage', async () => {
  const token = await createUserAndToken('manager', 'deals@example.com');
  const owner = await User.findOne({ email: 'deals@example.com' });
  const customer = await Customer.create({ name: 'Acme', email: 'contact@acme.example', assignedTo: owner._id });
  const created = await request(app)
    .post('/api/deals')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Acme renewal', customer: customer.id, value: 15000 });

  assert.equal(created.status, 201);

  const updated = await request(app)
    .put(`/api/deals/${created.body.data._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ stage: 'closed_won' });

  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.stage, 'closed_won');
});

test('managers can read report analytics', async () => {
  const token = await createUserAndToken('manager', 'reports@example.com');
  const response = await request(app)
    .get('/api/reports/summary')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.totalLeads, 0);
  assert.equal(response.body.data.totalDeals, 0);
});

test('audit logs are restricted to administrators and available to them', async () => {
  const adminToken = await createUserAndToken('admin', 'audit-admin@example.com');
  const salesToken = await createUserAndToken('sales_rep', 'audit-rep@example.com');
  const admin = await User.findOne({ email: 'audit-admin@example.com' });
  await AuditLog.create({ actor: admin._id, action: 'USER_LOGIN', entityType: 'Auth', description: 'Administrator logged in' });

  const forbidden = await request(app)
    .get('/api/audit-logs')
    .set('Authorization', `Bearer ${salesToken}`);
  assert.equal(forbidden.status, 403);

  const allowed = await request(app)
    .get('/api/audit-logs')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(allowed.status, 200);
  assert.ok(allowed.body.data.length >= 1);
  assert.ok(allowed.body.data.some((log) => log.description === 'Administrator logged in'));
});

test('users can retrieve their notifications', async () => {
  const token = await createUserAndToken('sales_rep', 'notifications@example.com');
  const user = await User.findOne({ email: 'notifications@example.com' });
  await Notification.create({
    recipient: user._id,
    type: 'SYSTEM_ALERT',
    title: 'Welcome',
    message: 'Your account is ready.'
  });

  const response = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.unreadCount, 1);
  assert.equal(response.body.data.notifications.length, 1);
});
