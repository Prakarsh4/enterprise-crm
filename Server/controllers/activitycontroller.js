const Activity = require('../Models/activity');
const ApiResponse = require('../utils/apiResponse');

exports.getActivities = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'sales_rep') {
      query.assignedTo = req.user._id;
    }

    if (req.query.completed !== undefined) {
      query.completed = req.query.completed === 'true';
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const activities = await Activity.find(query)
      .populate('assignedTo', 'name email')
      .populate('relatedLead', 'firstName lastName email')
      .populate('relatedCustomer', 'name company email')
      .populate('relatedDeal', 'title value')
      .sort({ dueDate: 1, createdAt: -1 });

    return ApiResponse.success(res, activities, 'Activities retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.createActivity = async (req, res, next) => {
  try {
    const { type, title, description, relatedLead, relatedCustomer, relatedDeal, assignedTo, dueDate } = req.body;

    const activity = await Activity.create({
      type,
      title,
      description,
      relatedLead: relatedLead || null,
      relatedCustomer: relatedCustomer || null,
      relatedDeal: relatedDeal || null,
      assignedTo: assignedTo || req.user._id,
      dueDate: dueDate || null,
      completed: false
    });

    const populated = await Activity.findById(activity._id)
      .populate('assignedTo', 'name email')
      .populate('relatedLead', 'firstName lastName email')
      .populate('relatedCustomer', 'name company email')
      .populate('relatedDeal', 'title value');

    return ApiResponse.success(res, populated, 'Activity created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateActivity = async (req, res, next) => {
  try {
    let activity = await Activity.findById(req.params.id);
    if (!activity) {
      return ApiResponse.error(res, 'Activity not found', 404);
    }

    activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email')
      .populate('relatedLead', 'firstName lastName email')
      .populate('relatedCustomer', 'name company email')
      .populate('relatedDeal', 'title value');

    return ApiResponse.success(res, activity, 'Activity updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return ApiResponse.error(res, 'Activity not found', 404);
    }

    await Activity.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, null, 'Activity deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};