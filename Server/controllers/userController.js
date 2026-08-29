const User = require('../Models/user');
const ApiResponse = require('../utils/apiResponse');
const logAudit = require('../utils/auditLogger');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, users, 'Users retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    if (!['admin', 'manager', 'sales_rep'].includes(role)) {
      return ApiResponse.error(res, 'Invalid role provided', 400);
    }

    if (req.user._id.toString() === targetUserId && role !== 'admin') {
      return ApiResponse.error(res, 'You cannot remove your own admin access', 400);
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return ApiResponse.error(res, 'User not found', 404);
    if (targetUser.role === 'admin' && role !== 'admin' && targetUser.isActive !== false && await User.countDocuments({ role: 'admin', isActive: { $ne: false } }) <= 1) return ApiResponse.error(res, 'Cannot demote the last active admin', 400);
    const updatedUser = await User.findByIdAndUpdate(targetUserId, { role }, { new: true }).select('-password');
    if (!updatedUser) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    await logAudit({
      actorId: req.user._id,
      action: 'USER_UPDATE_ROLE',
      entityType: 'User',
      entityId: updatedUser._id,
      description: `Changed role of ${updatedUser.email} to ${role}`
    });

    return ApiResponse.success(res, updatedUser, 'User role updated', 200);
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { isActive } = req.body;

    if (req.user._id.toString() === targetUserId && isActive === false) {
      return ApiResponse.error(res, 'You cannot deactivate your own account', 400);
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return ApiResponse.error(res, 'User not found', 404);
    if (targetUser.role === 'admin' && targetUser.isActive !== false && isActive === false && await User.countDocuments({ role: 'admin', isActive: { $ne: false } }) <= 1) return ApiResponse.error(res, 'Cannot deactivate the last active admin', 400);
    const updatedUser = await User.findByIdAndUpdate(targetUserId, { isActive: Boolean(isActive) }, { new: true }).select('-password');
    if (!updatedUser) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    await logAudit({
      actorId: req.user._id,
      action: 'USER_UPDATE_STATUS',
      entityType: 'User',
      entityId: updatedUser._id,
      description: `Set status of ${updatedUser.email} to ${isActive ? 'active' : 'inactive'}`
    });

    return ApiResponse.success(res, updatedUser, `User ${isActive ? 'activated' : 'deactivated'}`, 200);
  } catch (error) {
    next(error);
  }
};
