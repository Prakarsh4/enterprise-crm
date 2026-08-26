const Lead = require('../Models/lead');
const Customer = require('../Models/customer');
const Deal = require('../Models/deal');
const Activity = require('../Models/activity');
const ApiResponse = require('../utils/apiResponse');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const scopeQuery = {};
    if (req.user.role === 'sales_rep') {
      scopeQuery.assignedTo = req.user._id;
    }

    // 1. KPI Aggregations
    const totalLeads = await Lead.countDocuments(scopeQuery);
    const qualifiedLeads = await Lead.countDocuments({ ...scopeQuery, status: 'qualified' });
    const totalCustomers = await Customer.countDocuments(scopeQuery);
    const openDeals = await Deal.countDocuments({
      ...scopeQuery,
      stage: { $nin: ['closed_won', 'closed_lost'] }
    });

    const pipelineValueAgg = await Deal.aggregate([
      {
        $match: {
          ...(req.user.role === 'sales_rep' ? { assignedTo: req.user._id } : {}),
          stage: { $nin: ['closed_lost'] }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    const totalPipelineValue = pipelineValueAgg.length > 0 ? pipelineValueAgg[0].totalValue : 0;

    // 2. Stage Breakdown
    const stageSummaryAgg = await Deal.aggregate([
      {
        $match: req.user.role === 'sales_rep' ? { assignedTo: req.user._id } : {}
      },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    // 3. Recent Leads
    const recentLeads = await Lead.find(scopeQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name email');

    // 4. Recent Activities
    const recentActivities = await Activity.find(scopeQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name');

    return ApiResponse.success(
      res,
      {
        kpis: {
          totalLeads,
          qualifiedLeads,
          totalCustomers,
          openDeals,
          totalPipelineValue
        },
        stageSummary: stageSummaryAgg,
        recentLeads,
        recentActivities
      },
      'Dashboard metrics loaded successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};