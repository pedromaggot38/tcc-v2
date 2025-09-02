import db from '../config/db.js';

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
