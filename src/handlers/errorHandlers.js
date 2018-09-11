//container for error handlers
const errorHandlers = {};

errorHandlers.notFound = (req, res) => {
    res.status(404).json( {message: 'Route Not Found'} );
};

// global error handler
errorHandlers.globalErrorHandler = (err, req, res, next) => {
    //comment out the err.stack when running tests with mocha or it will clutter the console
    console.error(err.stack); 
    res.status(err.status || 500).json({
    message: err.message,
    error: {}
    });
};

module.exports = errorHandlers;