// --- Root-only functions ---

import db from '../config/db.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { resfc } from '../utils/response.js';

export const getAllUsersAsRoot = catchAsync(async (req, res, next) => {});

export const getUserAsRoot = catchAsync(async (req, res, next) => {});

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

  const userToUpdate = await db.user.findUnique({ where: { username } });

  if (!userToUpdate) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  const { name, phone, email, image, role, active } = req.body;

  if (email && email !== userToUpdate.email) {
    const exstingEmail = await db.user.findUnique({ where: { email } });
    if (exstingEmail) {
      return next(new AppError('E-mail já está em uso', 400));
    }
  }

  const updatedUser = await db.user.update({
    where: { username },
    data: {
      username,
      role,
      name,
      phone,
      email,
      image,
      active,
    },
  });

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

  resfc(res, 200, {}, 'Senha de usuário atualizado');
});

export const deleteUserAsRoot = catchAsync(async (req, res, next) => {});
