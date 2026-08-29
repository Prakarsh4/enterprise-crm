const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../Models/user');
const Lead = require('../Models/lead');
const Customer = require('../Models/customer');
const Deal = require('../Models/deal');
const Activity = require('../Models/activity');
const AuditLog = require('../Models/AuditLog');
const Notification = require('../Models/Notification');

dotenv.config({ path: '../.env' });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enterprise-crm');
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collections
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Customer.deleteMany({});
    await Deal.deleteMany({});
    await Activity.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Cleared existing records.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@crm.enterprise',
      password: 'Password123!',
      role: 'admin'
    });

    const managerUser = await User.create({
      name: 'Marcus Vance (Manager)',
      email: 'manager@crm.enterprise',
      password: 'Password123!',
      role: 'manager'
    });

    const salesRep1 = await User.create({
      name: 'Elena Rostova (Sales Rep)',
      email: 'sales@crm.enterprise',
      password: 'Password123!',
      role: 'sales_rep'
    });

    const salesRep2 = await User.create({
      name: 'David Kim (Sales Rep)',
      email: 'david@crm.enterprise',
      password: 'Password123!',
      role: 'sales_rep'
    });

    console.log('[Seed] Created users with roles: admin, manager, sales_rep');

    // 2. Create Customers
    const customer1 = await Customer.create({
      name: 'Acme Corporation',
      email: 'contact@acmecorp.com',
      phone: '+1 (555) 234-5678',
      company: 'Acme Corp Industries',
      industry: 'Manufacturing',
      assignedTo: salesRep1._id,
      notes: 'Global supply chain manufacturing customer.'
    });

    const customer2 = await Customer.create({
      name: 'Apex Fintech Solutions',
      email: 'procurement@apexfintech.io',
      phone: '+1 (555) 876-5432',
      company: 'Apex Fintech Solutions Inc.',
      industry: 'Finance',
      assignedTo: salesRep2._id,
      notes: 'High-growth B2B fintech platform.'
    });

    const customer3 = await Customer.create({
      name: 'CloudScale Systems',
      email: 'ops@cloudscale.net',
      phone: '+1 (555) 345-6789',
      company: 'CloudScale Infrastructure',
      industry: 'Technology',
      assignedTo: salesRep1._id,
      notes: 'Cloud hosting & container orchestration specialists.'
    });

    console.log('[Seed] Created customers');

    // 3. Create Leads
    await Lead.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@initech.com',
        phone: '+1 (555) 111-2222',
        company: 'Initech Software',
        source: 'Website',
        status: 'new',
        assignedTo: salesRep1._id,
        notes: 'Inquired about enterprise SaaS pricing.'
      },
      {
        firstName: 'Rachel',
        lastName: 'Green',
        email: 'rachel@fashionhub.com',
        phone: '+1 (555) 333-4444',
        company: 'FashionHub Global',
        source: 'LinkedIn',
        status: 'qualified',
        assignedTo: salesRep2._id,
        notes: 'Needs CRM integration for 15 sales members.'
      },
      {
        firstName: 'Michael',
        lastName: 'Scott',
        email: 'mscott@dundermifflin.com',
        phone: '+1 (555) 555-0199',
        company: 'Dunder Mifflin Paper Co.',
        source: 'Cold Call',
        status: 'contacted',
        assignedTo: salesRep1._id,
        notes: 'Exploring modernized client record management.'
      },
      {
        firstName: 'Diana',
        lastName: 'Prince',
        email: 'diana@themyscira.org',
        phone: '+1 (555) 777-8888',
        company: 'Gateway Logistics',
        source: 'Referral',
        status: 'converted',
        assignedTo: managerUser._id,
        notes: 'Converted to active prospect pipeline.'
      }
    ]);

    console.log('[Seed] Created leads');

    // 4. Create Deals
    const deal1 = await Deal.create({
      title: 'Acme Enterprise License Rollout',
      customer: customer1._id,
      value: 75000,
      stage: 'proposal',
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assignedTo: salesRep1._id,
      notes: 'Proposal sent for 250 enterprise seats.'
    });

    const deal2 = await Deal.create({
      title: 'Apex Fintech Security Suite Integration',
      customer: customer2._id,
      value: 120000,
      stage: 'negotiation',
      probability: 80,
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      assignedTo: salesRep2._id,
      notes: 'Final contract terms under legal review.'
    });

    const deal3 = await Deal.create({
      title: 'CloudScale Annual Infrastructure Support',
      customer: customer3._id,
      value: 45000,
      stage: 'prospecting',
      probability: 25,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      assignedTo: salesRep1._id,
      notes: 'Initial scope qualification meeting.'
    });

    console.log('[Seed] Created deals');

    // 5. Create Activities
    await Activity.create([
      {
        type: 'call',
        title: 'Discovery call with John Doe',
        description: 'Discuss CRM requirements and team size.',
        assignedTo: salesRep1._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        completed: false
      },
      {
        type: 'meeting',
        title: 'Acme Proposal Presentation',
        description: 'Review SLA terms and customized data pipeline.',
        relatedDeal: deal1._id,
        relatedCustomer: customer1._id,
        assignedTo: salesRep1._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        completed: false
      },
      {
        type: 'email',
        title: 'Send Apex legal review NDA',
        description: 'Send updated NDA and compliance documentation.',
        relatedDeal: deal2._id,
        relatedCustomer: customer2._id,
        assignedTo: salesRep2._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completed: true
      },
      {
        type: 'task',
        title: 'Prepare quarterly sales pipeline audit',
        description: 'Compile conversion benchmarks for executive committee.',
        assignedTo: managerUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false
      }
    ]);

    console.log('[Seed] Created activities');
    await Notification.create([
      { recipient: salesRep1._id, type: 'LEAD_ASSIGNED', title: 'New lead assigned', message: 'John Doe was assigned to you.' },
      { recipient: salesRep2._id, type: 'DEAL_STAGE_CHANGED', title: 'Deal moved to negotiation', message: 'Apex Fintech Security Suite Integration needs attention.' },
      { recipient: managerUser._id, type: 'SYSTEM_ALERT', title: 'Pipeline review', message: 'Weekly pipeline review is ready.' }
    ]);
    await AuditLog.create([
      { actor: adminUser._id, action: 'USER_REGISTER', entityType: 'Auth', description: 'Seeded administrator account' },
      { actor: managerUser._id, action: 'LEAD_CONVERT', entityType: 'Lead', description: 'Converted seeded lead Diana Prince' },
      { actor: salesRep2._id, action: 'DEAL_STAGE_CHANGE', entityType: 'Deal', entityId: deal2._id, description: 'Moved Apex deal to negotiation' }
    ]);
    console.log('[Seed] Created notifications and audit logs');
    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
