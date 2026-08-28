const AuditLog = require('../Models/AuditLog');
const ApiResponse = require('../utils/apiResponse');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.action) query.action = req.query.action;
    if (req.query.entityType) query.entityType = req.query.entityType;
    if (req.query.actor) query.actor = req.query.actor;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return ApiResponse.success(res, logs, 'Audit logs retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};