import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';
import { createSendToken } from '../../utils/controllers/authUtils.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import {
  checkRootStatusService,
  createRootUser,
  createUserService,
  deleteUserAsRootService,
  eligibleForRootTransferService,
  getAllUsersService,
  getUserService,
  transferRootRoleService,
  updateUserPasswordAsRootService,
  updateUserService,
} from '../../services/rootService.js';

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

  await deleteUserAsRootService(username, password, req.user);

  resfc(res, 204);
});

export const eligibleForRootTransfer = catchAsync(async (req, res, next) => {
  const eligibleUsers = await eligibleForRootTransferService();

  resfc(res, 200, { users: eligibleUsers });
});

export const transferRootRole = catchAsync(async (req, res, next) => {
  const { targetUsername, password } = req.body;

  await transferRootRoleService(targetUsername, password, req.user);

  resfc(res, 200, null, 'Papel de root transferido com sucesso');
});
