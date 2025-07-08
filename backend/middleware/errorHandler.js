const isProduction = process.env.NODE_ENV === 'production';

function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = isProduction && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
  });
}

module.exports = errorHandler;
