import db from '../config/db.js';
import AppError from '../utils/appError.js';
import { comparePassword } from '../utils/controllers/userUtils.js';

/**
 * Mascara um endereço de e-mail para exibição em logs.
 * Ex: "usuario.longo@gmail.com" se torna "usu...@gmail.com"
 * @param {string} email O e-mail a ser mascarado.
 * @returns {string} O e-mail mascarado.
 */
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) {
    return 'E-mail inválido';
  }
  const [localPart, domain] = email.split('@');
  const maskedLocalPart =
    localPart.length > 3
      ? localPart.substring(0, 3) + '...'
      : localPart.charAt(0) + '...';

  return `${maskedLocalPart}@${domain}`;
};

/**
 * Verifica a unicidade de um ou mais campos no modelo User.
 * @param {object} fields - Um objeto com os campos a verificar. Ex: { email: 'a@a.com', username: 'user' }
 * @param {string} [currentUserId] - (Opcional) O ID do utilizador a ser ignorado na pesquisa (para atualizações).
 * @returns {Promise<void>} - Lança um AppError se um dos campos já estiver em uso.
 */
export const checkUniqueness = async (fields, currentUserId = null) => {
  const whereClauses = Object.keys(fields).map((key) => ({
    [key]: fields[key],
  }));

  if (whereClauses.length === 0) {
    return;
  }

  const existingUser = await db.user.findFirst({
    where: {
      OR: whereClauses,
    },
  });

  if (existingUser && existingUser.id !== currentUserId) {
    if (fields.username && existingUser.username === fields.username) {
      throw new AppError('Este nome de usuário já está em uso.', 400);
    }
    if (fields.email && existingUser.email === fields.email) {
      throw new AppError('Este e-mail já está em uso.', 400);
    }
  }
};

/**
 * Atualiza a senha de um usuário autenticado.
 * @param {string} userId - O ID do usuário que está alterando a própria senha.
 * @param {string} currentPassword - A senha atual para verificação.
 * @param {string} newPassword - A nova senha a ser definida.
 */
export const updateMyUserPassword = async (
  userId,
  currentPassword,
  newPassword,
) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const isCorrect = await comparePassword(currentPassword, user.password);

  if (!isCorrect) {
    throw new AppError('Senha atual incorreta', 401);
  }

  await db.user.update({
    where: { id: userId },
    data: {
      password: newPassword,
      passwordChangedAt: new Date(),
    },
  });
};
