import bcrypt from 'bcryptjs';
import AppError from '../appError.js';

export const hashPassword = async (password) => {
  if (!password) {
    throw new AppError('Please provide a password', 400);
  }
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (candidatePassword, storedPassword) => {
  return await bcrypt.compare(candidatePassword, storedPassword);
};

/**
 * Verifica se o usuário mudou a senha após o token ser emitido.
 * @param {Date|null} passwordChangedAt - Data da última alteração de senha
 * @param {number} JWTTimestamp - Timestamp do JWT (em segundos)
 * @returns {boolean}
 */
export const hasPasswordChangedAfter = function (
  passwordChangedAt,
  JWTTimestamp,
) {
  if (!passwordChangedAt) return false;
  const changedTimestamp = Math.floor(passwordChangedAt.getTime() / 1000, 10);
  return JWTTimestamp < changedTimestamp;
};
