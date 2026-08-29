const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogControllers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.route('/')
  .get(getAuditLogs);

module.exports = router;
