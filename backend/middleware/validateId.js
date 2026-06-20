const mongoose = require('mongoose');

/**
 * Middleware to validate MongoDB ObjectId in request parameters
 */
module.exports = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: `Invalid ID format: ${req.params.id}. Must be 24 hex characters.` });
  }
  next();
};