import AppError from './appError.js';

export default function convertId(id) {
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || !Number.isInteger(parseFloat(id))) {
    throw new AppError(
      'O ID fornecido é inválido. Deve ser um número inteiro.',
      400,
    );
  }

  return parsedId;
}
