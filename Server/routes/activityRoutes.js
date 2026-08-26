const express = require('express');
const router = express.Router();
const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/activitycontroller');
const { authenticate } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.use(authenticate);

router.route('/')
  .get(getActivities)
  .post(createActivity);

router.route('/:id')
  .put(validateObjectId(), updateActivity)
  .delete(validateObjectId(), deleteActivity);

module.exports = router;