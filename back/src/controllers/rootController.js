// --- Root-only functions ---

import db from '../config/db.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { resfc } from '../utils/response.js';
import { createRootZodSchema } from '../models/userZodSchema.js';
import { createSendToken } from '../utils/controllers/authUtils.js';

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
  const { username, password, name, phone, email, image } = req.body;
  const data = { username, password, name, phone, email, image };

  const isRoot = req.user.role === 'root';

  if (isRoot) {
    if (req.body.role === 'root') {
      return next(new AppError('Você já é o usuário root', 400));
    }

    data.role = req.body.role;
  }

  const newUser = await db.user.create({ data });

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

  const data = {
    name,
    phone,
    email,
    image,
    active,
  };

  if (currentUser.role === 'root' && role) {
    data.role = role;
  }

  const updatedUser = await db.user.update({
    where: { username },
    data,
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

  resfc(res, 200, null, 'Senha de usuário atualizado');
});

export const deleteUserAsRoot = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const user = await db.user.findUnique({ where: { username } });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  if (user.role === 'root') {
    return next(new AppError('Não é possível excluir um usuário root', 400));
  }

  await db.user.delete({ where: { username } });

  resfc(res, 204);
});

export const checkRootExists = catchAsync(async (req, res, next) => {
  const hasRootUser = await db.user.findFirst({ where: { role: 'root' } });

  if (hasRootUser) {
    return resfc(
      res,
      200,
      { exists: true },
      'Já existe um usuário com a função de root.',
    );
  }

  resfc(
    res,
    200,
    { exists: false },
    'Não há usuário com a função de root registrado.',
  );
});

export const handleRootCreation = catchAsync(async (req, res, next) => {
  const validatedData = createRootZodSchema.parse(req.body);

  // eslint-disable-next-line no-unused-vars
  const { passwordConfirm, ...userData } = validatedData;

  const newUser = await db.user.create({
    data: { ...userData, role: 'root' },
  });

  return createSendToken(newUser, 201, res);
});

export const transferRootRole = catchAsync(async (req, res, next) => {
  const currentUserId = req.user.id;
  const isRoot = req.user.role === 'root';
  const targetUsername = req.body.username;

  if (!isRoot) {
    return next(
      new AppError('Você não é um usuário root para transferir o cargo', 403),
    );
  }
  if (!targetUsername) {
    return next(new AppError('Nome de usuário do alvo é obrigatório.', 400));
  }

  const [currentUser, targetUser] = await Promise.all([
    db.user.findUnique({ where: { id: currentUserId } }),
    db.user.findUnique({ where: { username: targetUsername } }),
  ]);

  if (!currentUser) {
    return next(new AppError('Usuário root atual não encontrado', 404));
  }

  if (!targetUser || !targetUser.active) {
    return next(new AppError('Usuário alvo inválido ou inativo', 404));
  }

  if (targetUser.id === currentUserId) {
    return next(new AppError('Você já é o root.', 400));
  }

  if (targetUser.role === 'root') {
    return next(new AppError('Este usuário já é root', 400));
  }

  await db.$transaction([
    db.user.update({
      where: { id: currentUserId },
      data: { role: 'admin' },
    }),
    db.user.update({
      where: { id: targetUser.id },
      data: { role: 'root' },
    }),
  ]);

  resfc(res, 200, null, 'Papel de root transferido com sucesso');
});
