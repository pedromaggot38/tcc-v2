import catchAsync from '../utils/catchAsync.js';
import db from '../config/db.js';
import { resfc } from '../utils/response.js';
import AppError from '../utils/appError.js';

export const getMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  resfc(res, 200, { user });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  const { email, ...data } = req.body;

  if (email && email !== user.email) {
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return next(new AppError('E-mail já está em uso', 400));
    }
    data.email = email;
  }

  const updatedUser = await db.user.update({
    where: { id },
    data,
  });

  resfc(res, 200, { user: updatedUser });
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
        'Não é possível desativar sua conta enquanto você for o único administrador root ativo. Transfira a permissão para outro usuário antes de continuar',
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
