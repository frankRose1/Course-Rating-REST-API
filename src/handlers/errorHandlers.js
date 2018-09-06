
//container for error handlers
const errorHandlers = {};

errorHandlers.notFound = (req, res) => {
    res.status(404).json( {message: 'Route Not Found'} );
};

// global error handler
errorHandlers.globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
    message: err.message,
    error: {}
    });
};

module.exports = errorHandlers;