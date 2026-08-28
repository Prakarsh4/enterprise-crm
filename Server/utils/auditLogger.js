const AuditLog = require('../Models/AuditLog');

const logAudit = async ({ actorId, action, entityType, entityId = null, description, metadata = {} }) => {
  try {
    if (!actorId) return;
    await AuditLog.create({
      actor: actorId,
      action,
      entityType,
      entityId,
      description,
      metadata
    });
  } catch (err) {
    console.error('[AuditLog Error]:', err.message);
  }
};

module.exports = logAudit;