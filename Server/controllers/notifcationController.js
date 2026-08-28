const Notification = require('../Models/Notification');
const ApiResponse = require('../utils/apiResponse');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    return ApiResponse.success(res, { notifications, unreadCount }, 'Notifications retrieved', 200);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return ApiResponse.error(res, 'Notification not found', 404);
    }
    return ApiResponse.success(res, notification, 'Marked as read', 200);
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    return ApiResponse.success(res, null, 'All notifications marked as read', 200);
  } catch (error) {
    next(error);
  }
};