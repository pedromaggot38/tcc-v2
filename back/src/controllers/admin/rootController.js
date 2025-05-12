import db from '../../config/db.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';
import {
  createRootZodSchema,
  updateUserPasswordAsRootZodSchema,
} from '../../models/userZodSchema.js';
import { createSendToken } from '../../utils/controllers/authUtils.js';
import { comparePassword } from '../../utils/controllers/userUtils.js';
import { parseQueryParams } from '../../utils/queryParser.js';

export const getAllUsersAsRoot = catchAsync(async (req, res, next) => {
  const validFilterFields = ['username', 'email', 'name', 'role'];
  const validSortFields = ['createdAt', 'username', 'active'];

  const { skip, limit, orderBy, filters } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const users = await db.user.findMany({
    where: { ...filters },
    skip,
    take: limit,
    orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      name: true,
      phone: true,
      email: true,
      image: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });

  resfc(res, 200, { users }, null, users.length);
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
    ['admin', 'root'].includes(targetUser.role)
  ) {
    return next(
      new AppError('Você não tem permissão para editar este usuário', 403),
    );
  }

  const { email, role, ...data } = req.body;

  if (email && email !== targetUser.email) {
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return next(new AppError('E-mail já está em uso', 400));
    }
    data.email = email;
  }

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

  const result = updateUserPasswordAsRootZodSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(result.error.errors[0].message, 400));
  }

  const { password } = req.body;

  await db.user.update({
    where: { username },
    data: { password },
  });

  resfc(res, 200, null, 'Senha de usuário atualizada');
});

export const deleteUserAsRoot = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const { password } = req.body;

  if (!username) {
    return next(new AppError('É necessário fornecer o nome de usuário', 400));
  }
  if (!password) {
    return next(
      new AppError('É necessário fornecer a senha de usuário root', 400),
    );
  }

  const targetUser = await db.user.findUnique({ where: { username } });
  if (!targetUser) {
    return next(new AppError('Usuário não encontrado', 404));
  }
  if (targetUser.role === 'root') {
    return next(new AppError('Não é possível excluir um usuário root', 400));
  }

  const currentUser = req.user;
  const isPasswordValid = await comparePassword(password, currentUser.password);

  if (!isPasswordValid) {
    return next(new AppError('Senha de usuário root inválida', 400));
  }

  await db.user.delete({ where: { username } });

  resfc(res, 204);
});

export const checkRootExists = catchAsync(async (req, res, next) => {
  const hasRootUser = await db.user.findFirst({ where: { role: 'root' } });

  if (hasRootUser) {
    if (hasRootUser.active === 'false') {
      return resfc(
        res,
        200,
        { exists: true },
        '⚠️ Atenção: O único usuário com função de root está com a conta desativada. Isso pode comprometer o acesso administrativo ao sistema. Entre em contato com a equipe de T.I. imediatamente para restaurar o acesso.',
      );
    }
    return resfc(
      res,
      200,
      { exists: true },
      'Já existe um usuário com a função de root',
    );
  }

  resfc(
    res,
    200,
    { exists: false },
    'Não há usuário com a função de root registrado',
  );
});

export const handleRootCreation = catchAsync(async (req, res, next) => {
  const validatedData = createRootZodSchema.parse(req.body);
  // eslint-disable-next-line no-unused-vars
  const { passwordConfirm, ...userData } = validatedData;

  const data = { ...userData, role: 'root' };

  const newUser = await db.user.create({
    data,
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

export const eligibleForRootTransfer = catchAsync(async (req, res, next) => {
  const elegibleUsers = await db.user.findMany({
    where: {
      role: 'admin',
      active: true,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      image: true,
    },
  });

  resfc(res, 200, { users: elegibleUsers });
});
