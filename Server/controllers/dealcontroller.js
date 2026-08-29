const Deal = require('../Models/deal');
const ApiResponse = require('../utils/apiResponse');
const logAudit = require('../utils/auditLogger');
const createNotification = require('../utils/notificationService');

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
    await logAudit({ actorId: req.user._id, action: 'DEAL_CREATE', entityType: 'Deal', entityId: deal._id, description: `Created deal ${deal.title}` });

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

    const stageChanged = req.body.stage && deal.stage !== req.body.stage;
    deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('customer', 'name company email')
      .populate('assignedTo', 'name email role');

    await logAudit({ actorId: req.user._id, action: stageChanged ? 'DEAL_STAGE_CHANGE' : 'DEAL_UPDATE', entityType: 'Deal', entityId: deal._id, description: `${stageChanged ? `Changed ${deal.title} to ${deal.stage}` : `Updated deal ${deal.title}`}` });
    if (stageChanged && deal.assignedTo) await createNotification({ recipient: deal.assignedTo._id || deal.assignedTo, type: 'DEAL_STAGE_CHANGED', title: `Deal moved to ${deal.stage}`, message: `${deal.title} is now ${deal.stage.replace('_', ' ')}.`, relatedEntity: { entityType: 'Deal', entityId: deal._id } });
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
    await logAudit({ actorId: req.user._id, action: 'DEAL_DELETE', entityType: 'Deal', entityId: deal._id, description: `Deleted deal ${deal.title}` });
    return ApiResponse.success(res, null, 'Deal deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};
