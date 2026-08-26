const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers } = require('../controllers/authcontroller');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, getAllUsers);

module.exports = router;