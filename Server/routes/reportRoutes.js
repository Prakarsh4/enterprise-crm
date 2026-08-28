const express = require('express');
const router = express.Router();
const { getReportSummary } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'manager'));
router.get('/summary', getReportSummary);

module.exports = router;