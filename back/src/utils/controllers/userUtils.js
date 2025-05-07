import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import AppError from '../appError.js';
import db from '../../config/db.js';

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
  console.log(candidatePassword, storedPassword);
  return await bcrypt.compare(candidatePassword, storedPassword);
};

export const createPasswordResetToken = async (userId) => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await db.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    },
  });

  return { token: resetToken, hashedToken, expires };
};
