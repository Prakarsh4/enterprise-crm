const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
} = require('../controllers/leadcontroller');
const { authenticate, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(authenticate);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(validateObjectId(), getLeadById)
  .put(validateObjectId(), updateLead)
  .delete(validateObjectId(), authorize('admin', 'manager'), deleteLead);

module.exports = router;