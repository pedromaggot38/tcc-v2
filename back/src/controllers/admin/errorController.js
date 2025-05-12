import { ZodError } from 'zod';
import AppError from '../../utils/appError.js';

const handlePrismaDuplicateFieldError = (err) => {
  const field = err.meta?.target?.[0] || 'Campo';
  return new AppError(`${field} já está em uso.`, 400);
};
const handlePrismaValidationError = (err) => {
  // Extrair o nome do campo incorreto
  const invalidField = err.message.match(/Unknown argument `(\w+)`/);
  const fieldName = invalidField ? invalidField[1] : 'Campo';

  return new AppError(
    `Campo '${fieldName}' não encontrado ou digitado incorretamente.`,
    400,
  );
};
const handlePrismaNotFoundError = (err) => {
  return new AppError('Registro não encontrado.', 404);
};

const handleBusinessError = (err) => {
  return new AppError('Erro de negócio: dados inválidos ou conflito.', 400);
};

const handleForeignKeyConstraintError = (err) => {
  return new AppError(
    'Não é possível excluir o usuário, pois ele tem registros associados que impedem a exclusão.',
    400,
  );
};

const handleZodError = (err) => {
  const errors = err.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));

  const message = 'Erro de validação. Verifique os campos enviados.';
  return new AppError(message, 400, errors);
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
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors || [],
    });
  } else {
    console.error('ERROR', err);

    res.status(500).json({
      status: 'error',
      message: 'Oops! Alguma coisa deu muito errado!',
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
    if (error.code === 'P2003') {
      error = handleForeignKeyConstraintError(error);
    }

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err instanceof ZodError) error = handleZodError(err);

    if (error.name === 'PrismaClientValidationError') {
      error = handlePrismaValidationError(error);
    }

    if (
      error instanceof AppError &&
      error.message.includes('dados inválidos')
    ) {
      error = handleBusinessError(error);
    }

    sendErrorProd(error, res);
  }
};
