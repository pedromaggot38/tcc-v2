import bcrypt from 'bcryptjs';
import AppError from '../appError.js';

/**
 * Verifica se o usuário mudou a senha após o token ser emitido.
 * @param {Date|null} passwordChangedAt - Data da última alteração de senha
 * @param {number} JWTTimestamp - Timestamp do JWT (em segundos)
 * @returns {boolean}
 */
export const hasPasswordChangedAfter = (passwordChangedAt, JWTTimestamp) => {
  if (!passwordChangedAt) return false;
  const changedTimestamp = Math.floor(passwordChangedAt.getTime() / 1000, 10);
  return JWTTimestamp < changedTimestamp;
};

export const hashPassword = async (password) => {
  if (!password) {
    throw new AppError('Insira uma senha', 400);
  }
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (candidatePassword, storedPassword) => {
  return await bcrypt.compare(candidatePassword, storedPassword);
};

/**
 * Valida a regra de negócio que impede a remoção de um e-mail.
 * @param {object} body - O req.body da requisição.
 * @param {string|null} email - O valor do e-mail do req.body.
 * @returns {void} - Lança um AppError se a remoção for tentada.
 */
export const validateEmailRemoval = (body) => {
  if (Object.hasOwn(body, 'email') && body.email === null) {
    throw new AppError(
      'O campo de e-mail é obrigatório e não pode ser nulo.',
      400,
    );
  }
};
