import db from '../../config/db.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';
import { createSendToken } from '../../utils/controllers/authUtils.js';
import { comparePassword } from '../../utils/controllers/userUtils.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import {
  checkRootStatusService,
  createRootUser,
  createUserService,
  deleteUserAsRootService,
  getAllUsersService,
  getUserService,
  updateUserPasswordAsRootService,
  updateUserService,
} from '../../services/rootService.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
  const validFilterFields = ['username', 'email', 'name', 'role'];
  const validSortFields = ['createdAt', 'username', 'active'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const { totalItems, users, totalPages } = await getAllUsersService({
    filters,
    orderBy,
    skip,
    limit,
  });

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

  const user = await getUserService(username);

  resfc(res, 200, { user });
});

export const createUser = catchAsync(async (req, res, next) => {
  const userData = req.body;

  const newUser = await createUserService(userData, req.user.role);

  resfc(res, 201, { user: newUser });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const updatedUser = await updateUserService(
    username,
    req.body,
    req.user.role,
  );

  resfc(res, 200, { user: updatedUser });
});

export const updateUserPasswordAsRoot = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('O campo de senha é obrigatório', 400));
  }

  await updateUserPasswordAsRootService(username, password);

  resfc(res, 200, null, 'Senha de usuário atualizada com sucesso');
});

export const deleteUserAsRoot = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('A senha de confirmação é obrigatória', 400));
  }

  await deleteUserAsRootService(username, password, req.user);

  resfc(res, 204);
});

export const checkRootExists = catchAsync(async (req, res, next) => {
  const status = await checkRootStatusService();

  resfc(
    res,
    200,
    { exists: status.exists, active: status.active },
    status.message,
  );
});

export const handleRootCreation = catchAsync(async (req, res, next) => {
  const data = req.body;

  const newUser = await createRootUser(data);

  return createSendToken(newUser, 201, res);
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

export const transferRootRole = catchAsync(async (req, res, next) => {
  const { targetUsername, password } = req.body;
  const currentUserId = req.user.id;

  if (!password) {
    return next(
      new AppError('A sua senha é necessária para confirmar a operação', 400),
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
