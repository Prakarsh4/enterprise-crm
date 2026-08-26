const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customercontroller');
const { authenticate, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(authenticate);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(validateObjectId(), getCustomerById)
  .put(validateObjectId(), updateCustomer)
  .delete(validateObjectId(), authorize('admin', 'manager'), deleteCustomer);

module.exports = router;