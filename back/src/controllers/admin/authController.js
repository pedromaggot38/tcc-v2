import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';
import {
  clearAuthCookie,
  createSendToken,
} from '../../utils/controllers/authUtils.js';
import {
  handleForgotPassword,
  loginUser,
  resetUserPassword,
} from '../../services/authService.js';
import { findRootUser } from '../../services/rootService.js';
import { handleRootCreation } from './rootController.js';
import { loginSchema } from '../../models/userZodSchema.js';

/*
export const signUp = catchAsync(async (req, res, next) => {
  const { username, password, email, name, phone, image } = req.body;

  const newUser = await db.user.create({
    data: {
      username,
      password,
      email,
      name,
      phone,
      image,
    },
  });

  createSendToken(newUser, 201, res);
});*/

export const login = catchAsync(async (req, res, next) => {
  const rootUserExists = await findRootUser();

  if (!rootUserExists) {
    return handleRootCreation(req, res, next);
  }

  const { username, password } = loginSchema.parse(req.body);

  const user = await loginUser(username, password);

  createSendToken(user, 200, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  const requestInfo = {
    protocol: req.protocol,
    host: req.get('host'),
  };

  await handleForgotPassword(username, requestInfo);

  resfc(res, 200, null, 'Token enviado para o seu email');
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  await resetUserPassword(token, password);

  resfc(res, 200, null, 'Senha redefinida com sucesso.');
});

export const logout = catchAsync(async (req, res, next) => {
  clearAuthCookie(res);

  return resfc(res, 200, null, 'Logout realizado com sucesso.');
});
