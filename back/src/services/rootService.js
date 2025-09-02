import db from '../config/db.js';
import AppError from '../utils/appError.js';
import { checkUniqueness } from './userService.js';

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

export const findRootUser = async () => {
  const rootUser = await db.user.findFirst({
    where: { role: 'root', active: true },
  });
  return rootUser;
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
