const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // 1. Structured error format
    const errorMap = errors.array().reduce((acc, { path, msg }) => {
      acc[path] = acc[path] || [];
      acc[path].push(msg);
      return acc;
    }, {});

    // 2. Security logging (no sensitive values)
    req.log.warn({
      validationErrors: Object.keys(errorMap),
      path: req.path
    }, 'Request validation failed');

    return res.status(422).json({
      code: 'VALIDATION_FAILED',
      message: 'Invalid request data',
      errors: errorMap
    });
  }

  next();
};