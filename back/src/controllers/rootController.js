// --- Root-only functions ---

import db from '../config/db.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { resfc } from '../utils/response.js';

export const getAllUsersAsRoot = catchAsync(async (req, res, next) => {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  resfc(res, 200, { users });
});

export const getUserAsRoot = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await db.user.findUnique({ where: { username } });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  resfc(res, 200, { user });
});

export const createUserAsRoot = catchAsync(async (req, res, next) => {
  const { username, password, role, name, phone, email, image } = req.body;

  const newUser = await db.user.create({
    data: {
      username,
      password,
      role,
      name,
      phone,
      email,
      image,
    },
  });

  resfc(res, 201, { user: newUser });
});

export const updateUserAsRoot = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const targetUser = await db.user.findUnique({ where: { username } });

  if (!targetUser) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  const currentUser = req.user;

  if (
    currentUser.role === 'admin' &&
    (targetUser.role === 'admin' || targetUser.role === 'root')
  ) {
    return next(
      new AppError('Você não tem permissão para editar este usuário', 403),
    );
  }

  const { name, phone, email, image, role, active } = req.body;

  if (email && email !== targetUser.email) {
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return next(new AppError('E-mail já está em uso', 400));
    }
  }

  const updatedUser = await db.user.update({
    where: { username },
    data: {
      name,
      phone,
      email,
      image,
      active,
    },
  });

  if (currentUser.role === 'root' && role) {
    updatedUser.role = role;
  }

  resfc(res, 200, { user: updatedUser });
});

export const updateUserPasswordAsRoot = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const userToUpdate = await db.user.findUnique({ where: { username } });

  if (!userToUpdate) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  const { password } = req.body;

  await db.user.update({
    where: { username },
    data: { password },
  });

  resfc(res, 200, null, 'Senha de usuário atualizado');
});

export const deleteUserAsRoot = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const user = await db.user.findUnique({ where: { username } });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  await db.user.delete({ where: { username } });

  resfc(res, 204);
});
