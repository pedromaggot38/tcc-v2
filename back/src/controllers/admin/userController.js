import catchAsync from '../../utils/catchAsync.js';
import db from '../../config/db.js';
import { resfc } from '../../utils/response.js';
import AppError from '../../utils/appError.js';
import { validateEmailRemoval } from '../../utils/controllers/userUtils.js';
import {
  checkUniqueness,
  updateUserPassword,
} from '../../services/userService.js';

export const getMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      active: true,
    },
  });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  resfc(res, 200, { user });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { email, ...data } = req.body;

  validateEmailRemoval(req.body, email);

  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  if (email && email !== user.email) {
    await checkUniqueness({ email }, id);
    data.email = email;
  }

  const updatedUser = await db.user.update({
    where: { id },
    data,
  });

  resfc(res, 200, { user: updatedUser });
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password: newPassword } = req.body;
  const userId = req.user.id;

  await updateUserPassword(userId, currentPassword, newPassword);

  resfc(res, 200, null, 'Senha alterada com sucesso');
});

export const deactivateMyAccount = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  if (user.role === 'root') {
    return next(
      new AppError(
        'Não é possível desativar sua conta enquanto você for o root. Transfira a permissão para outro usuário antes de continuar',
        403,
      ),
    );
  }

  await db.user.update({
    where: { id },
    data: {
      active: false,
    },
  });

  resfc(res, 200, null, 'Conta desativada com sucesso');
});
