import { ZodError } from 'zod';
import AppError from '../../utils/appError.js';

const modelNameTranslator = {
  User: 'Usuário',
  Article: 'Notícia',
  Doctor: 'Médico',
  Schedule: 'Agendamento',
};

const handlePrismaDuplicateFieldError = (err) => {
  const field = err.meta?.target?.[0] || 'campo';
  const message = `O valor informado para '${field}' já está em uso. Por favor, tente outro.`;
  return new AppError(message, 400);
};

const handlePrismaEnumError = (err) => {
  const match = err.message.match(
    /Invalid `prisma\.(\w+)\.findMany\(\)` invocation:\s*{[^]*?(\w+): \{\s*equals: ".*?"\s*\}/s,
  );
  const field = match?.[2] || 'campo';
  const expectedTypeMatch = err.message.match(/Expected (\w+)\./);
  const expectedType = expectedTypeMatch?.[1] || 'valor válido';

  const fieldNames = {
    UserRole: 'root, admin, journalist',
    ArticleStatus: 'published, draft, archived',
  };
  const readableValues = fieldNames[expectedType] || expectedType;

  const message = `O valor fornecido para '${field}' não é válido. Os valores permitidos são: ${readableValues}.`;
  return new AppError(message, 400);
};

const handlePrismaValidationError = (err) => {
  const invalidField = err.message.match(/Unknown argument `(\w+)`/);
  const fieldName = invalidField ? invalidField[1] : 'desconhecido';
  const message = `O campo '${fieldName}' não é permitido ou não existe neste recurso. Verifique os dados enviados.`;
  return new AppError(message, 400);
};

const handlePrismaNotFoundError = (err) => {
  console.log('DEBUG - Prisma Meta:', err.meta);
  const model = modelNameTranslator[err.meta?.modelName] || 'Registro';
  const message = `${model} não encontrado(a).`;
  return new AppError(message, 404);
};

const handleForeignKeyConstraintError = (err) => {
  const model = modelNameTranslator[err.meta?.modelName] || 'registro';
  const message = `Este(a) ${model} não pode ser excluído(a), pois há outros dados no sistema que dependem dele(a).`;
  return new AppError(message, 400);
};

const handleZodError = (err) => {
  const errors = err.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  const message =
    'Um ou mais campos contêm erros. Por favor, verifique os dados enviados.';
  return new AppError(message, 400, errors);
};

const handleJWTError = () =>
  new AppError(
    'Seu token de acesso é inválido. Por favor, faça login novamente.',
    401,
  );
const handleJWTExpiredError = () =>
  new AppError('Sua sessão expirou. Por favor, faça login novamente.', 401);

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
    console.warn('Operational Error:', {
      name: err.name,
      message: err.message,
      errors: err.errors,
    });
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors || [],
    });
  } else {
    console.error('CRITICAL ERROR 💥:', err);
    res.status(500).json({
      status: 'error',
      message: 'Oops! Algo deu muito errado no servidor.',
    });
  }
};

const productionErrorHandlers = {
  P2002: handlePrismaDuplicateFieldError,
  P2025: handlePrismaNotFoundError,
  P2003: handleForeignKeyConstraintError,
  JsonWebTokenError: handleJWTError,
  TokenExpiredError: handleJWTExpiredError,
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  let error = { ...err, message: err.message };

  const handler =
    productionErrorHandlers[error.code] || productionErrorHandlers[error.name];
  if (handler) {
    error = handler(error);
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (error.name === 'PrismaClientValidationError') {
    if (error.message.includes('Expected')) {
      error = handlePrismaEnumError(error);
    } else {
      error = handlePrismaValidationError(error);
    }
  }

  sendErrorProd(error, res);
};
