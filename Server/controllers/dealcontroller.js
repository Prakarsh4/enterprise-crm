const Deal = require('../Models/deal');
const ApiResponse = require('../utils/apiResponse');

exports.getDeals = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.stage) {
      query.stage = req.query.stage;
    }

    if (req.user.role === 'sales_rep') {
      query.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.title = searchRegex;
    }

    const deals = await Deal.find(query)
      .populate('customer', 'name company email')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, deals, 'Deals retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.getDealById = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('customer', 'name company email')
      .populate('assignedTo', 'name email role');

    if (!deal) {
      return ApiResponse.error(res, 'Deal not found', 404);
    }
    return ApiResponse.success(res, deal, 'Deal retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.createDeal = async (req, res, next) => {
  try {
    const { title, customer, value, stage, probability, expectedCloseDate, assignedTo, notes } = req.body;

    const deal = await Deal.create({
      title,
      customer,
      value: Number(value),
      stage: stage || 'prospecting',
      probability: probability !== undefined ? Number(probability) : 20,
      expectedCloseDate: expectedCloseDate || null,
      assignedTo: assignedTo || req.user._id,
      notes
    });

    const populated = await Deal.findById(deal._id)
      .populate('customer', 'name company email')
      .populate('assignedTo', 'name email role');

    return ApiResponse.success(res, populated, 'Deal created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateDeal = async (req, res, next) => {
  try {
    let deal = await Deal.findById(req.params.id);
    if (!deal) {
      return ApiResponse.error(res, 'Deal not found', 404);
    }

    deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('customer', 'name company email')
      .populate('assignedTo', 'name email role');

    return ApiResponse.success(res, deal, 'Deal updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return ApiResponse.error(res, 'Deal not found', 404);
    }

    await Deal.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, null, 'Deal deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};