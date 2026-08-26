const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const ApiResponse = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(res, 'Authentication token missing or invalid', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_crm_phase1_change_in_prod');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return ApiResponse.error(res, 'User belonging to this token no longer exists', 401);
    }
    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Not authorized to access this resource', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Role (${req.user ? req.user.role : 'Guest'}) is not authorized to perform this operation`,
        403
      );
    }
    next();
  };
};

module.exports = { authenticate, authorize };