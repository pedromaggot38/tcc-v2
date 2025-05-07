import catchAsync from '../utils/catchAsync.js';
import db from '../config/db.js';
import { hashPassword } from '../utils/controllers/userUtils.js';
import { resfc } from '../utils/response.js';
import AppError from '../utils/appError.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await db.user.findMany({
    include: {
      articles: true,
    },
  });

  // eslint-disable-next-line no-unused-vars
  const safeUsers = users.map(({ password, ...rest }) => rest);

  resfc(res, 200, { users }, null, users.length);
});

// --- Authenticated user functions ---

// --- Root-only functions ---

export const createUserAsRoot = catchAsync(async (req, res, next) => {
  const { username, password, role, name, phone, email, image } = req.body;

  const hashedPassword = await hashPassword(password);

  const newUser = await db.user.create({
    data: {
      username,
      password: hashedPassword,
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
  const { name, phone, email, image, role, active } = req.body;

  const userToUpdate = await db.user.findUnique({ where: { username } });

  if (!userToUpdate) {
    return next(new AppError('Usuário não encontrado', 404));
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
  const { password } = req.body;

  const userToUpdate = await db.user.findUnique({ where: { username } });

  if (!userToUpdate) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  await db.user.update({
    where: { username },
    data: { password },
  });

  resfc(res, 200, {}, 'Senha de usuário atualizado');
});
