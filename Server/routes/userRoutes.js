const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, toggleUserStatus } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));
router.get('/', getUsers);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);

module.exports = router;