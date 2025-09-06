import jwt from 'jsonwebtoken';
import { resfc } from '../response.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    path: '/api/v1/admin',
    sameSite: 'Strict',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  const safeUser = {
    ...user,
    password: undefined,
    active: undefined,
  };

  return resfc(res, statusCode, { user: safeUser, token });
};

/**
 * Limpa o cookie de autenticação do cliente.
 * @param {object} res - O objeto de resposta do Express.
 */
export const clearAuthCookie = (res) => {
  const cookieOptions = {
    httpOnly: true,
    path: '/api/v1/admin',
    sameSite: 'Strict',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.clearCookie('jwt', cookieOptions);
};
