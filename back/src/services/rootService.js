import db from '../config/db.js';
import AppError from '../utils/appError.js';
import {
  comparePassword,
  validateEmailRemoval,
} from '../utils/controllers/userUtils.js';
import { checkUniqueness } from './userService.js';

const findAnyRootUser = async () => {
  const rootUser = await db.user.findFirst({
    where: { role: 'root' },
  });
  return rootUser;
};

export const checkRootStatusService = async () => {
  const rootUser = await findAnyRootUser();

  if (!rootUser) {
    return {
      exists: false,
      active: null,
      message: 'Não há um usuário root no sistema.',
    };
  }

  if (rootUser.active === false) {
    return {
      exists: true,
      active: false,
      message:
        '⚠️ Atenção: O único usuário root está com a conta desativada. Isso pode comprometer o acesso ao sistema.',
    };
  }

  return {
    exists: true,
    active: true,
    message: 'Já existe um usuário root no sistema.',
  };
};

/**
 * Cria o primeiro usuário 'root' no sistema.
 * @param {object} rootUserData
 * @returns {Promise<object>}
 */
export const createRootUser = async (rootUserData) => {
  const data = { ...rootUserData, role: 'root' };

  const newUser = await db.user.create({
    data,
  });

  return newUser;
};

export const getAllUsersService = async ({ filters, orderBy, skip, limit }) => {
  const [totalItems, users] = await db.$transaction([
    db.user.count({ where: filters }),
    db.user.findMany({
      where: filters,
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

  return { totalItems, users, totalPages };
};

export const getUserService = async (username) => {
  const user = await db.user.findUnique({ where: { username } });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  return user;
};

export const createUserService = async (userData, requesterRole) => {
  const { username, email, role, ...restOfData } = userData;
  await checkUniqueness({ username, email });
  const dataToCreate = { username, email, ...restOfData };

  if (requesterRole === 'root') {
    if (role === 'root') {
      throw new AppError(
        'Não é permitido criar um segundo usuário root no sistema',
        403,
      );
    }
    dataToCreate.role = role || 'journalist';
  } else if (requesterRole === 'admin') {
    dataToCreate.role = 'journalist';
  }

  const newUser = await db.user.create({ data: dataToCreate });

  return newUser;
};

export const updateUserService = async (
  username,
  updateData,
  currentUserRole,
) => {
  validateEmailRemoval(updateData);

  const targetUser = await db.user.findUnique({ where: { username } });

  if (!targetUser) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const { email, role, ...data } = updateData;

  if (email && email !== targetUser.email) {
    await checkUniqueness({ email }, targetUser.id);
  }

  if (role && currentUserRole === 'root') {
    data.role = role;
  }

  const updatedUser = await db.user.update({
    where: { username },
    data,
  });

  return updatedUser;
};

export const updateUserPasswordAsRootService = async (
  username,
  newPassword,
) => {
  const userToUpdate = await db.user.findUnique({
    where: { username },
  });

  if (!userToUpdate) {
    throw new AppError('Usuário não encontrado', 404);
  }

  await db.user.update({
    where: { username },
    data: { newPassword },
  });
};

export const deleteUserAsRootService = async (
  usernameToDelete,
  confirmationPassword,
  currentUser,
) => {
  const targetUser = await db.user.findUnique({
    where: { username: usernameToDelete },
  });

  if (!targetUser) {
    throw new AppError('Usuário não encontrado', 404);
  }

  if (targetUser.role === 'root') {
    throw new AppError('Não é possível excluir um usuário root', 404);
  }

  const isPasswordValid = comparePassword(
    confirmationPassword,
    currentUser.password,
  );

  if (!isPasswordValid) {
    throw new AppError('A senha do usuário root está inválida.', 401);
  }
  await db.user.delete({ where: { username: usernameToDelete } });
};

export const transferRootRole = async () => {};
