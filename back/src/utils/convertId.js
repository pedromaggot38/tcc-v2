import AppError from './appError.js';

export default function convertId(id) {
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    throw new AppError('O ID fornecido é inválido. Deve ser um número.', 400);
  }

  return parsedId;
}
