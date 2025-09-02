import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../config/db.js';
import AppError from '../utils/appError.js';
import { sendPasswordResetEmail } from './emailService.js';
import { createPasswordResetToken } from './passwordResetTokenService.js';

export const loginUser = async (username, password) => {
  if (!username || !password) {
    throw new AppError('Por favor, informe nome de usuário e senha', 401);
  }

  const user = await db.user.findUnique({
    where: { username, active: true },
    select: {
      id: true,
      username: true,
      password: true,
      name: true,
      email: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Credenciais inválidas', 403);
  }

  return user;
};

export const handleForgotPassword = async (username, requestInfo) => {
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const { token } = await createPasswordResetToken(user.id);

  const resetURL = `${requestInfo.protocol}://${requestInfo.host}/api/v0/auth/resetPassword/${token}`;

  try {
    await sendPasswordResetEmail(
      { email: user.email, name: user.name },
      resetURL,
    );

    return;
  } catch (err) {
    console.error('FALHA NO SERVIÇO DE E-MAIL:', err);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    throw new AppError(
      'Erro ao enviar email. Tente novamente mais tarde.',
      500,
    );
  }
};

/**
 * Valida um token de reset de senha e atualiza a senha do usuário.
 * @param {string} token - O token de reset recebido do URL.
 * @param {string} password - A nova senha.
 * @returns {Promise<void>}
 */
export const resetUserPassword = async (token, password) => {
  const receivedHashToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await db.user.findFirst({
    where: {
      passwordResetToken: receivedHashToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('O token é inválido ou já expirou', 400);
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      password,
      passwordChangedAt: new Date(),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
};
