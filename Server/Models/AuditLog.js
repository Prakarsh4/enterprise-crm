const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_LOGIN',
        'USER_REGISTER',
        'USER_UPDATE_ROLE',
        'USER_UPDATE_STATUS',
        'LEAD_CREATE',
        'LEAD_UPDATE',
        'LEAD_DELETE',
        'LEAD_CONVERT',
        'CUSTOMER_CREATE',
        'CUSTOMER_UPDATE',
        'CUSTOMER_DELETE',
        'DEAL_CREATE',
        'DEAL_UPDATE',
        'DEAL_STAGE_CHANGE',
        'DEAL_DELETE',
        'ACTIVITY_CREATE',
        'ACTIVITY_UPDATE',
        'ACTIVITY_DELETE'
      ]
    },
    entityType: {
      type: String,
      required: true,
      enum: ['User', 'Lead', 'Customer', 'Deal', 'Activity', 'Auth']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    description: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);