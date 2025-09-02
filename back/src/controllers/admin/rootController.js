import db from '../../config/db.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';
import { createSendToken } from '../../utils/controllers/authUtils.js';
import {
  comparePassword,
  validateEmailRemoval,
} from '../../utils/controllers/userUtils.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { checkUniqueness } from '../../services/userService.js';
import { createRootUser, findRootUser } from '../../services/rootService.js';
import { createRootZodSchema } from '../../models/userZodSchema.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
  const validFilterFields = ['username', 'email', 'name', 'role'];
  const validSortFields = ['createdAt', 'username', 'active'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const [totalItems, users] = await db.$transaction([
    db.user.count({ where: { ...filters } }),
    db.user.findMany({
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
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  resfc(res, 200, {
    users,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await db.user.findUnique({ where: { username } });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  resfc(res, 200, { user });
});

export const createUser = catchAsync(async (req, res, next) => {
  const { username, password, name, phone, email, image, role } = req.body;

  await checkUniqueness({ username, email });

  const data = { username, password, name, phone, email, image };

  const requesterRole = req.user.role;

  if (requesterRole === 'root') {
    if (role === 'root') {
      return next(
        new AppError(
          'Não é permitido criar um segundo usuário root no sistema',
          403,
        ),
      );
    }
    data.role = role || 'journalist';
  } else if (requesterRole === 'admin') {
    data.role = 'journalist';
  }

  const newUser = await db.user.create({ data });

  resfc(res, 201, { user: newUser });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const { email, role, ...data } = req.body;

  validateEmailRemoval(req.body, email);

  const targetUser = await db.user.findUnique({ where: { username } });
  if (!targetUser) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  if (email && email !== targetUser.email) {
    await checkUniqueness({ email }, targetUser.id);
    data.email = email;
  }

  if (req.user.role === 'root' && role) {
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
  const rootUser = await findRootUser();

  if (!rootUser) {
    return resfc(
      res,
      200,
      { exists: false },
      'Não há um usuário com a função root no sistema',
    );
  }

  if (rootUser.active === false) {
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
});

export const handleRootCreation = catchAsync(async (req, res, next) => {
  const validatedData = createRootZodSchema.parse(req.body);

  const newUser = await createRootUser(validatedData);

  return createSendToken(newUser, 201, res);
});

export const transferRootRole = catchAsync(async (req, res, next) => {
  const { targetUsername, password } = req.body;
  const currentUserId = req.user.id;

  if (!password) {
    return next(
      new AppError('A sua senha é necessária para confirmar a operação.', 400),
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
  const isPasswordValid = await comparePassword(password, currentUser.password);
  if (!isPasswordValid) {
    return next(new AppError('A senha fornecida está incorreta.', 401));
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
