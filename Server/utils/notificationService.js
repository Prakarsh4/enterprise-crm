const Notification = require('../Models/Notification');

const createNotification = async ({ recipient, type, title, message, relatedEntity = null }) => {
  try {
    if (!recipient) return;
    await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedEntity
    });
  } catch (err) {
    console.error('[Notification Error]:', err.message);
  }
};

module.exports = createNotification;