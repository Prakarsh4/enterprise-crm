const Customer = require('../Models/customer');
const ApiResponse = require('../utils/apiResponse');
const logAudit = require('../utils/auditLogger');

exports.getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.industry) {
      query.industry = req.query.industry;
    }

    if (req.user.role === 'sales_rep') {
      query.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { company: searchRegex }];
    }

    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const order = req.query.order === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: order };
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
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

    return ApiResponse.success(res, customers, 'Customers retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('assignedTo', 'name email role');
    if (!customer) {
      return ApiResponse.error(res, 'Customer not found', 404);
    }
    return ApiResponse.success(res, customer, 'Customer details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, industry, assignedTo, notes } = req.body;

    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      industry: industry || 'Other',
      assignedTo: assignedTo || req.user._id,
      notes
    });

    const populated = await Customer.findById(customer._id).populate('assignedTo', 'name email role');
    await logAudit({ actorId: req.user._id, action: 'CUSTOMER_CREATE', entityType: 'Customer', entityId: customer._id, description: `Created customer ${customer.name}` });
    return ApiResponse.success(res, populated, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return ApiResponse.error(res, 'Customer not found', 404);
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedTo', 'name email role');
    await logAudit({ actorId: req.user._id, action: 'CUSTOMER_UPDATE', entityType: 'Customer', entityId: customer._id, description: `Updated customer ${customer.name}` });

    return ApiResponse.success(res, customer, 'Customer updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return ApiResponse.error(res, 'Customer not found', 404);
    }

    await Customer.findByIdAndDelete(req.params.id);
    await logAudit({ actorId: req.user._id, action: 'CUSTOMER_DELETE', entityType: 'Customer', entityId: customer._id, description: `Deleted customer ${customer.name}` });
    return ApiResponse.success(res, null, 'Customer deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};
