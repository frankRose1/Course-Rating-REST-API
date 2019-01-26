const errorHandlers = {};

errorHandlers.notFound = (req, res) => {
  res.status(404).json({ message: 'Route not found.' });
};

// global error handler
errorHandlers.globalErrorHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ message: err.message });
};

module.exports = errorHandlers;
