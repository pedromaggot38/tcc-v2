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

/**
 * Verifica a unicidade de um ou mais campos no modelo User.
 * @param {object} fields - Um objeto com os campos a verificar. Ex: { email: 'a@a.com', username: 'user' }
 * @param {string} [currentUserId] - (Opcional) O ID do utilizador a ser ignorado na pesquisa (para atualizações).
 * @returns {Promise<void>} - Lança um AppError se um dos campos já estiver em uso.
 */
export const checkUniqueness = async (fields, currentUserId = null) => {
  const whereClauses = Object.keys(fields).map((key) => ({
    [key]: fields[key],
  }));

  if (whereClauses.length === 0) {
    return;
  }

  const existingUser = await db.user.findFirst({
    where: {
      OR: whereClauses,
    },
  });

  if (existingUser && existingUser.id !== currentUserId) {
    if (fields.username && existingUser.username === fields.username) {
      throw new AppError('Este nome de usuário já está em uso.', 400);
    }
    if (fields.email && existingUser.email === fields.email) {
      throw new AppError('Este e-mail já está em uso.', 400);
    }
  }
};

/**
 * Valida a regra de negócio que impede a remoção de um e-mail.
 * @param {object} body - O req.body da requisição.
 * @param {string|null} email - O valor do e-mail do req.body.
 * @returns {void} - Lança um AppError se a remoção for tentada.
 */
export const validateEmailRemoval = (body, email) => {
  if (body.hasOwnProperty('email') && email === null) {
    throw new AppError(
      'O campo de e-mail é obrigatório e não pode ser removido.',
      400,
    );
  }
};
