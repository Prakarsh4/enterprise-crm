const express = require('express');
const router = express.Router();
const {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
} = require('../controllers/dealcontroller');
const { authenticate, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(authenticate);

router.route('/')
  .get(getDeals)
  .post(createDeal);

router.route('/:id')
  .get(validateObjectId(), getDealById)
  .put(validateObjectId(), updateDeal)
  .delete(validateObjectId(), authorize('admin', 'manager'), deleteDeal);

module.exports = router;