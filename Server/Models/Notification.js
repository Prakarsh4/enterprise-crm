const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['LEAD_ASSIGNED', 'DEAL_ASSIGNED', 'DEAL_STAGE_CHANGED', 'ACTIVITY_DUE', 'LEAD_CONVERTED', 'SYSTEM_ALERT'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Lead', 'Customer', 'Deal', 'Activity', 'User']
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId
      }
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);