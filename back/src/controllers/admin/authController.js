import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../../config/db.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';
import {
  comparePassword,
  createPasswordResetToken,
} from '../../utils/controllers/userUtils.js';
import { createSendToken } from '../../utils/controllers/authUtils.js';
import { handleRootCreation } from './rootController.js';
import { sendPasswordResetEmail } from '../../utils/emailService.js';

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
  const hasRootUser = await db.user.findFirst({ where: { role: 'root' } });

  if (!hasRootUser) {
    return handleRootCreation(req, res, next);
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return next(
      new AppError('Por favor, informe nome de usuário e senha', 401),
    );
  }

  const user = await db.user.findUnique({
    where: { username, active: true },
    select: {
      id: true,
      username: true,
      password: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Credenciais inválidas', 403));
  }

  createSendToken(user, 200, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { username } = req.body;

  const user = await db.user.findUnique({
    where: { username },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  const { token } = await createPasswordResetToken(user.id);

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v0/auth/resetPassword/${token}`;

  try {
    await sendPasswordResetEmail(
      { email: user.email, name: user.name },
      resetURL,
    );

    resfc(res, 200, null, 'Token enviado para o seu email');
  } catch (err) {
    console.error('ERRO DETALHADO DO CATCH:', err);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return next(
      new AppError('Erro ao enviar email. Tente novamente mais tarde.', 500),
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError('Por favor, informe a nova senha e a confirmação', 400),
    );
  }

  if (password !== passwordConfirm) {
    return next(new AppError('As senhas não coincidem', 400));
  }

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
    return next(new AppError('O token é inválido ou já expirou', 400));
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
  resfc(res, 200, null, 'Senha redefinida com sucesso.');
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      password: true,
    },
  });
  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  const { currentPassword, password } = req.body;

  const isCorrect = await comparePassword(currentPassword, user.password);

  if (!isCorrect) {
    return next(new AppError('Senha atual incorreta', 401));
  }

  await db.user.update({
    where: { id: userId },
    data: { password, passwordChangedAt: new Date() },
  });

  resfc(res, 200, null, 'Senha alterada com sucesso');
});

export const logout = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    httpOnly: true,
    path: '/api/v0/admin',
    sameSite: 'Strict',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.clearCookie('jwt', cookieOptions);

  return resfc(res, 200, null, 'Logout realizado com sucesso.');
});
