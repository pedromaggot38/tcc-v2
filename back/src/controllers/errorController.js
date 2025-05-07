import AppError from '../utils/appError.js';

const handlePrismaDuplicateFieldError = (err) => {
  const field = err.meta?.target?.[0] || 'Campo';
  return new AppError(`${field} já está em uso.`, 400);
};
const handlePrismaNotFoundError = (err) => {
  return new AppError('Registro não encontrado.', 404);
};

const handleJWTError = () =>
  new AppError('Token inválido. Tente novamente!', 401);
const handleJWTExpiredError = () =>
  new AppError('Token expirado. Entre novamente!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    console.error('ERROR', err);

    res.status(500).json({
      status: 'error',
      message: 'Oops! Something went very wrong!',
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == 'production') {
    let error = Object.create(err);

    if (error.code === 'P2002') {
      error = handlePrismaDuplicateFieldError(error);
    }
    if (error.code === 'P2025') {
      error = handlePrismaNotFoundError(error);
    }

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
