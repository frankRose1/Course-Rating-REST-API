const errorHandlers = {};

errorHandlers.notFound = (req, res) => {
  res.status(404).json({ message: 'Route Not Found' });
};

// global error handler
errorHandlers.globalErrorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
};

module.exports = errorHandlers;
