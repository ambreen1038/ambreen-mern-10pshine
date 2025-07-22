// middlewares/error.middleware.js
module.exports = (err, req, res, next) => {
  req.log.error({ err }, 'Unhandled error');
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};
