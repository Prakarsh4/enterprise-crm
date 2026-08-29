const User = require('../Models/user');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const logAudit = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_crm_phase1_change_in_prod', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return ApiResponse.error(res, 'Name, email, and password are required', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, 'An account with this email already exists', 400);
    }

    // Role default safe handling
    const safeRole = role && ['admin', 'manager', 'sales_rep'].includes(role) ? role : 'sales_rep';

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole
    });
    await logAudit({ actorId: user._id, action: 'USER_REGISTER', entityType: 'Auth', description: `Registered ${user.email}` });

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    return ApiResponse.success(res, { user: userResponse, token }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }
    if (user.isActive === false) {
      return ApiResponse.error(res, 'This account has been deactivated', 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);
    await logAudit({ actorId: user._id, action: 'USER_LOGIN', entityType: 'Auth', description: `Logged in as ${user.email}` });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    return ApiResponse.success(res, { user: userResponse, token }, 'Logged in successfully', 200);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return ApiResponse.success(res, user, 'Current user profile loaded', 200);
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('_id name email role avatar');
    return ApiResponse.success(res, users, 'Users retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};
