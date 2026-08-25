/**
 * Global error handling middleware.
 * Must be the last middleware registered in Express.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: `A record with that ${err.meta?.target?.join(', ')} already exists.`,
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found.' });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
  }

  // Multer file type error
  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP allowed.' });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
};

module.exports = { errorHandler };
