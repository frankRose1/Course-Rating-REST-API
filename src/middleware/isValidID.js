const mongoose = require('mongoose');

/**
 * Handles any invalid mongoose object ID to prevent castToObjectID error
 */
module.exports = function(req, res, next) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'The provided object ID is invalid.'
    });
  }
  next();
};
