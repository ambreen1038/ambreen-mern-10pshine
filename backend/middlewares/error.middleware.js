module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    req.log.warn('Late error detected');
    return next(err);
  }
module.exports = (err, req, res, next) => {
  if (err.message.includes('argument handler must be a function')) {
    logger.error('Router configuration error - check for conflicting packages');
    return res.status(500).json({
      code: 'ROUTER_ERROR',
      message: 'Server configuration error'
    });
  }
}
  // 1. Classify error types
  const statusCode = err.statusCode || 
                   (err.name === 'ValidationError' ? 400 : 
                   err.name === 'UnauthorizedError' ? 401 : 500);

  // 2. Secure error response
  const response = {
    code: err.code || 'SERVER_ERROR',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    })
  };

  // 3. Special cases
  if (err.name === 'ValidationError') {
    response.code = 'VALIDATION_ERROR';
    response.errors = Object.fromEntries(
      Object.entries(err.errors).map(([key, val]) => [key, val.message])
    );
  }

  // 4. Security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'"
  });

  // 5. Logging
  req.log[statusCode >= 500 ? 'error' : 'warn']({
    error: {
      name: err.name,
      code: err.code,
      statusCode
    },
    requestId: req.id,
    path: req.path
  });

  res.status(statusCode).json(response);
};