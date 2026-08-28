const Deal = require('../models/Deal');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const ApiResponse = require('../utils/apiResponse');

exports.getReportSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};

    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Lead metrics
    const totalLeads = await Lead.countDocuments(dateQuery);
    const convertedLeads = await Lead.countDocuments({ ...dateQuery, status: 'converted' });
    const leadsBySource = await Lead.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Deal metrics
    const deals = await Deal.find(dateQuery).populate('assignedTo', 'name').lean();
    const totalDeals = deals.length;
    const wonDeals = deals.filter((d) => d.stage === 'closed_won');
    const lostDeals = deals.filter((d) => d.stage === 'closed_lost');
    const wonRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const pipelineValue = deals.filter((d) => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((sum, d) => sum + (d.value || 0), 0);

    const winRate = totalDeals > 0 ? ((wonDeals.length / totalDeals) * 100).toFixed(1) : 0;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Rep Performance
    const repPerformance = await Deal.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: '$assignedTo',
          totalDeals: { $sum: 1 },
          totalValue: { $sum: '$value' },
          wonValue: {
            $sum: { $cond: [{ $eq: ['$stage', 'closed_won'] }, '$value', 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
    ]);

    return ApiResponse.success(
      res,
      {
        totalLeads,
        convertedLeads,
        conversionRate,
        leadsBySource,
        totalDeals,
        wonDealsCount: wonDeals.length,
        lostDealsCount: lostDeals.length,
        wonRevenue,
        pipelineValue,
        winRate,
        repPerformance
      },
      'Report summary generated',
      200
    );
  } catch (error) {
    next(error);
  }
};