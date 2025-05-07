import catchAsync from '../utils/catchAsync.js';
import db from '../config/db.js';
import { resfc } from '../utils/response.js';
import AppError from '../utils/appError.js';

// --- Authenticated user functions ---

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

  const { name, phone, email, image } = req.body;

  if (email && email !== user.email) {
    const exstingEmail = await db.user.findUnique({ where: { email } });
    if (exstingEmail) {
      return next(new AppError('E-mail já está em uso', 400));
    }
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: {
      name,
      phone,
      email,
      image,
    },
  });

  resfc(res, 200, { user: updatedUser });
});

export const deactivateMyAccount = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return next(new AppError('Usuário não encontrado', 404));
  }

  resfc(res, 200, { user });
});
