const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.error(res, `Invalid resource ID format: ${id}`, 400);
    }
    next();
  };
};

module.exports = validateObjectId;