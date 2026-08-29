const Lead = require('../Models/lead');
const ApiResponse = require('../utils/apiResponse');
const logAudit = require('../utils/auditLogger');
const createNotification = require('../utils/notificationService');

exports.getLeads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by assignedTo
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    // Role-based visibility: sales_rep sees assigned leads unless specified otherwise
    if (req.user.role === 'sales_rep') {
      query.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
    }

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { company: searchRegex }
      ];
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const order = req.query.order === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: order };
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };

    return ApiResponse.success(res, leads, 'Leads retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email role');
    if (!lead) {
      return ApiResponse.error(res, 'Lead not found', 404);
    }
    return ApiResponse.success(res, lead, 'Lead details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

exports.createLead = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, company, source, status, assignedTo, notes } = req.body;

    const lead = await Lead.create({
      firstName,
      lastName,
      email,
      phone,
      company,
      source,
      status: status || 'new',
      assignedTo: assignedTo || req.user._id,
      notes
    });

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email role');
    await logAudit({ actorId: req.user._id, action: 'LEAD_CREATE', entityType: 'Lead', entityId: lead._id, description: `Created lead ${lead.firstName} ${lead.lastName}` });
    if (assignedTo && assignedTo !== req.user._id.toString()) await createNotification({ recipient: assignedTo, type: 'LEAD_ASSIGNED', title: 'New lead assigned', message: `${lead.firstName} ${lead.lastName} was assigned to you.`, relatedEntity: { entityType: 'Lead', entityId: lead._id } });
    return ApiResponse.success(res, populatedLead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) {
      return ApiResponse.error(res, 'Lead not found', 404);
    }

    const wasConverted = lead.status !== 'converted' && req.body.status === 'converted';
    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedTo', 'name email role');

    await logAudit({ actorId: req.user._id, action: wasConverted ? 'LEAD_CONVERT' : 'LEAD_UPDATE', entityType: 'Lead', entityId: lead._id, description: `${wasConverted ? 'Converted' : 'Updated'} lead ${lead.firstName} ${lead.lastName}` });
    if (wasConverted && lead.assignedTo) await createNotification({ recipient: lead.assignedTo._id || lead.assignedTo, type: 'LEAD_CONVERTED', title: 'Lead converted', message: `${lead.firstName} ${lead.lastName} was converted.`, relatedEntity: { entityType: 'Lead', entityId: lead._id } });
    return ApiResponse.success(res, lead, 'Lead updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return ApiResponse.error(res, 'Lead not found', 404);
    }

    await Lead.findByIdAndDelete(req.params.id);
    await logAudit({ actorId: req.user._id, action: 'LEAD_DELETE', entityType: 'Lead', entityId: lead._id, description: `Deleted lead ${lead.firstName} ${lead.lastName}` });
    return ApiResponse.success(res, null, 'Lead deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};
